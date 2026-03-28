import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getDocumentSymbols } from '../../vscode-api/workspace/symbols.js'

function symbolKindName(kind: number): string {
  const kinds = ['File', 'Module', 'Namespace', 'Package', 'Class', 'Method', 'Property', 'Field', 'Constructor',
    'Enum', 'Interface', 'Function', 'Variable', 'Constant', 'String', 'Number', 'Boolean', 'Array', 'Object',
    'Key', 'Null', 'EnumMember', 'Struct', 'Event', 'Operator', 'TypeParameter']
  return kinds[kind] ?? 'Unknown'
}

function serializeSymbols(symbols: any[]): unknown {
  return symbols.map(s => ({
    name: s.name,
    kind: symbolKindName(s.kind),
    startLine: s.range.start.line,
    endLine: s.range.end.line,
    detail: s.detail ?? null,
    children: s.children ? serializeSymbols(s.children) : [],
  }))
}

export async function execute(
  args: { filePath: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const symbols = await getDocumentSymbols(args.filePath)
  const serialized = serializeSymbols(symbols ?? [])
  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
}

export function registerGetDocumentSymbols(server: McpServer): void {
  server.registerTool('get_document_symbols', {
    description: 'Get all symbols (functions, classes, variables, etc.) in a file',
    inputSchema: {}
  }, execute)
}
