import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { TerminalManager } from '../../services/TerminalManager.js'

export async function execute(
  terminalManager: TerminalManager,
  args: { name: string; command?: string; cwd?: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = terminalManager.spawn(args.name, args.command, args.cwd)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerSpawnTerminal(server: McpServer, terminalManager: TerminalManager): void {
  server.registerTool('spawn_terminal', {
    description: 'Spawn a long-running process (dev server, watch mode, etc.) in a VS Code terminal with output capture. Use run_terminal_command for short-lived commands instead.',
    inputSchema: {}
  }, (args) => execute(terminalManager, args))
}
