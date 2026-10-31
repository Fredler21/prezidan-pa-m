import { defineConfig } from 'vite';

// Light build for 2G / Facebook Lite: older JS target, no source maps in prod,
// aggressive asset inlining for the few small assets we ship.
export default defineConfig({
  base: '/',
  build: {
    target: 'es2018',
    cssTarget: 'chrome70',
    sourcemap: false,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
});
