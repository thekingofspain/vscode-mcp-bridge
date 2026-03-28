import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { addEditorDecoration } from '../../vscode-api/window/decorations.js'

export async function execute(
  args: { filePath: string; startLine: number; endLine: number; color?: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const success = await addEditorDecoration(args.filePath, args.startLine, args.endLine, args.color)
  return { content: [{ type: 'text', text: JSON.stringify({ success }) }] }
}

export function registerAddEditorDecoration(server: McpServer): void {
  server.registerTool('add_editor_decoration', {
    description: 'Highlight specific lines or ranges in the active editor to provide visual feedback',
    inputSchema: {}
  }, execute)
}
