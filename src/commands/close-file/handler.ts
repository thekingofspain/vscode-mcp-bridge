import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { closeFile } from '@vscode-api/workspace/documents.js';
import { toMcpResponse } from '@utils/response.js';
import type { FileOperationArgs } from '@type-defs/index.js';

export async function execute(
  args: FileOperationArgs
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await closeFile(args.filePath);

  return toMcpResponse({ ...result, filePath: args.filePath });
}

export function registerCloseFile(server: McpServer): void {
  server.registerTool('close_file', {
    description: 'Close a file tab in VS Code',
    inputSchema: {}
  }, execute as never);
}
