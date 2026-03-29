import { type z } from 'zod';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { toMcpResponse } from '@utils/response.js';
import { deleteFile } from '@vscode-api/workspace/filesystem.js';
import { DeleteFileInputSchema } from './schema.js';

export async function execute(
  args: z.infer<typeof DeleteFileInputSchema>,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  await deleteFile(args.filePath);
  return toMcpResponse({ deleted: true, filePath: args.filePath });
}

export function registerDeleteFile(server: McpServer): void {
  server.registerTool(
    'delete_file',
    {
      description: 'Delete a file from the file system',
      inputSchema: DeleteFileInputSchema,
    },
    execute as never,
  );
}
