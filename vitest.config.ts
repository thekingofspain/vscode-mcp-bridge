import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global test timeout (ms)
    timeout: 10000,

    // Include test files
    include: [
      'tests/unit/**/*.test.ts',
      'tests/e2e/**/*.test.ts',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'out',
      'dist',
      'coverage',
      'test-fixtures',
      '**/*.e2e.test.ts',
    ],

    // Environment for tests
    environment: 'node',

    // Pool configuration - use single thread to avoid memory issues
    pool: 'forks',
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 2,
      },
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',

      // Coverage thresholds
      thresholds: {
        global: {
          lines: 80,
          functions: 85,
          branches: 75,
          statements: 80,
        },
      },

      // Files to include in coverage
      include: [
        'src/**/*.ts',
      ],

      // Files to exclude from coverage
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'tests/**',
        'test-fixtures/**',
        '**/*.config.*',
        'scripts/**',
      ],
    },

    // Test output configuration
    reporters: ['default'],

    // Silent mode (suppress console.log unless test fails)
    silent: false,

    // Isolate tests (each file runs in separate context)
    isolate: true,

    // Max concurrent tests
    maxConcurrency: 2,

    // Watch mode configuration
    watchExclude: [
      'node_modules',
      'out',
      'dist',
      'coverage',
      'test-fixtures',
    ],
  },

  // Resolve path aliases
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
      'vscode': resolve(__dirname, './tests/mocks/vscode.ts'),
    },
  },
});
