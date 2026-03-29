import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getDocumentSymbols } from '@vscode-api/workspace/symbols.js';
import { SymbolKind } from 'vscode';
import type { DocumentSymbol } from 'vscode';
import type { DocumentSymbolsArgs } from '@type-defs/index.js';

function symbolKindName(kind: SymbolKind): string {
  return SymbolKind[kind];
}

function serializeSymbols(symbols: DocumentSymbol[]): unknown {
  return symbols.map(s => ({
    name: s.name,
    kind: symbolKindName(s.kind),
    startLine: s.range.start.line,
    endLine: s.range.end.line,
    detail: s.detail,
    children: s.children.length > 0 ? serializeSymbols(s.children) : [],
  }));
}

export async function execute(
  args: DocumentSymbolsArgs
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const symbols = await getDocumentSymbols(args.filePath);
  const serialized = serializeSymbols(symbols);

  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] };
}

export function registerGetDocumentSymbols(server: McpServer): void {
  server.registerTool('get_document_symbols', {
    description: 'Get all symbols (functions, classes, variables, etc.) in a file',
    inputSchema: {}
  }, execute as never);
}
