import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { TerminalManager } from '../../services/TerminalManager.js'

let terminalManager: TerminalManager | undefined

export function setTerminalManager(manager: TerminalManager): void {
  terminalManager = manager
}

export async function execute(
  args: { id: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  if (!terminalManager) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'Terminal manager not initialized' }) }] }
  }
  const ok = terminalManager.kill(args.id)
  if (!ok) throw new Error(`Terminal '${args.id}' not found`)
  return { content: [{ type: 'text', text: JSON.stringify({ killed: true }) }] }
}

export function registerKillTerminal(server: McpServer): void {
  server.registerTool('kill_terminal', {
    description: 'Kill a managed terminal and its process',
    inputSchema: {}
  }, execute)
}
