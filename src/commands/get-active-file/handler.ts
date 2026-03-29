import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { toMcpResponse } from '@utils/response.js';
import { getActiveFileSnapshot } from '@vscode-api/workspace/documents.js';

/**
 * Get the currently active/open file in VS Code
 */
export function execute(): { content: [{ type: 'text'; text: string }] } {
  const snapshot = getActiveFileSnapshot();

  if (!snapshot) {
    return toMcpResponse({ error: 'No active file' });
  }

  return toMcpResponse(snapshot);
}

export function registerGetActiveFile(server: McpServer): void {
  server.registerTool(
    'get_active_file',
    {
      description: 'Get the currently active/open file in VS Code',
      inputSchema: {},
    },
    execute as never,
  );
}
