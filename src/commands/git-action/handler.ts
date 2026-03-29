import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { gitAction } from '../../vscode-api/commands/git.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  args: { operation: 'commit' | 'checkout' | 'branch' | 'status'; branchName?: string; commitMessage?: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await gitAction(args.operation, args.branchName, args.commitMessage)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerGitAction(server: McpServer): void {
  server.registerTool('git_action', {
    description: 'Execute common Git operations directly',
    inputSchema: {}
  }, execute as never)
}
