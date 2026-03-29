import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getRepoMap } from '@vscode-api/workspace/symbols.js';
import type { RepoMapArgs } from '@type-defs/index.js';

export async function execute(
  args: RepoMapArgs
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const map = await getRepoMap(args.directory, args.limit);

  return { content: [{ type: 'text', text: map }] };
}

export function registerGetRepoMap(server: McpServer): void {
  server.registerTool('get_repo_map', {
    description: 'Generate an AST-based global symbol map of the repository to provide context to agents',
    inputSchema: {}
  }, execute as never);
}
