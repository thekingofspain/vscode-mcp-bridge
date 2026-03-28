import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { closeFile } from '../../vscode-api/workspace/documents.js'

export async function execute(
  args: { filePath: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await closeFile(args.filePath)
  return { content: [{ type: 'text', text: JSON.stringify({ ...result, filePath: args.filePath }) }] }
}

export function registerCloseFile(server: McpServer): void {
  server.registerTool('close_file', {
    description: 'Close a file tab in VS Code',
    inputSchema: {}
  }, execute)
}
