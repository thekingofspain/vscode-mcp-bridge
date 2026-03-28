import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { TerminalManager } from '../../services/TerminalManager.js'

let terminalManager: TerminalManager | undefined

export function setTerminalManager(manager: TerminalManager): void {
  terminalManager = manager
}

export async function execute(
  args: { name: string; command?: string; cwd?: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  if (!terminalManager) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'Terminal manager not initialized' }) }] }
  }
  const result = terminalManager.spawn(args.name, args.command, args.cwd)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerSpawnTerminal(server: McpServer): void {
  server.registerTool('spawn_terminal', {
    description: 'Spawn a long-running process (dev server, watch mode, etc.) in a VS Code terminal with output capture. Use run_terminal_command for short-lived commands instead.',
    inputSchema: {}
  }, execute)
}
