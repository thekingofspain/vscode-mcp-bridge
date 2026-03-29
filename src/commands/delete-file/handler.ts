import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { deleteFile } from '@vscode-api/workspace/filesystem.js';
import { toMcpResponse } from '@utils/response.js';
import type { FileOperationArgs } from '@type-defs/index.js';

export async function execute(
  args: FileOperationArgs
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  await deleteFile(args.filePath);
  return toMcpResponse({ deleted: true, filePath: args.filePath });
}

export function registerDeleteFile(server: McpServer): void {
  server.registerTool('delete_file', {
    description: 'Delete a file',
    inputSchema: {}
  }, execute as never);
}
