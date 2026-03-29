import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FilePosition } from '@type-defs/index.js';
import { getDefinition } from '@vscode-api/languages/definitions.js';

export async function execute(
  args: FilePosition,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const defs = await getDefinition(args.filePath, args.line, args.character);
  const serialized = defs.map((d) => {
    if ('uri' in d) {
      return {
        filePath: d.uri.fsPath,
        startLine: d.range.start.line,
        startChar: d.range.start.character,
        endLine: d.range.end.line,
        endChar: d.range.end.character,
      };
    }

    return {
      filePath: d.targetUri.fsPath,
      startLine: d.targetRange.start.line,
      startChar: d.targetRange.start.character,
      endLine: d.targetRange.end.line,
      endChar: d.targetRange.end.character,
    };
  });

  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] };
}

export function registerGoToDefinition(server: McpServer): void {
  server.registerTool(
    'go_to_definition',
    {
      description:
        'Get the definition location(s) of a symbol at a given position using LSP',
      inputSchema: {},
    },
    execute as never,
  );
}
