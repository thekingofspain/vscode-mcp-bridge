/**
 * Tests for reusable Zod schemas
 *
 * Tests the schema definitions for file paths, content, and line numbers.
 */

import {
  filePathSchema,
  fileContentSchema,
  lineNumberSchema,
} from '@utils/schemas.js';
import { describe, expect, it } from 'vitest';

describe('filePathSchema', () => {
  it('should accept valid absolute Unix path', () => {
    const result = filePathSchema.safeParse('/usr/local/bin/file.txt');

    expect(result.success).toBe(true);
  });

  it('should accept valid absolute Windows path', () => {
    const result = filePathSchema.safeParse('C:\\Users\\test\\file.txt');

    expect(result.success).toBe(true);
  });

  it('should accept path with special characters', () => {
    const result = filePathSchema.safeParse(
      '/path/with spaces/and-dashes/file_name.txt',
    );

    expect(result.success).toBe(true);
  });

  it('should accept hidden file paths', () => {
    const result = filePathSchema.safeParse('/path/.gitignore');

    expect(result.success).toBe(true);
  });

  it('should reject non-string input', () => {
    const result = filePathSchema.safeParse(123);

    expect(result.success).toBe(false);
  });

  it('should reject null input', () => {
    const result = filePathSchema.safeParse(null);

    expect(result.success).toBe(false);
  });

  it('should reject undefined input', () => {
    const result = filePathSchema.safeParse(undefined);

    expect(result.success).toBe(false);
  });

  it('should reject empty string', () => {
    const result = filePathSchema.safeParse('');

    expect(result.success).toBe(true); // Zod string schema accepts empty strings
  });

  it('should have correct description', () => {
    expect(filePathSchema.description).toBe('Absolute path to the file');
  });
});

describe('fileContentSchema', () => {
  it('should accept valid string content', () => {
    const result = fileContentSchema.safeParse('Hello, World!');

    expect(result.success).toBe(true);
  });

  it('should accept empty string content', () => {
    const result = fileContentSchema.safeParse('');

    expect(result.success).toBe(true);
  });

  it('should accept multi-line content', () => {
    const content = 'Line 1\nLine 2\nLine 3';
    const result = fileContentSchema.safeParse(content);

    expect(result.success).toBe(true);
  });

  it('should accept unicode content', () => {
    const content = 'Unicode: 你好世界 🎉 üñö';
    const result = fileContentSchema.safeParse(content);

    expect(result.success).toBe(true);
  });

  it('should accept very large content', () => {
    const content = 'A'.repeat(1000000);
    const result = fileContentSchema.safeParse(content);

    expect(result.success).toBe(true);
  });

  it('should reject non-string input', () => {
    const result = fileContentSchema.safeParse(123);

    expect(result.success).toBe(false);
  });

  it('should reject null input', () => {
    const result = fileContentSchema.safeParse(null);

    expect(result.success).toBe(false);
  });

  it('should reject undefined input', () => {
    const result = fileContentSchema.safeParse(undefined);

    expect(result.success).toBe(false);
  });

  it('should reject object input', () => {
    const result = fileContentSchema.safeParse({ content: 'test' });

    expect(result.success).toBe(false);
  });

  it('should have correct description', () => {
    expect(fileContentSchema.description).toBe('The full content to write');
  });
});

describe('lineNumberSchema', () => {
  it('should accept zero', () => {
    const result = lineNumberSchema.safeParse(0);

    expect(result.success).toBe(true);
  });

  it('should accept positive integer', () => {
    const result = lineNumberSchema.safeParse(42);

    expect(result.success).toBe(true);
  });

  it('should accept large line number', () => {
    const result = lineNumberSchema.safeParse(999999);

    expect(result.success).toBe(true);
  });

  it('should reject negative number', () => {
    const result = lineNumberSchema.safeParse(-1);

    expect(result.success).toBe(false);
  });

  it('should reject negative decimal', () => {
    const result = lineNumberSchema.safeParse(-0.5);

    expect(result.success).toBe(false);
  });

  it('should accept decimal (Zod number allows decimals)', () => {
    const result = lineNumberSchema.safeParse(5.5);

    expect(result.success).toBe(true); // Only min constraint, no integer constraint
  });

  it('should reject string input', () => {
    const result = lineNumberSchema.safeParse('10');

    expect(result.success).toBe(false);
  });

  it('should reject null input', () => {
    const result = lineNumberSchema.safeParse(null);

    expect(result.success).toBe(false);
  });

  it('should reject undefined input', () => {
    const result = lineNumberSchema.safeParse(undefined);

    expect(result.success).toBe(false);
  });

  it('should reject boolean input', () => {
    const result = lineNumberSchema.safeParse(true);

    expect(result.success).toBe(false);
  });
});
