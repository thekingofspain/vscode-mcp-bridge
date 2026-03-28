import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { TerminalManager } from '../../services/TerminalManager.js'

let terminalManager: TerminalManager | undefined

export function setTerminalManager(manager: TerminalManager): void {
  terminalManager = manager
}

export async function execute(): Promise<{ content: [{ type: 'text'; text: string }] }> {
  if (!terminalManager) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'Terminal manager not initialized' }) }] }
  }
  const terminals = terminalManager.list()
  return { content: [{ type: 'text', text: JSON.stringify(terminals) }] }
}

export function registerListTerminals(server: McpServer): void {
  server.registerTool('list_terminals', {
    description: 'List all managed terminals and their status (alive/dead, log size)',
    inputSchema: {}
  }, execute)
}
