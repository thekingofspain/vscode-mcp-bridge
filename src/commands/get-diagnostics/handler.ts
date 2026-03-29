import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { toMcpResponse } from '@utils/response.js';
import { getDiagnostics } from '@vscode-api/workspace/diagnostics.js';
import type { GetDiagnosticsOptions } from './types.js';

export async function execute(
  args: GetDiagnosticsOptions,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const diags = await getDiagnostics(args);

  return toMcpResponse(diags);
}

export function registerGetDiagnostics(server: McpServer): void {
  server.registerTool(
    'get_diagnostics',
    {
      description:
        'Get LSP diagnostics with expanded filtering options (Git delta, recursive folders)',
      inputSchema: {},
    },
    execute as never,
  );
}
