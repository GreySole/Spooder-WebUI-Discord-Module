import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    ...federation({
      name: 'discord',
      filename: 'remoteEntry.js',
      // The host loads exactly one thing: the ModuleDefinition this module's index exports.
      exposes: { './module': './index.ts' },
      // Every library the host already has loaded. Sharing them is a correctness requirement
      // rather than an optimisation: a second React breaks hooks, and a second copy of the
      // module SDK would build a configApi whose reducer the host's store never mounted.
      //
      // `import: false` bundles no fallback copy. This module cannot run outside a Spooder
      // host, so a fallback would only ever be dead weight - or worse, the second copy the
      // singleton exists to prevent. A host missing one of these fails loudly at load.
      //
      // This block must stay identical to the host's. A library shared here but not there
      // cannot resolve at runtime.
      shared: {
        react: { singleton: true, import: false, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, import: false, requiredVersion: '^18.0.0' },
        'react-redux': { singleton: true, import: false },
        '@reduxjs/toolkit': { singleton: true, import: false },
        'react-hook-form': { singleton: true, import: false },
        '@spooder/webui-component-library': { singleton: true, import: false },
        // The contract this module is written against. requiredVersion is what stops a module
        // built against an older SDK from loading into a host that has moved on.
        '@spooder/webui-module-sdk': {
          singleton: true,
          import: false,
          requiredVersion: '^0.6.0',
        },
      },
      // Emits mf-manifest.json alongside the entry - what the host registers as the remote.
      manifest: true,
      // Types come from the published SDK, so there is no host to pull remote types from.
      dts: false,
    }),
  ],
  build: {
    // Federation's runtime uses top-level await, which needs a modern target.
    target: 'esnext',
    outDir: 'dist',
    // A remote has no page of its own, so there is no index.html to start from - the exposed
    // module is the entry, and federation adds remoteEntry.js alongside it.
    rollupOptions: { input: './index.ts' },
  },
});
