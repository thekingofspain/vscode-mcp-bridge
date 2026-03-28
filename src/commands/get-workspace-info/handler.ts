import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getWorkspaceInfo } from '../../vscode-api/workspace/documents.js'

export async function execute(): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const info = getWorkspaceInfo()
  return { content: [{ type: 'text', text: JSON.stringify(info) }] }
}

export function registerGetWorkspaceInfo(server: McpServer): void {
  server.registerTool('get_workspace_info', {
    description: 'Get information about the current VS Code workspace',
    inputSchema: {}
  }, execute)
}
