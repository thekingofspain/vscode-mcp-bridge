import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CommandExecutionArgs } from '@type-defs/index.js';
import { toMcpResponse } from '@utils/response.js';
import { executeCommand } from '@vscode-api/commands/execute.js';

export async function execute(
  allowedCommands: string[],
  args: CommandExecutionArgs,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await executeCommand(args.command, args.args, allowedCommands);

  return toMcpResponse({ result });
}

export function registerExecuteVscodeCommand(server: McpServer): void {
  server.registerTool(
    'execute_vscode_command',
    {
      description:
        'Execute any VS Code command. Requires the command to be in the allowedCommands setting.',
      inputSchema: {},
    },
    execute as never,
  );
}
