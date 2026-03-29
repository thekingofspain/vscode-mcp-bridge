import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FileWriteArgs } from '@type-defs/index.js';
import { toMcpResponse } from '@utils/response.js';
import { writeFile } from '@vscode-api/workspace/filesystem.js';

export async function execute(
  args: FileWriteArgs,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await writeFile(
    args.filePath,
    args.content,
    args.createIfMissing,
  );

  return toMcpResponse(result);
}

export function registerWriteFile(server: McpServer): void {
  server.registerTool(
    'write_file',
    {
      description:
        'Write content to a file. Integrates with VS Code undo history.',
      inputSchema: {},
    },
    execute as never,
  );
}
