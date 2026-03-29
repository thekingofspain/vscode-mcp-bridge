import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TerminalManager } from '@services/TerminalManager.js';
import type { TerminalOperationArgs } from '@type-defs/index.js';

export function execute(
  terminalManager: TerminalManager,
  args: TerminalOperationArgs,
): { content: [{ type: 'text'; text: string }] } {
  const ok = terminalManager.kill(args.id);

  if (!ok) throw new Error(`Terminal '${args.id}' not found`);

  return {
    content: [{ type: 'text', text: JSON.stringify({ killed: true }) }],
  };
}

export function registerKillTerminal(
  server: McpServer,
  terminalManager: TerminalManager,
): void {
  server.registerTool(
    'kill_terminal',
    {
      description: 'Kill a managed terminal and its process',
      inputSchema: {},
    },
    (args: Record<string, unknown>) =>
      execute(terminalManager, args as { id: string }),
  );
}
