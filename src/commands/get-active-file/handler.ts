import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getActiveFileSnapshot } from '../../vscode-api/workspace/documents.js'

/**
 * Get the currently active/open file in VS Code
 */
export async function execute(): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const snapshot = getActiveFileSnapshot()
  
  if (!snapshot) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({ error: 'No active file' }) 
      }] 
    }
  }
  
  return { 
    content: [{ 
      type: 'text', 
      text: JSON.stringify(snapshot) 
    }] 
  }
}

export function registerGetActiveFile(server: McpServer): void {
  server.registerTool('get_active_file', {
    description: 'Get the currently active/open file in VS Code',
    inputSchema: {}
  }, execute)
}
