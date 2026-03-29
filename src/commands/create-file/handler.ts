import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { createFile } from '../../vscode-api/workspace/filesystem.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  args: { filePath: string; content?: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  await createFile(args.filePath, args.content)
  return { content: [{ type: 'text', text: JSON.stringify({ created: true, filePath: args.filePath }) }] }
}

export function registerCreateFile(server: McpServer): void {
  server.registerTool('create_file', {
    description: 'Create a new file',
    inputSchema: {}
  }, execute as never)
}
