// Types for MCP server

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export interface SessionEntry {
  transport: StreamableHTTPServerTransport
  unsubscribePush: () => void
  mcpServer: McpServer
}

export interface ServerConfig {
  port: number
  enableContextPush: boolean
}
