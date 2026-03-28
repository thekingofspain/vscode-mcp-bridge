import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { showDiff } from '../../vscode-api/window/editors.js'

export async function execute(
  args: { filePath: string; newContent: string; title?: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  await showDiff(args.filePath, args.newContent, args.title)
  return { content: [{ type: 'text', text: JSON.stringify({ shown: true, filePath: args.filePath }) }] }
}

export function registerShowDiff(server: McpServer): void {
  server.registerTool('show_diff', {
    description: 'Show a visual diff in VS Code before applying file changes. Does NOT write the file.',
    inputSchema: {}
  }, execute)
}
