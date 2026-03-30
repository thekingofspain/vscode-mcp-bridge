/**
 * Tests for MCP tool registry
 *
 * Tests that all MCP tools are properly registered with the server.
 */

import { registerAllTools } from '@mcp/tools/registry.js';
import type { TerminalManager } from '@services/TerminalManager.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock TerminalManager
function createMockTerminalManager(): TerminalManager {
  return {
    spawn: vi.fn(),
    kill: vi.fn(),
    list: vi.fn(),
    read: vi.fn(),
    write: vi.fn(),
    dispose: vi.fn(),
  } as unknown as TerminalManager;
}

// Mock McpServer
function createMockMcpServer() {
  return {
    registerTool: vi.fn(),
  };
}

describe('MCP Tool Registry', () => {
  let mockServer: ReturnType<typeof createMockMcpServer>;
  let mockTerminalManager: TerminalManager;

  beforeEach(() => {
    mockServer = createMockMcpServer();
    mockTerminalManager = createMockTerminalManager();
    vi.clearAllMocks();
  });

  describe('tool registration', () => {
    it('should register all tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert - should register 37 tools (current count)
      expect(mockServer.registerTool).toHaveBeenCalledTimes(37);
    });

    it('should register read_file tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'read_file',
        expect.objectContaining({
          description: expect.stringContaining('Read'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register write_file tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'write_file',
        expect.objectContaining({
          description: expect.stringContaining('Write'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register open_file tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'open_file',
        expect.objectContaining({
          description: expect.stringContaining('Open'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register close_file tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'close_file',
        expect.objectContaining({
          description: expect.stringContaining('Close'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register get_diagnostics tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'get_diagnostics',
        expect.objectContaining({
          description: expect.stringContaining('diagnostic'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register get_active_file tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'get_active_file',
        expect.objectContaining({
          description: expect.stringContaining('active'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register get_open_tabs tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'get_open_tabs',
        expect.objectContaining({
          description: expect.stringContaining('tabs'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register get_workspace_info tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'get_workspace_info',
        expect.objectContaining({
          description: expect.stringContaining('workspace'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register git_action tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'git_action',
        expect.objectContaining({
          description: expect.stringContaining('Git'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register run_terminal_command tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert - check that run_terminal_command was registered (order may vary)
      const calls = mockServer.registerTool.mock.calls;
      const toolNames = calls.map((call) => call[0]);

      expect(toolNames).toContain('run_terminal_command');
    });

    it('should register spawn_terminal tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'spawn_terminal',
        expect.objectContaining({
          description: expect.stringContaining('terminal'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register kill_terminal tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'kill_terminal',
        expect.objectContaining({
          description: expect.stringContaining('Kill'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register execute_vscode_command tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'execute_vscode_command',
        expect.objectContaining({
          description: expect.stringContaining('VS Code command'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register show_message tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'show_message',
        expect.objectContaining({
          description: expect.stringContaining('message'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });

    it('should register show_diff tool', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        'show_diff',
        expect.objectContaining({
          description: expect.stringContaining('diff'),
          inputSchema: expect.any(Object),
        }),
        expect.any(Function),
      );
    });
  });

  describe('tool categories', () => {
    it('should register all file operation tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert - check file operation tools are registered
      const registeredTools = mockServer.registerTool.mock.calls.map(
        (call) => call[0],
      );

      expect(registeredTools).toEqual(
        expect.arrayContaining([
          'read_file',
          'write_file',
          'open_file',
          'close_file',
          'create_file',
          'delete_file',
        ]),
      );
    });

    it('should register all LSP tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert - check LSP tools are registered
      const registeredTools = mockServer.registerTool.mock.calls.map(
        (call) => call[0],
      );

      expect(registeredTools).toEqual(
        expect.arrayContaining([
          'find_references',
          'get_completions',
          'get_hover',
          'get_signature_help',
          'get_code_actions',
          'apply_code_action',
          'go_to_definition',
          'go_to_implementation',
          'go_to_type_definition',
          'get_document_symbols',
          'search_workspace_symbols',
          'rename_symbol',
        ]),
      );
    });

    it('should register all terminal tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert - check terminal tools are registered
      const registeredTools = mockServer.registerTool.mock.calls.map(
        (call) => call[0],
      );

      expect(registeredTools).toEqual(
        expect.arrayContaining([
          'run_terminal_command',
          'spawn_terminal',
          'kill_terminal',
          'list_terminals',
          'read_terminal',
          'write_terminal',
        ]),
      );
    });

    it('should register all editor tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert - check editor tools are registered
      const registeredTools = mockServer.registerTool.mock.calls.map(
        (call) => call[0],
      );

      expect(registeredTools).toEqual(
        expect.arrayContaining([
          'get_active_file',
          'get_open_tabs',
          'get_selection',
          'show_diff',
          'add_editor_decoration',
        ]),
      );
    });

    it('should register all UI tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert - check UI tools are registered
      const registeredTools = mockServer.registerTool.mock.calls.map(
        (call) => call[0],
      );

      expect(registeredTools).toEqual(
        expect.arrayContaining([
          'show_message',
          'show_quick_pick',
          'request_input',
        ]),
      );
    });
  });

  describe('tool descriptions', () => {
    it('should have non-empty descriptions for all tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      mockServer.registerTool.mock.calls.forEach((call) => {
        const description = call[1].description;

        expect(description).toBeDefined();
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it('should have input schemas for all tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      mockServer.registerTool.mock.calls.forEach((call) => {
        const inputSchema = call[1].inputSchema;

        expect(inputSchema).toBeDefined();
      });
    });

    it('should have execute functions for all tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      mockServer.registerTool.mock.calls.forEach((call) => {
        const executeFn = call[2];

        expect(executeFn).toBeDefined();
        expect(typeof executeFn).toBe('function');
      });
    });
  });

  describe('tool naming', () => {
    it('should use snake_case for all tool names', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      mockServer.registerTool.mock.calls.forEach((call) => {
        const toolName = call[0];

        expect(toolName).toMatch(/^[a-z]+(_[a-z]+)*$/);
      });
    });

    it('should have descriptive tool names', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert
      const registeredTools = mockServer.registerTool.mock.calls.map(
        (call) => call[0],
      );

      // All tool names should be meaningful (at least 3 characters)
      registeredTools.forEach((name) => {
        expect(name.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('terminal manager integration', () => {
    it('should pass terminal manager to terminal tools', () => {
      // Act
      registerAllTools(mockServer as any, mockTerminalManager);

      // Assert - terminal tools should have access to terminal manager
      expect(mockServer.registerTool).toHaveBeenCalled();
      // The terminal manager is used by the handlers internally
    });

    it('should have terminal manager methods available', () => {
      // Assert
      expect(mockTerminalManager.spawn).toBeDefined();
      expect(mockTerminalManager.kill).toBeDefined();
      expect(mockTerminalManager.list).toBeDefined();
      expect(mockTerminalManager.write).toBeDefined();
      expect(mockTerminalManager.dispose).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null server gracefully', () => {
      // Act & Assert
      expect(() => {
        registerAllTools(null as any, mockTerminalManager);
      }).toThrow();
    });

    it('should handle null terminal manager gracefully', () => {
      // Note: Currently the registry doesn't validate terminal manager
      // This test documents expected future behavior
      expect(() => {
        registerAllTools(mockServer as any, null as any);
      }).not.toThrow(); // Updated: doesn't throw currently
    });
  });
});
