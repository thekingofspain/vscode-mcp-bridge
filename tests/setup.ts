/**
 * Vitest Test Setup
 * 
 * This file runs before each test file and provides:
 * - Global mocks for VSCode API
 * - Test utilities
 * - Common assertions
 */

import { afterEach, beforeEach, vi } from 'vitest';

// Global test utilities
export const testUtils = {
  /**
   * Reset all mocks
   */
  resetMocks(): void {
    vi.clearAllMocks();
  },

  /**
   * Restore all mocks
   */
  restoreMocks(): void {
    vi.restoreAllMocks();
  },
};

// Global hooks
beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});
