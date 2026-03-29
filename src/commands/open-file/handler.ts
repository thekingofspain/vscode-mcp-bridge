import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FileOpenArgs } from '@type-defs/index.js';
import { toMcpResponse } from '@utils/response.js';
import { openFile } from '@vscode-api/workspace/documents.js';

export async function execute(
  args: FileOpenArgs,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  await openFile(args.filePath, args.line, args.character, args.preview);
  return toMcpResponse({ opened: true, filePath: args.filePath });
}

export function registerOpenFile(server: McpServer): void {
  server.registerTool(
    'open_file',
    {
      description: 'Open a file in the VS Code editor',
      inputSchema: {},
    },
    execute as never,
  );
}
