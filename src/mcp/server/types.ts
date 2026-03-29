// Types for MCP server

import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export interface SessionEntry {
  transport: StreamableHTTPServerTransport;
  unsubscribePush: () => void;
  mcpServer: McpServer;
}

export interface ServerConfig {
  port: number;
  enableContextPush: boolean;
}
