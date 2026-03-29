import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FilePosition } from '@type-defs/index.js';
import { getHover } from '@vscode-api/languages/hover.js';

export async function execute(
  args: FilePosition,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const hovers = await getHover(args.filePath, args.line, args.character);
  const contents = hovers.flatMap((h) => {
    const c = h.contents;

    if (Array.isArray(c)) {
      return c.map((item) =>
        typeof item === 'string' ? item : (item as { value: string }).value,
      );
    }

    return [typeof c === 'string' ? c : (c as { value: string }).value];
  });

  return { content: [{ type: 'text', text: JSON.stringify({ contents }) }] };
}

export function registerGetHover(server: McpServer): void {
  server.registerTool(
    'get_hover',
    {
      description:
        'Get hover information (type info, documentation) for a symbol at a given position',
      inputSchema: {},
    },
    execute as never,
  );
}
