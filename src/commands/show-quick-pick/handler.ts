import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { showQuickPick } from '../../vscode-api/window/ui.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  args: { items: string[]; placeHolder?: string; canPickMany?: boolean }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const selectedItems = await showQuickPick(args.items, args.placeHolder, args.canPickMany)
  return { content: [{ type: 'text', text: JSON.stringify({ selectedItems: selectedItems ?? [] }) }] }
}

export function registerShowQuickPick(server: McpServer): void {
  server.registerTool('show_quick_pick', {
    description: 'Show a dropdown menu for the user to select from multiple options',
    inputSchema: {}
  }, execute as never)
}
