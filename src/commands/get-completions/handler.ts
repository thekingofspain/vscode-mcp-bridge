import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getCompletions } from '@vscode-api/languages/completions.js';
import type { FilePositionWithTrigger } from '@type-defs/index.js';

export async function execute(
  args: FilePositionWithTrigger
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const completions = await getCompletions(args.filePath, args.line, args.character, args.triggerCharacter);
  const serialized = (completions?.items ?? []).map(c => ({
    label: typeof c.label === 'string' ? c.label : c.label.label,
    kind: c.kind !== undefined ? c.kind.toString() : 'Unknown',
    detail: c.detail,
    documentation: typeof c.documentation === 'string' ? c.documentation : c.documentation?.value,
  }));

  return { content: [{ type: 'text', text: JSON.stringify({ completions: serialized }) }] };
}

export function registerGetCompletions(server: McpServer): void {
  server.registerTool('get_completions', {
    description: 'Get IntelliSense completion suggestions at a specific position using LSP',
    inputSchema: {}
  }, execute as never);
}
