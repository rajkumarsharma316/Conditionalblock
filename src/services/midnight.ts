import { type WalletContext, config } from './walletService';
import { Contract, ledger as getLedger } from '../compiled/escrow/contract/index.js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { type MidnightProvider, type WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { BrowserZkConfigProvider } from './BrowserZkConfigProvider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { MidnightBech32m, ShieldedAddress, ShieldedCoinPublicKey, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Initialize network ID for the Midnight SDK
setNetworkId('undeployed');

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

const escrowCompiledContract = CompiledContract.make('escrow', Contract).pipe(
    CompiledContract.withVacantWitnesses
);

export async function initializeProviders(walletContext: WalletContext): Promise<EscrowProviders> {
    let walletAndMidnightProvider: WalletProvider & MidnightProvider;
    
    if (walletContext.type === 'lace') {
        let coinPk: string;
        let encPk: string;
        if (typeof walletContext.api.state === 'function') {
            const state = await walletContext.api.state();
            coinPk = state.coinPublicKey;
            encPk = state.encryptionPublicKey;
        } else {
            const addrs = await (walletContext.api as any).getShieldedAddresses();
            coinPk = addrs.shieldedCoinPublicKey;
            encPk = addrs.shieldedEncryptionPublicKey;
        }

        walletAndMidnightProvider = {
            getCoinPublicKey: () => coinPk as any,
            getEncryptionPublicKey: () => encPk as any,
            async balanceTx(tx, _ttl?) {
                const serializedTx = tx.serialize();
                let result;
                if (typeof walletContext.api.balanceAndProveTransaction === 'function') {
                    result = await walletContext.api.balanceAndProveTransaction(serializedTx as any, []);
                } else {
                    result = await (walletContext.api as any).balanceUnsealedTransaction(serializedTx as any);
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
            privateStoragePasswordProvider: async () => 'Local-Devnet-Development-Placeholder-1',
            accountId: 'placeholder-account-id',
        } as any),
        publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
        walletProvider: walletAndMidnightProvider,
        midnightProvider: walletAndMidnightProvider,
    };
}

export function tryDecodeAddressToHex(address: string, networkId: string = 'undeployed'): string {
    if (/^[0-9a-fA-F]{64}$/.test(address)) {
        return address;
    }
    if (address.startsWith('mn_')) {
        try {
            const parsed = MidnightBech32m.parse(address);
            if (address.includes('mn_shield-cpk')) {
                return ShieldedCoinPublicKey.codec.decode(networkId, parsed).toHexString();
            } else if (address.includes('mn_shield-addr')) {
                return ShieldedAddress.codec.decode(networkId, parsed).coinPublicKey.toHexString();
            } else if (address.includes('mn_addr')) {
                return UnshieldedAddress.codec.decode(networkId, parsed).data.toString('hex');
            }
        } catch (e) {
            console.error("Failed to decode Bech32m address:", e);
        }
    }
    return address;
}

export async function deployEscrowContract(providers: EscrowProviders, beneficiary: string, amount: bigint): Promise<any> {
    console.log('Deploying escrow contract...');
    const hexBeneficiary = tryDecodeAddressToHex(beneficiary);
    const beneficiaryBytes = Buffer.from(hexBeneficiary, 'hex');
    if (beneficiaryBytes.length !== 32) {
        throw new Error(`Beneficiary must be exactly 32 bytes (64 hex characters). Got ${beneficiaryBytes.length}`);
    }

    const escrowContract = await deployContract(providers, {
        privateStateId: 'escrowPrivateState',
        compiledContract: escrowCompiledContract as any,
        initialPrivateState: {},
        args: [beneficiaryBytes, amount],
    });
    console.log(`Deployed contract at address: ${escrowContract.deployTxData.public.contractAddress}`);
    return escrowContract;
}

export async function getEscrowState(providers: EscrowProviders, contractAddress: string): Promise<EscrowState> {
    const state = await providers.publicDataProvider
        .queryContractState(contractAddress)
        .then((contractState: any) => (contractState != null ? getLedger(contractState.data) : null));

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
