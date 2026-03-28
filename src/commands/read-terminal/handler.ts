import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { TerminalManager } from '../../services/TerminalManager.js'

let terminalManager: TerminalManager | undefined

export function setTerminalManager(manager: TerminalManager): void {
  terminalManager = manager
}

export async function execute(
  args: { id: string; lines?: number }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  if (!terminalManager) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'Terminal manager not initialized' }) }] }
  }
  const result = terminalManager.readOutput(args.id, args.lines)
  if (!result) throw new Error(`Terminal '${args.id}' not found`)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerReadTerminal(server: McpServer): void {
  server.registerTool('read_terminal', {
    description: 'Read recent output from a managed terminal. Returns the tail of the output buffer.',
    inputSchema: {}
  }, execute)
}
