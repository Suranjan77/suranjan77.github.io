import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // Playwright specs live in e2e/ and e2e-play/ (`npm run e2e`, `npm run e2e:play`); the relay has its own tests.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**', 'e2e-play/**', 'relay/**'],
  },
});
