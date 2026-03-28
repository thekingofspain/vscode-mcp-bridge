import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { runCommand } from '../../vscode-api/window/terminals.js'

export async function execute(
  args: { command: string; cwd?: string; timeoutMs?: number }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await runCommand(args.command, args.cwd, args.timeoutMs)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerRunTerminalCommand(server: McpServer): void {
  server.registerTool('run_terminal_command', {
    description: 'Run a shell command and capture its output',
    inputSchema: {}
  }, execute)
}
