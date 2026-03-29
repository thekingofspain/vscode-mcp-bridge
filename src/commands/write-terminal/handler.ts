import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TerminalManager } from '@services/TerminalManager.js';
import { toMcpResponse } from '@utils/response.js';
import type { TerminalWriteArgs } from '@type-defs/index.js';

export function execute(
  terminalManager: TerminalManager,
  args: TerminalWriteArgs
): { content: [{ type: 'text'; text: string }] } {
  const ok = terminalManager.write(args.id, args.input, args.addNewline);

  if (!ok) {
    throw new Error(`Terminal '${args.id}' not found or not alive`);
  }

  return toMcpResponse({ sent: true });
}

export function registerWriteTerminal(server: McpServer, terminalManager: TerminalManager): void {
  server.registerTool('write_terminal', {
    description: 'Send input/text to a managed terminal (e.g. answer a prompt, send a command)',
    inputSchema: {}
  }, (args: Record<string, unknown>) => execute(terminalManager, args as { id: string; input: string; addNewline?: boolean }));
}
