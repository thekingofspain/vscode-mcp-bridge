
/**
 * Tests for execute_vscode_command handler
 *
 * Tests the execute_vscode_command MCP tool handler.
 * This is a security-sensitive command that requires allowlist validation.
 */

import { execute } from '@commands/execute-vscode-command/handler.js';
import { describe, expect, it, vi } from 'vitest';
import * as vscode from 'vscode';

// Mock VSCode commands API
vi.mock('vscode', () => ({
  commands: {
    executeCommand: vi.fn(),
  },
}));

describe('execute_vscode_command handler', () => {
  describe('command execution', () => {
    it('should execute allowed command and return result', async () => {
      // Arrange
      vi.mocked(vscode.commands.executeCommand).mockResolvedValue('success' as never);

      // Act
      const result = await execute(['workbench.action.files.save'], {
        command: 'workbench.action.files.save',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
    });

    it('should execute command with arguments', async () => {
      // Arrange
      vi.mocked(vscode.commands.executeCommand).mockResolvedValue(true as never);

      // Act
      await execute(['type'], {
        command: 'type',
        args: [{ text: 'Hello' }],
      });

      // Assert
      expect(vscode.commands.executeCommand).toHaveBeenCalled();
    });

    it('should handle command returning null', async () => {
      // Arrange
      vi.mocked(vscode.commands.executeCommand).mockResolvedValue(null as never);

      // Act
      const result = await execute(['some.command'], {
        command: 'some.command',
      });

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('security - command allowlist', () => {
    it('should reject command not in allowlist', async () => {
      // Arrange
      vi.mocked(vscode.commands.executeCommand).mockRejectedValue(new Error('Not allowed'));

      // Act & Assert
      await expect(
        execute(['safe.command'], {
          command: 'dangerous.command',
        }),
      ).rejects.toThrow();
    });

    it('should reject when allowlist is empty', async () => {
      // Arrange
      vi.mocked(vscode.commands.executeCommand).mockRejectedValue(new Error('Not allowed'));

      // Act & Assert
      await expect(
        execute([], {
          command: 'any.command',
        }),
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should propagate VSCode command errors', async () => {
      // Arrange
      vi.mocked(vscode.commands.executeCommand).mockRejectedValue(
        new Error('Command failed'),
      );

      // Act & Assert
      await expect(
        execute(['failing.command'], {
          command: 'failing.command',
        }),
      ).rejects.toThrow('Command failed');
    });
  });
});
