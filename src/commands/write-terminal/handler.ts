import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { TerminalManager } from '../../services/TerminalManager.js'

let terminalManager: TerminalManager | undefined

export function setTerminalManager(manager: TerminalManager): void {
  terminalManager = manager
}

export async function execute(
  args: { id: string; input: string; addNewline?: boolean }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  if (!terminalManager) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'Terminal manager not initialized' }) }] }
  }
  const ok = terminalManager.write(args.id, args.input, args.addNewline)
  if (!ok) throw new Error(`Terminal '${args.id}' not found or not alive`)
  return { content: [{ type: 'text', text: JSON.stringify({ sent: true }) }] }
}

export function registerWriteTerminal(server: McpServer): void {
  server.registerTool('write_terminal', {
    description: 'Send input/text to a managed terminal (e.g. answer a prompt, send a command)',
    inputSchema: {}
  }, execute)
}
