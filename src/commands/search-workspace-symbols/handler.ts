import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { WorkspaceSymbolSearchArgs } from '@type-defs/index.js';
import { getSymbolKindName, getWorkspaceSymbols } from '@vscode-api/workspace/symbols.js';

export async function execute(
  args: WorkspaceSymbolSearchArgs,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const symbols = await getWorkspaceSymbols(args.query);
  const serialized = symbols.map((s) => ({
    name: s.name,
    kind: getSymbolKindName(s.kind),
    filePath: s.location.uri.fsPath,
    startLine: s.location.range.start.line,
    containerName: s.containerName,
  }));

  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] };
}

export function registerSearchWorkspaceSymbols(server: McpServer): void {
  server.registerTool(
    'search_workspace_symbols',
    {
      description: 'Search for symbols across the entire workspace',
      inputSchema: {},
    },
    execute as never,
  );
}
