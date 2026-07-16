import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
// @ts-ignore
const wasmPlugin = wasm.default || wasm;
// @ts-ignore
const topLevelAwaitPlugin = topLevelAwait.default || topLevelAwait;

export default defineConfig({
  plugins: [
    react(),
    wasmPlugin(),
    topLevelAwaitPlugin(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'events', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
