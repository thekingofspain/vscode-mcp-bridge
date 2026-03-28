import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { writeFile } from '../../vscode-api/workspace/filesystem.js'

export async function execute(
  args: { filePath: string; content: string; createIfMissing?: boolean }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await writeFile(args.filePath, args.content, args.createIfMissing)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerWriteFile(server: McpServer): void {
  server.registerTool('write_file', {
    description: 'Write content to a file. Integrates with VS Code undo history.',
    inputSchema: {}
  }, execute)
}
