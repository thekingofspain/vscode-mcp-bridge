import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { requestInput } from '@vscode-api/window/ui.js';
import type { RequestInputArgs } from '@type-defs/index.js';

export async function execute(
  args: RequestInputArgs
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const inputValue = await requestInput(args.prompt, args.placeHolder, args.value);

  return { content: [{ type: 'text', text: JSON.stringify({ value: inputValue ?? null }) }] };
}

export function registerRequestInput(server: McpServer): void {
  server.registerTool('request_input', {
    description: 'Prompt the user for direct free-text input',
    inputSchema: {}
  }, execute as never);
}
