import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FilePosition } from '@type-defs/index.js';
import { serializeLocations } from '@utils/location.js';
import { getImplementation } from '@vscode-api/languages/definitions.js';

export async function execute(
  args: FilePosition,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const defs = await getImplementation(
    args.filePath,
    args.line,
    args.character,
  );
  const serialized = serializeLocations(defs);

  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] };
}

export function registerGoToImplementation(server: McpServer): void {
  server.registerTool(
    'go_to_implementation',
    {
      description:
        'Get the implementation location(s) of a symbol at a given position using LSP',
      inputSchema: {},
    },
    execute as never,
  );
}
