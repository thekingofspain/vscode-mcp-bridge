// Session management for MCP server connections
// Functional implementation using closure-based state

import { randomUUID } from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { log } from '@utils/logger.js';
import type { SessionEntry } from './types.js';

/**
 * Session state container
 */
interface SessionState {
  sessions: Map<string, SessionEntry>;
}

/**
 * Create a new session manager
 * Returns an object with session management functions
 */
export function createSessionManager(): {
  count: () => number;
  get: (sessionId: string) => SessionEntry | undefined;
  create: (instructions: string) => {
    sessionId: string;
    transport: StreamableHTTPServerTransport;
    mcpServer: McpServer;
  };
  updateSession: (sessionId: string, unsubscribePush: () => void) => void;
  delete: (sessionId: string) => void;
  clear: () => void;
} {
  const state: SessionState = { sessions: new Map() };

  function count(): number {
    return state.sessions.size;
  }

  function get(sessionId: string): SessionEntry | undefined {
    return state.sessions.get(sessionId);
  }

  function create(instructions: string): {
    sessionId: string;
    transport: StreamableHTTPServerTransport;
    mcpServer: McpServer;
  } {
    const sessionId = randomUUID();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
    });
    const mcpServer = new McpServer(
      { name: 'vscode-mcp-bridge', version: '0.2.5' },
      { instructions },
    );

    state.sessions.set(sessionId, {
      transport,
      unsubscribePush: () => undefined,
      mcpServer,
    });

    log.info(
      'Server',
      `SSE session connected: ${sessionId} (total: ${String(count())})`,
    );

    return { sessionId, transport, mcpServer };
  }

  function updateSession(sessionId: string, unsubscribePush: () => void): void {
    const session = state.sessions.get(sessionId);

    if (session) {
      session.unsubscribePush = unsubscribePush;
    }
  }

  function del(sessionId: string): void {
    const session = state.sessions.get(sessionId);

    if (session) {
      session.unsubscribePush();
      state.sessions.delete(sessionId);
      log.info(
        'Server',
        `SSE session disconnected: ${sessionId} (total: ${String(count())})`,
      );
    }
  }

  function clear(): void {
    for (const [, session] of state.sessions) {
      session.unsubscribePush();
    }
    state.sessions.clear();
  }

  return { count, get, create, updateSession, delete: del, clear };
}

export type SessionManager = ReturnType<typeof createSessionManager>;
