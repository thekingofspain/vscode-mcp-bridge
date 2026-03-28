import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getCodeActions, applyCodeAction } from '../../vscode-api/languages/codeactions.js'

export async function execute(
  args: { filePath: string; startLine: number; startChar: number; endLine: number; endChar: number; actionIndex: number }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const actions = await getCodeActions(args.filePath, args.startLine, args.startChar, args.endLine, args.endChar)
  const action = (actions ?? [])[args.actionIndex]

  if (!action) throw new Error(`No code action at index ${args.actionIndex}`)

  let applied = false
  if ('edit' in action && action.edit) {
    await import('vscode').then(vscode => vscode.workspace.applyEdit(action.edit!))
    applied = true
  } else if ('command' in action && action.command) {
    const cmd = typeof action.command === 'string' ? action.command : action.command.command
    await import('vscode').then(vscode => vscode.commands.executeCommand(cmd))
    applied = true
  }

  return { content: [{ type: 'text', text: JSON.stringify({ applied, title: 'title' in action ? action.title : '' }) }] }
}

export function registerApplyCodeAction(server: McpServer): void {
  server.registerTool('apply_code_action', {
    description: 'Apply a code action by index (get index from get_code_actions first)',
    inputSchema: {}
  }, execute)
}
