import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}',
    }),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      include: ['buffer', 'events', 'util', 'stream', 'crypto'],
      overrides: {
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  define: {
    'process.env': process.env,
    'process.version': JSON.stringify('v18.0.0'),
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      define: {
        global: 'globalThis',
        'process.version': JSON.stringify('v18.0.0'),
      },
    },
    include: ['buffer', 'events', 'util'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});

