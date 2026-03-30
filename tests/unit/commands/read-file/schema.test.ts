/**
 * Tests for read_file command schema validation
 *
 * Tests the Zod schema for read_file input validation.
 */

import { ReadFileInputSchema } from '@commands/read-file/schema.js';
import { describe, expect, it } from 'vitest';

describe('ReadFileInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid absolute path', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/absolute/path/to/file.txt',
      });

      expect(result.success).toBe(true);
    });

    it('should accept Windows-style paths', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: 'C:\\Users\\test\\file.txt',
      });

      expect(result.success).toBe(true);
    });

    it('should accept optional startLine', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        startLine: 10,
      });

      expect(result.success).toBe(true);
    });

    it('should accept optional endLine', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        endLine: 20,
      });

      expect(result.success).toBe(true);
    });

    it('should accept both startLine and endLine', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        startLine: 10,
        endLine: 20,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject missing filePath', () => {
      const result = ReadFileInputSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it('should reject non-string filePath', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: 123,
      });

      expect(result.success).toBe(false);
    });

    it('should reject negative startLine', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        startLine: -1,
      });

      expect(result.success).toBe(false);
    });

    it('should reject negative endLine', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        endLine: -5,
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-numeric startLine', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        startLine: 'ten',
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-numeric endLine', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        endLine: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('schema structure', () => {
    it('should have filePath as required field', () => {
      const shape = ReadFileInputSchema.shape;

      expect(shape.filePath).toBeDefined();
    });

    it('should have startLine as optional field', () => {
      const shape = ReadFileInputSchema.shape;

      expect(shape.startLine).toBeDefined();
    });

    it('should have endLine as optional field', () => {
      const shape = ReadFileInputSchema.shape;

      expect(shape.endLine).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should accept very long file paths', () => {
      const longPath = '/very/long/' + 'path/'.repeat(100) + 'file.txt';
      const result = ReadFileInputSchema.safeParse({
        filePath: longPath,
      });

      expect(result.success).toBe(true);
    });

    it('should accept file paths with unicode characters', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/path/with/üñíçödé/file.txt',
      });

      expect(result.success).toBe(true);
    });

    it('should accept hidden files', () => {
      const result = ReadFileInputSchema.safeParse({
        filePath: '/path/.gitignore',
      });

      expect(result.success).toBe(true);
    });
  });
});
