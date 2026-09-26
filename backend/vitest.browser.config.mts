import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup-env.ts'],
    include: ['tests/public-proposal.browser.spec.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000
  }
});
