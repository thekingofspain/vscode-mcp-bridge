import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { openFile } from '../../vscode-api/workspace/documents.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  args: { filePath: string; line?: number; character?: number; preview?: boolean }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  await openFile(args.filePath, args.line, args.character, args.preview)
  return { content: [{ type: 'text', text: JSON.stringify({ opened: true, filePath: args.filePath }) }] }
}

export function registerOpenFile(server: McpServer): void {
  server.registerTool('open_file', {
    description: 'Open a file in the VS Code editor',
    inputSchema: {}
  }, execute as never)
}
