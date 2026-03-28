import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { requestInput } from '../../vscode-api/window/ui.js'

export async function execute(
  args: { prompt: string; placeHolder?: string; value?: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const inputValue = await requestInput(args.prompt, args.placeHolder, args.value)
  return { content: [{ type: 'text', text: JSON.stringify({ value: inputValue ?? null }) }] }
}

export function registerRequestInput(server: McpServer): void {
  server.registerTool('request_input', {
    description: 'Prompt the user for direct free-text input',
    inputSchema: {}
  }, execute)
}
