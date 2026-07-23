/**
 * deploy-escrow.mjs — Deploys the ConditionalBlock escrow to the local devnet.
 * Run from Conditionalblock directory: node scripts/deploy-escrow.mjs
 *
 * Requires: devnet Docker containers running (node:9944, indexer:8088, proof-server:6300)
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { Buffer } from 'node:buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// ── SDK imports from Conditionalblock's own node_modules ───────────────────
const req = createRequire(import.meta.url);

const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');
const { httpClientProofProvider } = await import('@midnight-ntwrk/midnight-js-http-client-proof-provider');
const { indexerPublicDataProvider } = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
const { NodeZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-node-zk-config-provider');
const { CompiledContract } = await import('@midnight-ntwrk/midnight-js-protocol/compact-js');
const { setNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
const ledger = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
const {
  WalletFacade, DustWallet, HDWallet, Roles, ShieldedWallet,
  createKeystore, NoOpTransactionHistoryStorage, PublicKey, UnshieldedWallet
} = await import('@midnight-ntwrk/wallet-sdk');

// Node.js WebSocket polyfill
const { WebSocket } = await import('ws').catch(() => ({ WebSocket: global.WebSocket }));
// @ts-ignore
globalThis.WebSocket = WebSocket;

// ── Network config ─────────────────────────────────────────────────────────
const networkConfig = {
  networkId: 'undeployed',
  indexer:    'http://127.0.0.1:8088/api/v1/graphql',
  indexerWS:  'ws://127.0.0.1:8088/api/v1/graphql',
  node:       'ws://127.0.0.1:9944',
  proofServer:'http://127.0.0.1:6300',
};

setNetworkId('undeployed');

// ── Compiled contract ─────────────────────────────────────────────────────
const escrowZkPath = path.join(root, 'src', 'compiled', 'escrow');
const contractPath = path.join(escrowZkPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error(`❌ No compiled contract at: ${contractPath}`);
  process.exit(1);
}

const EscrowModule = await import(pathToFileURL(contractPath).href);
const compiledContract = CompiledContract.make('escrow', EscrowModule.Contract).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(escrowZkPath),
);

// ── Wallet setup ──────────────────────────────────────────────────────────
const SEED = '0000000000000000000000000000000000000000000000000000000000000001';

function deriveKeys(seed) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function createWallet() {
  const keys = deriveKeys(SEED);
  const networkId = 'undeployed';
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

  const walletConfig = {
    networkId,
    indexerClientConnection: {
      indexerHttpUrl: networkConfig.indexer,
      indexerWsUrl: networkConfig.indexerWS,
    },
    provingServerUrl: new URL(networkConfig.proofServer),
    relayURL: new URL(networkConfig.node),
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  };

  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: async (config) => ShieldedWallet(config).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (config) => UnshieldedWallet(config).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (config) => DustWallet(config).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   ConditionalBlock — Deploy Escrow (local devnet)            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('  Setting up wallet...');
  const walletCtx = await createWallet();

  console.log('  Syncing with devnet (may take 1-2 min)...');
  const syncStart = Date.now();
  const ticker = setInterval(() => {
    process.stdout.write(`\r  ⏳ Syncing... (${Math.round((Date.now()-syncStart)/1000)}s)   `);
  }, 3000);

  const state = await walletCtx.wallet.waitForSyncedState();
  clearInterval(ticker);
  process.stdout.write('\r  ✓ Synced!                                                \n');

  const addr = walletCtx.unshieldedKeystore.getBech32Address();
  console.log(`  Wallet: ${addr}\n`);

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx, ttl) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx) => walletCtx.wallet.submitTransaction(tx),
  };

  const zkConfigProvider = new NodeZkConfigProvider(escrowZkPath);

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'escrow-private-state',
      accountId: addr.toString(),
      privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  const beneficiary = Buffer.alloc(32, 0x01);
  const amount = 100n;

  console.log('  Deploying escrow contract...');
  const escrowContract = await deployContract(providers, {
    privateStateId: 'escrow-private-state',
    compiledContract,
    initialPrivateState: {},
    args: [beneficiary, amount],
  });

  const contractAddress = escrowContract.deployTxData.public.contractAddress;
  await walletCtx.wallet.stop();

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ✅  CONTRACT DEPLOYED SUCCESSFULLY                          ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  ${contractAddress}  ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

main().catch((err) => {
  console.error('\n❌ Deploy failed:', err?.message ?? err);
  process.exit(1);
});
