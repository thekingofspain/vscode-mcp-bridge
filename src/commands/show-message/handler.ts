import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { showMessage } from '@vscode-api/window/ui.js';
import type { ShowMessageArgs } from '@type-defs/index.js';

export async function execute(
  args: ShowMessageArgs
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const selectedItem = await showMessage(args.message, args.level, args.items);

  return { content: [{ type: 'text', text: JSON.stringify({ selectedItem: selectedItem ?? null }) }] };
}

export function registerShowMessage(server: McpServer): void {
  server.registerTool('show_message', {
    description: 'Display a notification message to the user in the VS Code UI',
    inputSchema: {}
  }, execute as never);
}
