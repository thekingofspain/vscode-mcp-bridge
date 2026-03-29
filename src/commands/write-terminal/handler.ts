import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { TerminalManager } from '../../services/TerminalManager.js'

export async function execute(
  terminalManager: TerminalManager,
  args: { id: string; input: string; addNewline?: boolean }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const ok = terminalManager.write(args.id, args.input, args.addNewline)
  if (!ok) throw new Error(`Terminal '${args.id}' not found or not alive`)
  return { content: [{ type: 'text', text: JSON.stringify({ sent: true }) }] }
}

export function registerWriteTerminal(server: McpServer, terminalManager: TerminalManager): void {
  server.registerTool('write_terminal', {
    description: 'Send input/text to a managed terminal (e.g. answer a prompt, send a command)',
    inputSchema: {}
  }, (args) => execute(terminalManager, args))
}
