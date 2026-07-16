import { Buffer } from 'buffer';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
    WalletFacade,
    DustWallet,
    HDWallet,
    Roles,
    ShieldedWallet,
    createKeystore,
    NoOpTransactionHistoryStorage,
    PublicKey,
    UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk';
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

export type WalletContext =
    | {
          type: 'local';
          wallet: Awaited<ReturnType<typeof WalletFacade.init>>;
          shieldedSecretKeys: ReturnType<typeof ledger.ZswapSecretKeys.fromSeed>;
          dustSecretKey: ReturnType<typeof ledger.DustSecretKey.fromSeed>;
          unshieldedKeystore: ReturnType<typeof createKeystore>;
          seed: string;
      }
    | {
          type: 'lace';
          api: DAppConnectorWalletAPI;
      };

export async function createWallet(seed?: string): Promise<WalletContext> {
    const walletSeed = seed || getOrCreateSeed();
    const keys = deriveKeysFromSeed(walletSeed);
    const networkId = getNetworkId();

    const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

    const walletConfig = {
        networkId,
        indexerClientConnection: {
            indexerHttpUrl: config.indexer,
            indexerWsUrl: config.indexerWS,
        },
        provingServerUrl: new URL(config.proofServer),
        relayURL: new URL(config.node.replace(/^http/, 'ws')),
        txHistoryStorage: new NoOpTransactionHistoryStorage(),
        costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    };

    const wallet = await WalletFacade.init({
        configuration: walletConfig,
        shielded: async (c) => ShieldedWallet(c).startWithSecretKeys(shieldedSecretKeys),
        unshielded: async (c) => UnshieldedWallet(c).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
        dust: async (c) => DustWallet(c).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
    });

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
