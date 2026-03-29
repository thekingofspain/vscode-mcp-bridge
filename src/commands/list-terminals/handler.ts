import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TerminalManager } from '@services/TerminalManager.js';

export function execute(terminalManager: TerminalManager): {
  content: [{ type: 'text'; text: string }];
} {
  const terminals = terminalManager.list();

  return { content: [{ type: 'text', text: JSON.stringify(terminals) }] };
}

export function registerListTerminals(
  server: McpServer,
  terminalManager: TerminalManager,
): void {
  server.registerTool(
    'list_terminals',
    {
      description:
        'List all managed terminals and their status (alive/dead, log size)',
      inputSchema: {},
    },
    () => execute(terminalManager),
  );
}
