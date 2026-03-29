import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FileReadArgs } from '@type-defs/index.js';
import { toMcpResponse } from '@utils/response.js';
import { readFile } from '@vscode-api/workspace/documents.js';

export async function execute(
  args: FileReadArgs,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await readFile(args.filePath, args.startLine, args.endLine);

  return toMcpResponse(result);
}

export function registerReadFile(server: McpServer): void {
  server.registerTool(
    'read_file',
    {
      description: 'Read the contents of a file from the file system',
      inputSchema: {},
    },
    execute as never,
  );
}
