import { z } from 'zod';

/**
 * Reusable Zod schema for file paths
 * Ensures consistent validation and description across all file operation commands
 */
export const filePathSchema = z.string().describe('Absolute path to the file');

/**
 * Reusable Zod schema for file content
 */
export const fileContentSchema = z
  .string()
  .describe('The full content to write');

/**
 * Reusable Zod schema for optional line numbers (0-indexed)
 */
export const lineNumberSchema = z.number().min(0);
