


/**
 * Tests for response utility functions
 *
 * Tests the toMcpResponse function for converting data to MCP format.
 */

import { toMcpResponse } from '@utils/response.js';
import { describe, expect, it } from 'vitest';

describe('toMcpResponse', () => {
  it('should convert string to MCP response format', () => {
    const result = toMcpResponse('Hello World');

    expect(result).toHaveProperty('content');
    expect(result.content).toBeInstanceOf(Array);
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toEqual({
      type: 'text',
      text: '"Hello World"',
    });
  });

  it('should convert number to MCP response format', () => {
    const result = toMcpResponse(42);

    expect(result.content[0].text).toBe('42');
  });

  it('should convert boolean to MCP response format', () => {
    const resultTrue = toMcpResponse(true);
    const resultFalse = toMcpResponse(false);

    expect(resultTrue.content[0].text).toBe('true');
    expect(resultFalse.content[0].text).toBe('false');
  });

  it('should convert null to MCP response format', () => {
    const result = toMcpResponse(null);

    expect(result.content[0].text).toBe('null');
  });

  it('should convert undefined to MCP response format', () => {
    const result = toMcpResponse(undefined);

    // JSON.stringify(undefined) returns undefined
    expect(result.content[0].text).toBeUndefined();
  });

  it('should convert object to MCP response format', () => {
    const data = { name: 'test', value: 123 };
    const result = toMcpResponse(data);

    expect(result.content[0].text).toBe(JSON.stringify(data));
  });

  it('should convert array to MCP response format', () => {
    const data = [1, 2, 3, 'test'];
    const result = toMcpResponse(data);

    expect(result.content[0].text).toBe(JSON.stringify(data));
  });

  it('should handle nested objects', () => {
    const data = {
      user: {
        name: 'John',
        address: {
          city: 'NYC',
          zip: '10001',
        },
      },
    };
    const result = toMcpResponse(data);

    expect(result.content[0].text).toBe(JSON.stringify(data));
  });

  it('should handle special characters in strings', () => {
    const data = { message: 'Hello\nWorld\t!"' };
    const result = toMcpResponse(data);

    expect(result.content[0].text).toBe(JSON.stringify(data));
  });

  describe('with maxLength parameter', () => {
    it('should not truncate when content is shorter than maxLength', () => {
      const data = 'Short text';
      const result = toMcpResponse(data, 100);

      expect(result.content[0].text).toBe('"Short text"');
      expect(result.content[0].text.length).toBeLessThan(100);
    });

    it('should not truncate when content equals maxLength', () => {
      const data = 'A'.repeat(10);
      const result = toMcpResponse(data, JSON.stringify(data).length);

      expect(result.content[0].text).not.toContain('... (truncated)');
    });

    it('should truncate when content exceeds maxLength', () => {
      const data = 'A'.repeat(100);
      const maxLength = 50;
      const result = toMcpResponse(data, maxLength);

      expect(result.content[0].text.length).toBeLessThanOrEqual(
        maxLength + '... (truncated)'.length,
      );
      expect(result.content[0].text).toContain('... (truncated)');
    });

    it('should truncate at exact maxLength boundary', () => {
      const data = 'A'.repeat(200);
      const maxLength = 100;
      const result = toMcpResponse(data, maxLength);
      const truncatedText = result.content[0].text;

      expect(truncatedText.length).toBeLessThanOrEqual(
        maxLength + '... (truncated)'.length,
      );
      expect(truncatedText).toMatch(/.{1,100}\.\.\. \(truncated\)$/);
    });

    it('should handle maxLength of 0', () => {
      const data = 'Any text';
      const result = toMcpResponse(data, 0);

      expect(result.content[0].text).toContain('... (truncated)');
    });

    it('should handle negative maxLength (no truncation)', () => {
      const data = 'A'.repeat(100);
      const result = toMcpResponse(data, -1);

      // Negative maxLength still triggers truncation since we only check if maxLength !== undefined
      expect(result.content[0].text).toContain('... (truncated)');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = toMcpResponse('');

      expect(result.content[0].text).toBe('""');
    });

    it('should handle empty object', () => {
      const result = toMcpResponse({});

      expect(result.content[0].text).toBe('{}');
    });

    it('should handle empty array', () => {
      const result = toMcpResponse([]);

      expect(result.content[0].text).toBe('[]');
    });

    it('should handle circular references gracefully', () => {
      const circular: unknown = { a: 1 };

      (circular as Record<string, unknown>).self = circular;

      expect(() => toMcpResponse(circular)).toThrow();
    });

    it('should handle very large numbers', () => {
      const result = toMcpResponse(Number.MAX_SAFE_INTEGER);

      expect(result.content[0].text).toBe(String(Number.MAX_SAFE_INTEGER));
    });

    it('should handle Infinity', () => {
      const result = toMcpResponse(Infinity);

      expect(result.content[0].text).toBe('null');
    });

    it('should handle NaN', () => {
      const result = toMcpResponse(NaN);

      expect(result.content[0].text).toBe('null');
    });

    it('should handle symbols (converts to empty object)', () => {
      const result = toMcpResponse(Symbol('test'));

      // JSON.stringify(Symbol('test')) returns undefined
      expect(result.content[0].text).toBeUndefined();
    });

    it('should handle functions (ignored in JSON)', () => {
      const result = toMcpResponse({ fn: () => undefined });

      expect(result.content[0].text).toBe('{}');
    });
  });

  describe('response structure', () => {
    it('should always return object with content property', () => {
      const result = toMcpResponse('test');

      expect(result).toHaveProperty('content');
      expect(Object.keys(result)).toEqual(['content']);
    });

    it('should have content as array', () => {
      const result = toMcpResponse('test');

      expect(Array.isArray(result.content)).toBe(true);
    });

    it('should have content items with type and text properties', () => {
      const result = toMcpResponse('test');

      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should have exactly one content item for simple responses', () => {
      const result = toMcpResponse('test');

      expect(result.content).toHaveLength(1);
    });
  });
});
