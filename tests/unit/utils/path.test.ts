/**
 * Tests for path utility functions
 *
 * Tests path normalization and manipulation utilities.
 */

import { normalizePath } from '@utils/path.js';
import { describe, expect, it } from 'vitest';

describe('normalizePath', () => {
  describe('basic normalization', () => {
    it('should normalize simple absolute path', () => {
      const result = normalizePath('/test/file.txt');

      // On Windows, path.resolve adds the drive letter
      expect(result).toMatch(/.*[/\\]test[/\\]file.txt/);
      expect(result).toContain('/test/file.txt');
    });

    it('should convert backslashes to forward slashes', () => {
      const result = normalizePath('C:\\test\\file.txt');

      expect(result).toBe('c:/test/file.txt');
    });

    it('should convert to lowercase', () => {
      const result = normalizePath('/TEST/File.TXT');

      // Should be lowercase (with drive letter on Windows)
      expect(result.toLowerCase()).toBe(result);
      expect(result).toContain('/test/file.txt');
    });

    it('should handle mixed separators', () => {
      const result = normalizePath('C:/test\\subdir/file.txt');

      expect(result).toBe('c:/test/subdir/file.txt');
    });
  });

  describe('relative path resolution', () => {
    it('should resolve relative paths', () => {
      const result = normalizePath('./test/file.txt');

      // Should resolve to absolute path with drive letter on Windows
      expect(result).toContain('/test/file.txt');
      expect(result).not.toContain('./');
    });

    it('should resolve parent directory references', () => {
      const result = normalizePath('/test/../file.txt');

      expect(result).not.toContain('..');
    });

    it('should resolve multiple parent directory references', () => {
      const result = normalizePath('/a/b/c/../../d');

      expect(result).not.toContain('..');
      expect(result).toMatch(/[a-zA-Z]:[/\\]a[/\\]d/i);
    });

    it('should resolve current directory references', () => {
      const result = normalizePath('/test/./file.txt');

      expect(result).not.toContain('/./');
    });
  });

  describe('Windows-specific paths', () => {
    it('should handle Windows drive letters', () => {
      const result = normalizePath('C:\\Users\\test\\file.txt');

      expect(result).toBe('c:/users/test/file.txt');
    });

    it('should handle Windows UNC paths', () => {
      const result = normalizePath('\\\\server\\share\\file.txt');

      expect(result).toContain('server');
      expect(result).toContain('share');
    });

    it('should normalize Windows path with mixed case', () => {
      const result = normalizePath('C:\\Users\\Test\\Documents\\File.TXT');

      expect(result).toBe('c:/users/test/documents/file.txt');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = normalizePath('');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle root path', () => {
      const result = normalizePath('/');

      // On Windows this becomes the drive root
      expect(result).toMatch(/[a-zA-Z]:\//);
    });

    it('should handle Windows root path', () => {
      const result = normalizePath('C:\\');

      expect(result).toBe('c:/');
    });

    it('should handle paths with spaces', () => {
      const result = normalizePath('C:\\Program Files\\test\\file.txt');

      expect(result).toBe('c:/program files/test/file.txt');
    });

    it('should handle paths with special characters', () => {
      const result = normalizePath('/test-dir/file_name.txt');

      expect(result).toContain('/test-dir/file_name.txt');
    });

    it('should handle paths with dots in filename', () => {
      const result = normalizePath('/test/file.name.txt');

      expect(result).toContain('/test/file.name.txt');
    });

    it('should handle trailing slashes', () => {
      const result1 = normalizePath('/test/dir/');
      const result2 = normalizePath('/test/dir');

      // Both should be valid, implementation may vary
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe('case insensitivity', () => {
    it('should make paths comparable regardless of case', () => {
      const path1 = normalizePath('/TEST/file.txt');
      const path2 = normalizePath('/test/FILE.txt');

      expect(path1.toLowerCase()).toBe(path2.toLowerCase());
    });

    it('should normalize uppercase Windows paths', () => {
      const result = normalizePath('C:\\USERS\\PUBLIC\\file.txt');

      expect(result).toBe('c:/users/public/file.txt');
    });
  });

  describe('path consistency', () => {
    it('should produce consistent output for same input', () => {
      const input = 'C:\\test\\File.TXT';
      const result1 = normalizePath(input);
      const result2 = normalizePath(input);

      expect(result1).toBe(result2);
    });

    it('should produce consistent output for equivalent paths', () => {
      const result1 = normalizePath('C:\\test\\file.txt');
      const result2 = normalizePath('C:/test/file.txt');

      expect(result1).toBe(result2);
    });

    it('should always return forward slashes', () => {
      const result = normalizePath('C:\\test\\subdir\\file.txt');

      expect(result).not.toContain('\\');
      expect(result).toContain('/');
    });

    it('should always return lowercase', () => {
      const result = normalizePath('C:/TEST/File.TXT');

      expect(result).toBe(result.toLowerCase());
    });
  });

  describe('integration scenarios', () => {
    it('should normalize VSCode document paths', () => {
      // Simulating typical VSCode path scenarios
      const vscodePath = 'c:\\Users\\test\\project\\src\\index.ts';
      const result = normalizePath(vscodePath);

      expect(result).toBe('c:/users/test/project/src/index.ts');
    });

    it('should normalize workspace folder paths', () => {
      const workspacePath = '/home/user/my-project';
      const result = normalizePath(workspacePath);

      // On Windows, this gets resolved with drive letter
      expect(result).toContain('/home/user/my-project');
    });

    it('should handle file URIs converted to fsPath', () => {
      const fsPath = 'file:///c:/test/file.txt'.replace('file://', '');
      const result = normalizePath(fsPath);

      expect(result).toMatch(/c:\/test\/file.txt/i);
    });
  });
});
