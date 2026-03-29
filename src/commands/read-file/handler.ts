import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { readFile } from '../../vscode-api/workspace/documents.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  args: { filePath: string; startLine?: number; endLine?: number }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await readFile(args.filePath, args.startLine, args.endLine)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerReadFile(server: McpServer): void {
  server.registerTool('read_file', {
    description: 'Read the contents of a file from the file system',
    inputSchema: {}
  }, execute as never)
}
