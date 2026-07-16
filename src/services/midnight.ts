import { NetworkId, Transaction } from '@midnight-ntwrk/midnight-js-network-id';
import { type WalletContext, config } from './walletService';
import { Escrow } from '../compiled/escrow/contract/index.js';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { type MidnightProvider, type WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { BrowserZkConfigProvider } from './BrowserZkConfigProvider';

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

export async function initializeProviders(walletContext: WalletContext): Promise<EscrowProviders> {
    let walletAndMidnightProvider: WalletProvider & MidnightProvider;
    
    if (walletContext.type === 'lace') {
        walletAndMidnightProvider = {
            getCoinPublicKey: async () => {
                let pk: string;
                if (typeof walletContext.api.state === 'function') {
                    pk = (await walletContext.api.state()).coinPublicKey;
                } else {
                    pk = (await (walletContext.api as any).getShieldedAddresses()).shieldedCoinPublicKey;
                }
                // Convert hex string to CoinPublicKey object if required by lace connector in V4
                return pk as any;
            },
            getEncryptionPublicKey: async () => {
                let pk: string;
                if (typeof walletContext.api.state === 'function') {
                    pk = (await walletContext.api.state()).encryptionPublicKey;
                } else {
                    pk = (await (walletContext.api as any).getShieldedAddresses()).shieldedEncryptionPublicKey;
                }
                return pk as any;
            },
            async balanceTx(tx, _ttl?) {
                const serializedTx = tx.serialize();
                let result;
                if (typeof walletContext.api.balanceAndProveTransaction === 'function') {
                    result = await walletContext.api.balanceAndProveTransaction(serializedTx as any, []);
                } else {
                    result = await (walletContext.api as any).balanceUnsealedTransaction(serializedTx as any);
                }
                if (result instanceof Uint8Array || (result && (result as any).length !== undefined && !((result as any) instanceof Transaction))) {
                    return Transaction.deserialize(result as Uint8Array, NetworkId.Undeployed);
                }
                return result;
            },
            async submitTx(tx) {
                const result = await walletContext.api.submitTransaction(tx as any);
                return Array.isArray(result) ? result[0] : result;
            },
        };
    } else {
        walletAndMidnightProvider = {
            getCoinPublicKey: () => walletContext.shieldedSecretKeys.coinPublicKey,
            getEncryptionPublicKey: () => walletContext.shieldedSecretKeys.encryptionPublicKey,
            async balanceTx(tx, ttl?) {
                const recipe = await walletContext.wallet.balanceUnboundTransaction(
                    tx,
                    { shieldedSecretKeys: walletContext.shieldedSecretKeys, dustSecretKey: walletContext.dustSecretKey },
                    { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) }
                );
                return walletContext.wallet.finalizeRecipe(recipe);
            },
            submitTx: (tx) => walletContext.wallet.submitTransaction(tx) as any,
        };
    }

    const zkConfigProvider = new BrowserZkConfigProvider('/managed/escrow');

    return {
        privateStateProvider: levelPrivateStateProvider({
            privateStateStoreName: 'escrowPrivateState',
        }),
        publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(config.proofServer),
        walletProvider: walletAndMidnightProvider,
        midnightProvider: walletAndMidnightProvider,
    };
}

export async function deployEscrowContract(providers: EscrowProviders, beneficiary: string, amount: bigint): Promise<any> {
    console.log('Deploying escrow contract...');
    // beneficiary is passed as a hex string from UI (like shielded coin public key)
    // we need to convert it to a Uint8Array of length 32 for Bytes<32> in compact
    const beneficiaryBytes = Buffer.from(beneficiary, 'hex');
    if (beneficiaryBytes.length !== 32) {
        throw new Error(`Beneficiary must be exactly 32 bytes (64 hex characters). Got ${beneficiaryBytes.length}`);
    }

    const escrowContract = await deployContract(providers, {
        privateStateId: 'escrowPrivateState',
        compiledContract: Escrow.contract as any,
        initialPrivateState: {},
        args: [beneficiaryBytes, amount],
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

    return {
        depositor: Buffer.from(state.depositor).toString('hex'),
        beneficiary: Buffer.from(state.beneficiary).toString('hex'),
        amount: state.amount,
        isLocked: state.isLocked,
    };
}

export async function releaseEscrowFunds(contract: any): Promise<void> {
    console.log(`Releasing escrow funds...`);
    const finalizedTxData = await (contract as any).callTx.releaseFunds();
    console.log(`Funds released! Transaction ${finalizedTxData.public.txId}`);
}
