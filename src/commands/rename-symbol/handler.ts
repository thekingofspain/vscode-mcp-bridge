import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { renameSymbol } from '../../vscode-api/languages/references.js'

export async function execute(
  args: { filePath: string; line: number; character: number; newName: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await renameSymbol(args.filePath, args.line, args.character, args.newName)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerRenameSymbol(server: McpServer): void {
  server.registerTool('rename_symbol', {
    description: 'Rename a symbol and all its references across the workspace',
    inputSchema: {}
  }, execute)
}
