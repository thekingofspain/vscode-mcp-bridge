

/**
 * Tests for write_file command schema validation
 *
 * Tests the Zod schema for write_file input validation.
 */

import { WriteFileInputSchema } from '@commands/write-file/schema.js';
import { describe, expect, it } from 'vitest';

describe('WriteFileInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid filePath and content', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        content: 'Hello World',
      });

      expect(result.success).toBe(true);
    });

    it('should accept empty content', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: '/test/empty.txt',
        content: '',
      });

      expect(result.success).toBe(true);
    });

    it('should accept createIfMissing true', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        content: 'content',
        createIfMissing: true,
      });

      expect(result.success).toBe(true);
    });

    it('should accept createIfMissing false', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        content: 'content',
        createIfMissing: false,
      });

      expect(result.success).toBe(true);
    });

    it('should default createIfMissing to true when not specified', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        content: 'content',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject missing filePath', () => {
      const result = WriteFileInputSchema.safeParse({
        content: 'content',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing content', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: '/test/file.txt',
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-string filePath', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: 123,
        content: 'content',
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-string content', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        content: 123,
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-boolean createIfMissing', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: '/test/file.txt',
        content: 'content',
        createIfMissing: 'true',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('schema structure', () => {
    it('should have filePath as required field', () => {
      const shape = WriteFileInputSchema.shape;

      expect(shape.filePath).toBeDefined();
    });

    it('should have content as required field', () => {
      const shape = WriteFileInputSchema.shape;

      expect(shape.content).toBeDefined();
    });

    it('should have createIfMissing as optional field', () => {
      const shape = WriteFileInputSchema.shape;

      expect(shape.createIfMissing).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should accept very long file paths', () => {
      const longPath = '/very/long/' + 'path/'.repeat(100) + 'file.txt';
      const result = WriteFileInputSchema.safeParse({
        filePath: longPath,
        content: 'content',
      });

      expect(result.success).toBe(true);
    });

    it('should accept very large content', () => {
      const largeContent = 'A'.repeat(1000);
      const result = WriteFileInputSchema.safeParse({
        filePath: '/test/large.txt',
        content: largeContent,
      });

      expect(result.success).toBe(true);
    });

    it('should accept file paths with unicode characters', () => {
      const result = WriteFileInputSchema.safeParse({
        filePath: '/path/with/üñíçödé/file.txt',
        content: 'content',
      });

      expect(result.success).toBe(true);
    });
  });
});
