import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { showDiff } from '@vscode-api/window/editors.js';
import type { FileDiffArgs } from '@type-defs/index.js';

export async function execute(
  args: FileDiffArgs
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  await showDiff(args.filePath, args.newContent, args.title);
  return { content: [{ type: 'text', text: JSON.stringify({ shown: true, filePath: args.filePath }) }] };
}

export function registerShowDiff(server: McpServer): void {
  server.registerTool('show_diff', {
    description: 'Show a visual diff in VS Code before applying file changes. Does NOT write the file.',
    inputSchema: {}
  }, execute as never);
}
