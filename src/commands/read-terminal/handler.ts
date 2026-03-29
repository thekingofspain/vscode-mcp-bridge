import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { TerminalManager } from '../../services/TerminalManager.js'

export async function execute(
  terminalManager: TerminalManager,
  args: { id: string; lines?: number }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = terminalManager.readOutput(args.id, args.lines)
  if (!result) throw new Error(`Terminal '${args.id}' not found`)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerReadTerminal(server: McpServer, terminalManager: TerminalManager): void {
  server.registerTool('read_terminal', {
    description: 'Read recent output from a managed terminal. Returns the tail of the output buffer.',
    inputSchema: {}
  }, (args) => execute(terminalManager, args))
}
