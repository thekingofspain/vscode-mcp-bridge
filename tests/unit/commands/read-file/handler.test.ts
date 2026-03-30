 
 
 
/**
 * Tests for read_file command handler
 *
 * Tests the read_file MCP tool handler with mocked VSCode API.
 */

import { execute } from '@commands/read-file/handler.js';
import * as documents from '@vscode-api/workspace/documents.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the VSCode API wrapper
vi.mock('@vscode-api/workspace/documents.js', () => ({
  readFile: vi.fn(),
}));

describe('read_file handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful file reads', () => {
    it('should read entire file and return MCP response', async () => {
      // Arrange
      vi.mocked(documents.readFile).mockResolvedValue({
        content: 'Hello World\nThis is a test file',
        exists: true,
      });

      // Act
      const result = await execute({ filePath: '/test/file.txt' });

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
    });

    it('should read file with line range', async () => {
      // Arrange
      vi.mocked(documents.readFile).mockResolvedValue({
        content: 'Line 5\nLine 6\nLine 7',
        exists: true,
      });

      // Act
      await execute({
        filePath: '/test/file.txt',
        startLine: 5,
        endLine: 7,
      });

      // Assert
      expect(documents.readFile).toHaveBeenCalledWith(
        '/test/file.txt',
        5,
        7,
      );
    });

    it('should read single line', async () => {
      // Arrange
      vi.mocked(documents.readFile).mockResolvedValue({
        content: 'Single line',
        exists: true,
      });

      // Act
      await execute({
        filePath: '/test/file.txt',
        startLine: 10,
        endLine: 10,
      });

      // Assert
      expect(documents.readFile).toHaveBeenCalled();
    });

    it('should handle TypeScript files', async () => {
      // Arrange
      const tsCode = `function greet(name: string): void {
  console.log(\`Hello, \${name}!\`);
}`;

      vi.mocked(documents.readFile).mockResolvedValue({
        content: tsCode,
        exists: true,
      });

      // Act
      await execute({ filePath: '/project/src/greet.ts' });

      // Assert
      expect(documents.readFile).toHaveBeenCalled();
    });

    it('should handle JSON files', async () => {
      // Arrange
      const jsonData = JSON.stringify({ name: 'test', version: '1.0.0' }, null, 2);

      vi.mocked(documents.readFile).mockResolvedValue({
        content: jsonData,
        exists: true,
      });

      // Act
      await execute({ filePath: '/project/package.json' });

      // Assert
      expect(documents.readFile).toHaveBeenCalled();
    });
  });

  describe('file not found', () => {
    it('should return exists: false when file does not exist', async () => {
      // Arrange
      vi.mocked(documents.readFile).mockResolvedValue({
        content: '',
        exists: false,
        error: 'File not found',
      });

      // Act
      const result = await execute({ filePath: '/nonexistent/file.txt' });

      // Assert - handler returns the result, doesn't throw
      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('exists');
    });

    it('should include error message in response', async () => {
      // Arrange
      vi.mocked(documents.readFile).mockResolvedValue({
        content: '',
        exists: false,
        error: 'Permission denied',
      });

      // Act
      const result = await execute({ filePath: '/protected/file.txt' });

      // Assert
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('should handle missing error message gracefully', async () => {
      // Arrange
      vi.mocked(documents.readFile).mockResolvedValue({
        content: '',
        exists: false,
      });

      // Act
      const result = await execute({ filePath: '/missing/file.txt' });

      // Assert
      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('exists');
    });
  });

  describe('response format', () => {
    it('should return valid MCP response structure', async () => {
      // Arrange
      vi.mocked(documents.readFile).mockResolvedValue({
        content: 'test',
        exists: true,
      });

      // Act
      const result = await execute({ filePath: '/test.txt' });

      // Assert
      expect(result).toHaveProperty('content');
    });

    it('should include file content in response', async () => {
      // Arrange
      const content = 'test content';

      vi.mocked(documents.readFile).mockResolvedValue({
        content,
        exists: true,
      });

      // Act
      const result = await execute({ filePath: '/test.txt' });

      // Assert
      expect(result.content[0].text).toContain(content);
    });
  });

  describe('error handling', () => {
    it('should propagate unexpected errors', async () => {
      // Arrange
      vi.mocked(documents.readFile).mockRejectedValue(
        new Error('Unexpected error'),
      );

      // Act & Assert
      await expect(
        execute({ filePath: '/test.txt' }),
      ).rejects.toThrow();
    });

    it('should handle null/undefined from API gracefully', async () => {
      // Arrange
      vi.mocked(documents.readFile).mockResolvedValue(null as any);

      // Act
      const result = await execute({ filePath: '/test.txt' });

      // Assert - returns a response even for null input
      expect(result).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should read README files', async () => {
      // Arrange
      const readme = '# Project Title\n\nDescription here.';

      vi.mocked(documents.readFile).mockResolvedValue({
        content: readme,
        exists: true,
      });

      // Act
      await execute({ filePath: '/project/README.md' });

      // Assert
      expect(documents.readFile).toHaveBeenCalled();
    });

    it('should read configuration files', async () => {
      // Arrange
      const config = '{\n  "compilerOptions": {\n    "strict": true\n  }\n}';

      vi.mocked(documents.readFile).mockResolvedValue({
        content: config,
        exists: true,
      });

      // Act
      await execute({ filePath: '/project/tsconfig.json' });

      // Assert
      expect(documents.readFile).toHaveBeenCalled();
    });

    it('should read source code files', async () => {
      // Arrange
      const source = `import { foo } from './bar';\n\nexport function test() {\n  return foo();\n}`;

      vi.mocked(documents.readFile).mockResolvedValue({
        content: source,
        exists: true,
      });

      // Act
      await execute({ filePath: '/project/src/test.ts' });

      // Assert
      expect(documents.readFile).toHaveBeenCalled();
    });
  });
});
