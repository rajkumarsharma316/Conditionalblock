import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { UnshieldedWallet, createKeystore, PublicKey, InMemoryTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import * as ledger from '@midnight-ntwrk/ledger';
import { getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as Rx from 'rxjs';
import type { DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';

// For testnet, we connect to Midnight nodes. In an actual production scenario,
// these would be configurable via environment variables.
export const config = {
    indexer: 'http://localhost:8088/api/v1/graphql',
    indexerWS: 'ws://localhost:8088/api/v1/graphql',
    node: 'http://localhost:9944',
    proofServer: 'http://localhost:6300',
};

const WALLET_SEED_KEY = 'midnight_wallet_seed';

export function getOrCreateSeed(): string {
    let seed = localStorage.getItem(WALLET_SEED_KEY);
    if (!seed) {
        const testSeed = '0000000000000000000000000000000000000000000000000000000000000001';
        seed = testSeed;
        localStorage.setItem(WALLET_SEED_KEY, seed);
    }
    return seed;
}

function deriveKeysFromSeed(seed: string) {
    const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
    if (hdWallet.type !== 'seedOk') throw new Error('Failed to init HDWallet');
    
    const derivationResult = hdWallet.hdWallet
        .selectAccount(0)
        .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
        .deriveKeysAt(0);
        
    if (derivationResult.type !== 'keysDerived') throw new Error('Failed to derive keys');
    
    hdWallet.hdWallet.clear();
    return derivationResult.keys;
}

const buildShieldedConfig = () => ({
    networkId: getNetworkId(),
    indexerClientConnection: {
        indexerHttpUrl: config.indexer,
        indexerWsUrl: undefined as any,
    },
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, 'ws')),
});

const buildUnshieldedConfig = () => ({
    networkId: getNetworkId(),
    indexerClientConnection: {
        indexerHttpUrl: config.indexer,
        indexerWsUrl: undefined as any,
    },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
});

const buildDustConfig = () => ({
    networkId: getNetworkId(),
    costParameters: {
        additionalFeeOverhead: 300_000_000_000_000n,
        feeBlocksMargin: 5,
    },
    indexerClientConnection: {
        indexerHttpUrl: config.indexer,
        indexerWsUrl: undefined as any,
    },
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, 'ws')),
});

export type WalletContext =
    | {
        type: 'local';
        wallet: WalletFacade;
        shieldedSecretKeys: ledger.ZswapSecretKeys;
        dustSecretKey: ledger.DustSecretKey;
        unshieldedKeystore: any;
        seed: string;
    }
    | {
        type: 'lace';
        api: DAppConnectorWalletAPI;
    };

export async function createWallet(seed?: string): Promise<WalletContext> {
    const walletSeed = seed || getOrCreateSeed();
    const keys = deriveKeysFromSeed(walletSeed);

    const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());

    const shieldedWallet = ShieldedWallet(buildShieldedConfig()).startWithSecretKeys(shieldedSecretKeys);
    const unshieldedWallet = UnshieldedWallet(buildUnshieldedConfig()).startWithPublicKey(
        PublicKey.fromKeyStore(unshieldedKeystore),
    );
    const dustWallet = DustWallet(buildDustConfig()).startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust,
    );

    const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
    await wallet.start(shieldedSecretKeys, dustSecretKey);

    return { type: 'local', wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore, seed: walletSeed };
}

export async function createLaceWalletContext(api: DAppConnectorWalletAPI): Promise<WalletContext> {
    return { type: 'lace', api };
}

export async function getShieldedAddress(ctx: WalletContext): Promise<string> {
    if (ctx.type === 'local') {
        const state = await Rx.firstValueFrom(ctx.wallet.state());
        return state.shielded.coinPublicKey.toHexString();
    } else {
        if (typeof ctx.api.state === 'function') {
            const state = await ctx.api.state();
            return state.coinPublicKey;
        } else if (typeof (ctx.api as any).getShieldedAddresses === 'function') {
            const addresses = await (ctx.api as any).getShieldedAddresses();
            return addresses.shieldedCoinPublicKey;
        } else {
            throw new Error('Unknown Lace API structure');
        }
    }
}
