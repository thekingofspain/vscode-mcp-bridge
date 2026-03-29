import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TerminalManager } from '@services/TerminalManager.js';
import type { TerminalOperationArgs } from '@type-defs/index.js';

interface ReadTerminal
  extends TerminalOperationArgs {
  lines?: number
}

export function execute(
  terminalManager: TerminalManager,
  args: ReadTerminal
): { content: [{ type: 'text'; text: string }] } {
  const result = terminalManager.readOutput(args.id, args.lines);

  if (!result) throw new Error(`Terminal '${args.id}' not found`);

  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
}

export function registerReadTerminal(server: McpServer, terminalManager: TerminalManager): void {
  server.registerTool('read_terminal', {
    description: 'Read recent output from a managed terminal. Returns the tail of the output buffer.',
    inputSchema: {}
  }, (args: Record<string, unknown>) => execute(terminalManager, args as { id: string; lines?: number }));
}
