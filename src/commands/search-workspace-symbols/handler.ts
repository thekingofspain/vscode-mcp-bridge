import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getWorkspaceSymbols } from '@vscode-api/workspace/symbols.js';
import { SymbolKind } from 'vscode';
import type { WorkspaceSymbolSearchArgs } from '@type-defs/index.js';

function symbolKindName(kind: SymbolKind): string {
  return SymbolKind[kind];
}

export async function execute(
  args: WorkspaceSymbolSearchArgs
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const symbols = await getWorkspaceSymbols(args.query);
  const serialized = symbols.map(s => ({
    name: s.name,
    kind: symbolKindName(s.kind),
    filePath: s.location.uri.fsPath,
    startLine: s.location.range.start.line,
    containerName: s.containerName,
  }));

  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] };
}

export function registerSearchWorkspaceSymbols(server: McpServer): void {
  server.registerTool('search_workspace_symbols', {
    description: 'Search for symbols across the entire workspace',
    inputSchema: {}
  }, execute as never);
}
