import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // E2E tests run in real VSCode instance
    timeout: 30000,

    include: [
      'tests/e2e/**/*.test.ts',
    ],

    exclude: [
      'node_modules',
      'out',
      'dist',
      'coverage',
      'test-fixtures',
    ],

    // Use Node environment (VSCode provides the API)
    environment: 'node',

    // Don't run in parallel for E2E tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },

    // Test output
    reporters: ['verbose'],

    // Don't isolate - tests may depend on shared state
    isolate: false,
  },

  resolve: {
    alias: {
      '@commands': resolve(__dirname, './src/commands'),
      '@config': resolve(__dirname, './src/config'),
      '@extension': resolve(__dirname, './src/extension'),
      '@mcp': resolve(__dirname, './src/mcp'),
      '@services': resolve(__dirname, './src/services'),
      '@type-defs': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@vscode-api': resolve(__dirname, './src/vscode-api'),
      '@generated': resolve(__dirname, './.generated'),
    },
  },
});
