import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GitOperationArgs } from '@type-defs/index.js';
import { gitAction } from '@vscode-api/commands/git.js';

export async function execute(
  args: GitOperationArgs,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await gitAction(
    args.operation,
    args.branchName,
    args.commitMessage,
  );

  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
}

export function registerGitAction(server: McpServer): void {
  server.registerTool(
    'git_action',
    {
      description: 'Execute common Git operations directly',
      inputSchema: {},
    },
    execute as never,
  );
}
