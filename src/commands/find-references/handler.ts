import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getReferences } from '../../vscode-api/languages/references.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  args: { filePath: string; line: number; character: number; includeDeclaration?: boolean }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const refs = await getReferences(args.filePath, args.line, args.character, args.includeDeclaration)
  const serialized = (refs ?? []).map(r => ({
    filePath: r.uri.fsPath,
    startLine: r.range.start.line,
    startChar: r.range.start.character,
    endLine: r.range.end.line,
    endChar: r.range.end.character,
  }))
  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
}

export function registerFindReferences(server: McpServer): void {
  server.registerTool('find_references', {
    description: 'Find all references to a symbol at a given position using LSP',
    inputSchema: {}
  }, execute as never)
}
