import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { TerminalManager } from '../../services/TerminalManager.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  terminalManager: TerminalManager,
  args: { command: string; cwd?: string; timeoutMs?: number }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await terminalManager.runCommand(args.command, args.cwd, args.timeoutMs)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}

export function registerRunTerminalCommand(server: McpServer, terminalManager: TerminalManager): void {
  server.registerTool('run_terminal_command', {
    description: 'Run a shell command and capture its output',
    inputSchema: {}
  }, (args: Record<string, unknown>, _extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => execute(terminalManager, args as { command: string; cwd?: string; timeoutMs?: number }))
}
