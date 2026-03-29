import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getCodeActions } from '../../vscode-api/languages/codeactions.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  args: { filePath: string; startLine: number; startChar: number; endLine: number; endChar: number }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const actions = await getCodeActions(args.filePath, args.startLine, args.startChar, args.endLine, args.endChar)
  interface AnyAction { title: string; kind?: { value: string }; isPreferred?: boolean }
  const serialized = (actions ?? []).map((a, i) => {
    const action = a as AnyAction
    return {
      index: i,
      title: action.title,
      kind: action.kind?.value ?? null,
      isPreferred: action.isPreferred ?? false,
    }
  })
  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
}

export function registerGetCodeActions(server: McpServer): void {
  server.registerTool('get_code_actions', {
    description: 'Get available code actions (quick fixes, refactors) for a range in a file',
    inputSchema: {}
  }, execute as never)
}
