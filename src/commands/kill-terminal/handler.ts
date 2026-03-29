import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { TerminalManager } from '../../services/TerminalManager.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js'

export async function execute(
  terminalManager: TerminalManager,
  args: { id: string }
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const ok = terminalManager.kill(args.id)
  if (!ok) throw new Error(`Terminal '${args.id}' not found`)
  return { content: [{ type: 'text', text: JSON.stringify({ killed: true }) }] }
}

export function registerKillTerminal(server: McpServer, terminalManager: TerminalManager): void {
  server.registerTool('kill_terminal', {
    description: 'Kill a managed terminal and its process',
    inputSchema: {}
  }, (args: Record<string, unknown>, _extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => execute(terminalManager, args as { id: string }))
}
