import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getOpenTabs } from '@vscode-api/window/editors.js';

export function execute(): { content: [{ type: 'text'; text: string }] } {
  const tabs = getOpenTabs();

  return { content: [{ type: 'text', text: JSON.stringify(tabs) }] };
}

export function registerGetOpenTabs(server: McpServer): void {
  server.registerTool(
    'get_open_tabs',
    {
      description: 'Get all currently open file tabs in VS Code',
      inputSchema: {},
    },
    execute as never,
  );
}
