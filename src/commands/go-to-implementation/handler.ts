import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getImplementation } from '../../vscode-api/languages/definitions.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  args: { filePath: string; line: number; character: number }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const defs = await getImplementation(args.filePath, args.line, args.character)
  const serialized = (defs ?? []).map(d => {
    if ('uri' in d) {
      return { 
        filePath: d.uri.fsPath, 
        startLine: d.range.start.line, 
        startChar: d.range.start.character, 
        endLine: d.range.end.line, 
        endChar: d.range.end.character 
      }
    }
    return { 
      filePath: d.targetUri.fsPath, 
      startLine: d.targetRange.start.line, 
      startChar: d.targetRange.start.character, 
      endLine: d.targetRange.end.line, 
      endChar: d.targetRange.end.character 
    }
  })
  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
}

export function registerGoToImplementation(server: McpServer): void {
  server.registerTool('go_to_implementation', {
    description: 'Get the implementation location(s) of a symbol at a given position using LSP',
    inputSchema: {}
  }, execute as never)
}
