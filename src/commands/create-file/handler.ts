import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createFile } from '@vscode-api/workspace/filesystem.js';
import { toMcpResponse } from '@utils/response.js';
import type { FileCreateArgs } from '@type-defs/index.js';

export async function execute(
  args: FileCreateArgs
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  await createFile(args.filePath, args.content);
  return toMcpResponse({ created: true, filePath: args.filePath });
}

export function registerCreateFile(server: McpServer): void {
  server.registerTool('create_file', {
    description: 'Create a new file',
    inputSchema: {}
  }, execute as never);
}
