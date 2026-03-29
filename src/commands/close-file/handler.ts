import { type z } from 'zod';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { toMcpResponse } from '@utils/response.js';
import { closeFile } from '@vscode-api/workspace/documents.js';
import { CloseFileInputSchema } from './schema.js';

export async function execute(
  args: z.infer<typeof CloseFileInputSchema>,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await closeFile(args.filePath);

  return toMcpResponse({ ...result, filePath: args.filePath });
}

export function registerCloseFile(server: McpServer): void {
  server.registerTool(
    'close_file',
    {
      description: 'Close a file tab in VS Code',
      inputSchema: CloseFileInputSchema,
    },
    execute as never,
  );
}
