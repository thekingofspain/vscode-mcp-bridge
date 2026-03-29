import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FilePositionWithTrigger } from '@type-defs/index.js';
import { getSignatureHelp } from '@vscode-api/languages/signature.js';

export async function execute(
  args: FilePositionWithTrigger,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const help = await getSignatureHelp(
    args.filePath,
    args.line,
    args.character,
    args.triggerCharacter,
  );

  if (!help) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            activeSignature: 0,
            activeParameter: 0,
            signatures: [],
          }),
        },
      ],
    };
  }

  const serialized = {
    activeSignature: help.activeSignature,
    activeParameter: help.activeParameter,
    signatures: help.signatures.map((s) => ({
      label: s.label,
      documentation:
        typeof s.documentation === 'string'
          ? s.documentation
          : s.documentation?.value,
      parameters: s.parameters.map((p) => ({
        label:
          typeof p.label === 'string'
            ? p.label
            : Array.isArray(p.label)
              ? p.label.map((n) => n.toString()).join(',')
              : '',
        documentation:
          typeof p.documentation === 'string'
            ? p.documentation
            : p.documentation?.value,
      })),
    })),
  };

  return { content: [{ type: 'text', text: JSON.stringify(serialized) }] };
}

export function registerGetSignatureHelp(server: McpServer): void {
  server.registerTool(
    'get_signature_help',
    {
      description:
        'Get parameter hints and signature information for a function call using LSP',
      inputSchema: {},
    },
    execute as never,
  );
}
