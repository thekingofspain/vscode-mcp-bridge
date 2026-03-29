import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { deleteFile } from '../../vscode-api/workspace/filesystem.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  args: { filePath: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  await deleteFile(args.filePath)
  return { content: [{ type: 'text', text: JSON.stringify({ deleted: true, filePath: args.filePath }) }] }
}

export function registerDeleteFile(server: McpServer): void {
  server.registerTool('delete_file', {
    description: 'Delete a file',
    inputSchema: {}
  }, execute as never)
}
