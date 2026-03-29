import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { executeCommand } from '../../vscode-api/commands/execute.js'
import type { Settings } from '../../config/Settings.js'

export async function execute(
  settings: Settings,
  args: { command: string; args?: unknown[] }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const allowedCommands = settings.allowedCommands
  const result = await executeCommand(args.command, args.args, allowedCommands)
  return { content: [{ type: 'text', text: JSON.stringify({ result }) }] }
}

export function registerExecuteVscodeCommand(server: McpServer, settings: Settings): void {
  server.registerTool('execute_vscode_command', {
    description: 'Execute any VS Code command. Requires the command to be in the allowedCommands setting.',
    inputSchema: {}
  }, (args) => execute(settings, args))
}
