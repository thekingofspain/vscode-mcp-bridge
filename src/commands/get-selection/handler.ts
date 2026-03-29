import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getSelectionSnapshot } from '../../vscode-api/window/editors.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  _args: Record<string, unknown>,
  _extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const snapshot = getSelectionSnapshot()
  
  if (!snapshot) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'No selection' }) }] }
  }
  
  return { content: [{ type: 'text', text: JSON.stringify(snapshot) }] }
}

export function registerGetSelection(server: McpServer): void {
  server.registerTool('get_selection', {
    description: 'Get the current text selection and cursor position',
    inputSchema: {}
  }, execute as never)
}
