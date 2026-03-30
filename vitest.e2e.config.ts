import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // E2E tests require @vscode/test-cli and run in real VSCode
    // This config is placeholder - use 'npm run test:e2e' with @vscode/test-cli instead

    // Mark as disabled - e2e tests use Mocha via @vscode/test-cli
    include: [],

    exclude: [
      'tests/e2e/**/*', // E2E tests use Mocha, not Vitest
      'node_modules',
      'out',
      'dist',
      'coverage',
      'test-fixtures',
    ],

    environment: 'node',
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
