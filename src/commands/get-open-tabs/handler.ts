import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getOpenTabs } from '../../vscode-api/window/editors.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  _args: Record<string, unknown>,
  _extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const tabs = getOpenTabs()
  return { content: [{ type: 'text', text: JSON.stringify(tabs) }] }
}

export function registerGetOpenTabs(server: McpServer): void {
  server.registerTool('get_open_tabs', {
    description: 'Get all currently open file tabs in VS Code',
    inputSchema: {}
  }, execute as never)
}
