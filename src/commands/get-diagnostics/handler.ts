import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getDiagnostics } from '../../vscode-api/workspace/diagnostics.js'

export async function execute(
  args: { 
    scope: 'open_files' | 'workspace' | 'git_delta' | 'folder' | 'file'
    targetPath?: string
    recursive?: boolean
    severity?: 'error' | 'warning' | 'information' | 'hint'
  }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const diags = await getDiagnostics(args)
  return { content: [{ type: 'text', text: JSON.stringify(diags) }] }
}

export function registerGetDiagnostics(server: McpServer): void {
  server.registerTool('get_diagnostics', {
    description: 'Get LSP diagnostics with expanded filtering options (Git delta, recursive folders)',
    inputSchema: {}
  }, execute)
}
