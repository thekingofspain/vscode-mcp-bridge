

/**
 * Tests for write_file command handler
 *
 * Tests the write_file MCP tool handler with mocked VSCode API.
 */

import { execute } from '@commands/write-file/handler.js';
import * as filesystem from '@vscode-api/workspace/filesystem.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the VSCode API wrapper
vi.mock('@vscode-api/workspace/filesystem.js', () => ({
  writeFile: vi.fn(),
}));

describe('write_file handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful file writes', () => {
    it('should write content to file and return MCP response', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/test/file.txt',
      });

      // Act
      const result = await execute({
        filePath: '/test/file.txt',
        content: 'Hello World',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
    });

    it('should write content with createIfMissing true', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/new/file.txt',
      });

      // Act
      await execute({
        filePath: '/new/file.txt',
        content: 'New file content',
        createIfMissing: true,
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalledWith(
        '/new/file.txt',
        'New file content',
        true,
      );
    });

    it('should write content with createIfMissing false', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/existing/file.txt',
      });

      // Act
      await execute({
        filePath: '/existing/file.txt',
        content: 'Updated content',
        createIfMissing: false,
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalledWith(
        '/existing/file.txt',
        'Updated content',
        false,
      );
    });

    it('should handle multi-line content', async () => {
      // Arrange
      const content = 'Line 1\nLine 2\nLine 3';

      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/test/file.txt',
      });

      // Act
      await execute({
        filePath: '/test/file.txt',
        content,
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalled();
    });

    it('should handle empty content', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/test/empty.txt',
      });

      // Act
      await execute({
        filePath: '/test/empty.txt',
        content: '',
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalled();
    });
  });

  describe('write failures', () => {
    it('should throw error when write fails', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockRejectedValue(
        new Error('Permission denied'),
      );

      // Act & Assert
      await expect(
        execute({
          filePath: '/protected/file.txt',
          content: 'content',
        }),
      ).rejects.toThrow();
    });

    it('should handle file system errors', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockRejectedValue(
        new Error('Disk full'),
      );

      // Act & Assert
      await expect(
        execute({
          filePath: '/test/file.txt',
          content: 'content',
        }),
      ).rejects.toThrow();
    });
  });

  describe('input validation', () => {
    it('should handle Windows-style paths', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: 'C:\\test\\file.txt',
      });

      // Act
      await execute({
        filePath: 'C:\\test\\file.txt',
        content: 'content',
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalled();
    });

    it('should handle paths with spaces', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/path/with spaces/file.txt',
      });

      // Act
      await execute({
        filePath: '/path/with spaces/file.txt',
        content: 'content',
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalled();
    });

    it('should handle unicode content', async () => {
      // Arrange
      const content = 'Unicode: 你好世界 🎉 üñö';

      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/test/file.txt',
      });

      // Act
      await execute({
        filePath: '/test/file.txt',
        content,
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalled();
    });
  });

  describe('response format', () => {
    it('should return valid MCP response structure', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/test.txt',
      });

      // Act
      const result = await execute({
        filePath: '/test.txt',
        content: 'test',
      });

      // Assert
      expect(result).toHaveProperty('content');
    });
  });

  describe('createIfMissing default behavior', () => {
    it('should pass undefined when createIfMissing not specified', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/test.txt',
      });

      // Act
      await execute({
        filePath: '/test.txt',
        content: 'test',
      });

      // Assert - undefined is passed when not specified (handler doesn't apply schema default)
      expect(filesystem.writeFile).toHaveBeenCalledWith(
        '/test.txt',
        'test',
        undefined,
      );
    });

    it('should explicitly set createIfMissing to false', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/test.txt',
      });

      // Act
      await execute({
        filePath: '/test.txt',
        content: 'test',
        createIfMissing: false,
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalledWith(
        '/test.txt',
        'test',
        false,
      );
    });

    it('should explicitly set createIfMissing to true', async () => {
      // Arrange
      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/test.txt',
      });

      // Act
      await execute({
        filePath: '/test.txt',
        content: 'test',
        createIfMissing: true,
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalledWith(
        '/test.txt',
        'test',
        true,
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very large files', async () => {
      // Arrange
      const largeContent = 'A'.repeat(1000);

      vi.mocked(filesystem.writeFile).mockResolvedValue({
        success: true,
        path: '/test/large.txt',
      });

      // Act
      await execute({
        filePath: '/test/large.txt',
        content: largeContent,
      });

      // Assert
      expect(filesystem.writeFile).toHaveBeenCalled();
    });
  });
});
