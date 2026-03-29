import * as path from 'path';

/**
 * Normalize a file path for consistent comparison across the codebase
 * - Resolves relative segments (.., .)
 * - Converts to lowercase for case-insensitive comparison
 * - Uses forward slashes for cross-platform consistency
 */
export function normalizePath(filePath: string): string {
  return path.resolve(filePath).toLowerCase().replace(/\\/g, '/');
}
