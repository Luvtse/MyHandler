import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules'],
    globals: true,
    // ETA code mixes naive Date math with local-time semantics; pin TZ so
    // characterization/golden tests are deterministic across machines/CI.
    env: { TZ: 'UTC' }
  }
});
