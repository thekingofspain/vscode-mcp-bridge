import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { executeCommand } from '../../vscode-api/commands/execute.js'

export async function execute(
  args: { command: string; args?: unknown[] }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await executeCommand(args.command, args.args)
  return { content: [{ type: 'text', text: JSON.stringify({ result }) }] }
}

export function registerExecuteVscodeCommand(server: McpServer): void {
  server.registerTool('execute_vscode_command', {
    description: 'Execute any VS Code command. Requires the command to be in the allowedCommands setting.',
    inputSchema: {}
  }, execute)
}
