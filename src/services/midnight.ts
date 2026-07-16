import { NetworkId, Transaction } from '@midnight-ntwrk/ledger';
import { type WalletContext } from './walletService';
import { Escrow } from '../compiled/escrow';
import * as ledger from '@midnight-ntwrk/ledger';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { type MidnightProvider, type WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { CompiledContract } from '@midnight-ntwrk/compact-runtime';
import { config } from './walletService';
import { BrowserZkConfigProvider } from './BrowserZkConfigProvider';
import * as Rx from 'rxjs';

export interface EscrowState {
    depositor: string;
    beneficiary: string;
    amount: bigint;
    isLocked: boolean;
}

export interface EscrowProviders {
    privateStateProvider: any;
    publicDataProvider: any;
    zkConfigProvider: any;
    proofProvider: any;
    walletProvider: WalletProvider & MidnightProvider;
    midnightProvider: WalletProvider & MidnightProvider;
}

// In a real scenario, this would use the real compiled contract ZK assets
const escrowCompiledContract = CompiledContract.make('escrow', Escrow.Contract).pipe(
    CompiledContract.withVacantWitnesses
);

// Sign transaction intents for Midnight Network (Unshielded/Shielded balance)
const signTransactionIntents = (
    tx: { intents?: Map<number, any> },
    signFn: (payload: Uint8Array) => ledger.Signature,
    proofMarker: 'proof' | 'pre-proof',
): void => {
    if (!tx.intents || tx.intents.size === 0) return;
    for (const segment of tx.intents.keys()) {
        const intent = tx.intents.get(segment);
        if (!intent) continue;
        const cloned = ledger.Intent.deserialize<ledger.SignatureEnabled, ledger.Proofish, ledger.PreBinding>(
            'signature',
            proofMarker,
            'pre-binding',
            intent.serialize(),
        );
        const sigData = cloned.signatureData(segment);
        const signature = signFn(sigData);
        if (cloned.fallibleUnshieldedOffer) {
            const sigs = cloned.fallibleUnshieldedOffer.inputs.map(
                (_: ledger.UtxoSpend, i: number) => cloned.fallibleUnshieldedOffer!.signatures.at(i) ?? signature,
            );
            cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(sigs);
        }
        if (cloned.guaranteedUnshieldedOffer) {
            const sigs = cloned.guaranteedUnshieldedOffer.inputs.map(
                (_: ledger.UtxoSpend, i: number) => cloned.guaranteedUnshieldedOffer!.signatures.at(i) ?? signature,
            );
            cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
        }
        tx.intents.set(segment, cloned);
    }
};

async function createWalletAndMidnightProvider(ctx: WalletContext): Promise<WalletProvider & MidnightProvider> {
    if (ctx.type === 'lace') {
        console.log('Using Lace wallet provider...');
        let coinPublicKey: string;
        let encryptionPublicKey: string;

        if (typeof ctx.api.state === 'function') {
            const state = await ctx.api.state();
            coinPublicKey = state.coinPublicKey;
            encryptionPublicKey = state.encryptionPublicKey;
        } else if (typeof (ctx.api as any).getShieldedAddresses === 'function') {
            const addresses = await (ctx.api as any).getShieldedAddresses();
            coinPublicKey = addresses.shieldedCoinPublicKey;
            encryptionPublicKey = addresses.shieldedEncryptionPublicKey;
        } else {
            throw new Error('Unknown Lace API structure');
        }

        return {
            getCoinPublicKey: () => coinPublicKey,
            getEncryptionPublicKey: () => encryptionPublicKey,
            async balanceTx(tx, _ttl?) {
                const networkId = NetworkId.Undeployed;
                const serializedTx = tx.serialize();
                let result;
                if (typeof ctx.api.balanceAndProveTransaction === 'function') {
                    result = await ctx.api.balanceAndProveTransaction(serializedTx as any, []);
                } else if (typeof (ctx.api as any).balanceUnsealedTransaction === 'function') {
                    result = await (ctx.api as any).balanceUnsealedTransaction(serializedTx as any);
                } else {
                    throw new Error('Unknown Lace API structure: cannot find balance method');
                }

                if (result instanceof Uint8Array || (result && (result as any).length !== undefined && !((result as any) instanceof Transaction))) {
                    return Transaction.deserialize(result as Uint8Array, networkId);
                }
                return result;
            },
            async submitTx(tx) {
                const result = await ctx.api.submitTransaction(tx as any);
                return Array.isArray(result) ? result[0] : result;
            },
        };
    }

    // Local Wallet Fallback
    console.log('Waiting for local wallet to sync...');
    const syncTimeout = 30000;
    const state = await Promise.race([
        Rx.firstValueFrom(ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced))),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Wallet sync timeout')), syncTimeout))
    ]);

    return {
        getCoinPublicKey: () => state.shielded.coinPublicKey.toHexString(),
        getEncryptionPublicKey: () => state.shielded.encryptionPublicKey.toHexString(),
        async balanceTx(tx, ttl?) {
            const recipe = await ctx.wallet.balanceUnboundTransaction(
                tx,
                { shieldedSecretKeys: ctx.shieldedSecretKeys, dustSecretKey: ctx.dustSecretKey },
                { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
            );
            const signFn = (payload: Uint8Array) => ctx.unshieldedKeystore.signData(payload);
            signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
            if (recipe.balancingTransaction) {
                signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
            }
            return ctx.wallet.finalizeRecipe(recipe);
        },
        submitTx: (tx) => ctx.wallet.submitTransaction(tx) as any,
    };
}

export async function initializeProviders(walletContext: WalletContext): Promise<EscrowProviders> {
    const walletAndMidnightProvider = await createWalletAndMidnightProvider(walletContext);
    const zkConfigProvider = new BrowserZkConfigProvider('/managed');

    return {
        privateStateProvider: levelPrivateStateProvider({
            privateStateStoreName: 'escrowPrivateState',
            walletProvider: walletAndMidnightProvider,
        }),
        publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
        walletProvider: walletAndMidnightProvider,
        midnightProvider: walletAndMidnightProvider,
    };
}

export async function deployEscrowContract(providers: EscrowProviders, beneficiary: string, amount: bigint): Promise<any> {
    console.log('Deploying escrow contract...');
    const escrowContract = await deployContract(providers, {
        compiledContract: escrowCompiledContract as any,
        privateStateId: 'escrowPrivateState',
        initialPrivateState: {},
        args: [beneficiary, amount],
    });
    console.log(`Deployed contract at address: ${escrowContract.deployTxData.public.contractAddress}`);
    return escrowContract;
}

export async function getEscrowState(providers: EscrowProviders, contractAddress: string): Promise<EscrowState> {
    const state = await providers.publicDataProvider
        .queryContractState(contractAddress)
        .then((contractState: any) => (contractState != null ? Escrow.ledger(contractState.data) : null));

    if (!state) {
        return { depositor: '', beneficiary: '', amount: 0n, isLocked: true };
    }

    return state;
}

export async function releaseEscrowFunds(contract: any): Promise<void> {
    console.log(`Releasing escrow funds...`);
    const finalizedTxData = await (contract as any).callTx.releaseFunds();
    console.log(`Funds released! Transaction ${finalizedTxData.public.txId}`);
}
