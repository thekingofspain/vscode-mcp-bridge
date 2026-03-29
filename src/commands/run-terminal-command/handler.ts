import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TerminalManager } from '@services/TerminalManager.js';
import type { TerminalCommandArgs } from '@type-defs/index.js';

export async function execute(
  terminalManager: TerminalManager,
  args: TerminalCommandArgs,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await terminalManager.runCommand(
    args.command,
    args.cwd,
    args.timeoutMs,
  );

  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
}

export function registerRunTerminalCommand(
  server: McpServer,
  terminalManager: TerminalManager,
): void {
  server.registerTool(
    'run_terminal_command',
    {
      description: 'Run a shell command and capture its output',
      inputSchema: {},
    },
    (args: Record<string, unknown>) =>
      execute(
        terminalManager,
        args as { command: string; cwd?: string; timeoutMs?: number },
      ),
  );
}
