import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getWorkspaceSymbols } from '../../vscode-api/workspace/symbols.js'

function symbolKindName(kind: number): string {
  const kinds = ['File', 'Module', 'Namespace', 'Package', 'Class', 'Method', 'Property', 'Field', 'Constructor',
    'Enum', 'Interface', 'Function', 'Variable', 'Constant', 'String', 'Number', 'Boolean', 'Array', 'Object',
    'Key', 'Null', 'EnumMember', 'Struct', 'Event', 'Operator', 'TypeParameter']
  return kinds[kind] ?? 'Unknown'
}

export async function execute(
  args: { query: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const symbols = await getWorkspaceSymbols(args.query)
  const serialized = (symbols ?? []).map(s => ({
    name: s.name,
    kind: symbolKindName(s.kind),
    filePath: s.location.uri.fsPath,
    startLine: s.location.range.start.line,
    containerName: s.containerName ?? null,
  }))
  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
}

export function registerSearchWorkspaceSymbols(server: McpServer): void {
  server.registerTool('search_workspace_symbols', {
    description: 'Search for symbols across the entire workspace',
    inputSchema: {}
  }, execute)
}
