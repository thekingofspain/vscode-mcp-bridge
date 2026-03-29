// HTTP Server for MCP Bridge
// Manages HTTP server lifecycle and request routing

import { getServerHost, getSettings } from '@config/Settings.js';
import { MCP_SERVER_INSTRUCTIONS } from '@generated/instructions.js';
import { registerAllTools } from '@mcp/tools/registry.js';
import { ContextPusher } from '@services/ContextPusher.js';
import { TerminalManager } from '@services/TerminalManager.js';
import { log } from '@utils/logger.js';
import * as http from 'http';
import {
  checkAuth,
  handleHealth,
  handleNotFound,
  handleOptions,
  handleUnauthorized,
  setCorsHeaders,
} from './handlers.js';
import type { SessionManager } from './sessionManager.js';
import { createSessionManager } from './sessionManager.js';

const SERVER_HOST = getServerHost();

export { SERVER_HOST };

/**
 * HTTP Server for MCP Bridge
 *
 * Note: This is a stateful component managing server lifecycle and sessions.
 * A class is appropriate here as it:
 * - Maintains server state (port, sessions)
 * - Has a clear lifecycle (start/stop)
 * - Manages resources (HTTP server, connections)
 */
export class HttpServer {
  private httpServer: http.Server;
  private sessionManager: SessionManager;
  private actualPort = 0;

  constructor(
    private pusher: ContextPusher,
    private terminalManager: TerminalManager,
  ) {
    this.sessionManager = createSessionManager();
    this.httpServer = http.createServer((req, res) => { void this.handleRequest(req, res); });
  }

  get connectionCount(): number {
    return this.sessionManager.count();
  }

  get port(): number {
    return this.actualPort;
  }

  /**
   * Start the HTTP server on the preferred port (or next available)
   */
  async start(preferredPort: number): Promise<number> {
    log.info(HttpServer.name, `Starting HTTP server on port ${String(preferredPort)}`);

    if (this.actualPort > 0) {
      await this.stop();
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const port = preferredPort + attempt;

      try {
        await new Promise<void>((resolve, reject) => {
          this.httpServer.listen(port, SERVER_HOST, () => { resolve(); });
          this.httpServer.once('error', reject);
        });
        this.actualPort = port;
        log.info(HttpServer.name, `HTTP server listening on port ${String(port)}`);
        return port;
      } catch (err: unknown) {
        if ((err as NodeJS.ErrnoException).code !== 'EADDRINUSE') throw err;
      }
    }
    throw new Error(`Could not bind to any port in range ${String(preferredPort)}-${String(preferredPort + 4)}`);
  }

  /**
   * Stop the HTTP server and clean up all sessions
   */
  async stop(): Promise<void> {
    log.info(HttpServer.name, 'Stopping HTTP server');
    this.sessionManager.clear();
    await new Promise<void>((resolve) => this.httpServer.close(() => { resolve(); }));
  }

  /**
   * Handle incoming HTTP requests
   */
  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      handleOptions(res);
      return;
    }

    if (req.url === '/health') {
      handleHealth(res, this.sessionManager.count(), this.actualPort);
      return;
    }

    if (!checkAuth(req)) {
      handleUnauthorized(res, req.url);
      return;
    }

    if (req.url === '/sse' && req.method === 'GET') {
      await this.handleSse(req, res);
      return;
    }

    if (req.url?.startsWith('/messages') && req.method === 'POST') {
      await this.handleMessages(req, res);
      return;
    }

    handleNotFound(res);
  }

  /**
   * Handle SSE (Server-Sent Events) connection for MCP protocol
   */
  private async handleSse(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const { sessionId, transport, mcpServer } = this.sessionManager.create(MCP_SERVER_INSTRUCTIONS);

    log.info(HttpServer.name, `SSE session connected: ${sessionId} (total: ${String(this.sessionManager.count())})`);

    // Register all tools with the MCP server
    registerAllTools(mcpServer, this.terminalManager);

    // Wire context push events, gated on initialization
    let initialized = false;
    const unsubscribePush = getSettings().enableContextPush
      ? this.pusher.onPush((type, payload) => {
        if (!initialized) return;

        try {
          transport.send({
            jsonrpc: '2.0',
            method: 'notifications/message',
            params: {
              level: 'info',
              logger: 'vscode-mcp',
              data: { type, payload },
            },
          }).catch(() => undefined);
        } catch { /* connection may have closed */ }
      })
      : () => undefined;

    // Store unsubscribe function in session
    this.sessionManager.updateSession(sessionId, unsubscribePush);

    // Clean up on connection close
    req.on('close', () => {
      this.sessionManager.delete(sessionId);
      log.info(HttpServer.name, `SSE session disconnected: ${sessionId} (total: ${String(this.sessionManager.count())})`);
    });

    // Enable push notifications after handshake completes
    setTimeout(() => { initialized = true; }, 2000);

    try {
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res);
    } catch (err) {
      // Clean up on connection failure
      unsubscribePush();
      this.sessionManager.delete(sessionId);
      log.error(HttpServer.name, `Connection failed for session ${sessionId}`, err);
      throw err;
    }
  }

  /**
   * Handle POST messages to existing sessions
   */
  private async handleMessages(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '', `http://${SERVER_HOST}`);
    const sessionId = url.searchParams.get('sessionId') ?? '';
    const session = this.sessionManager.get(sessionId);

    if (!session) {
      log.warn(HttpServer.name, `Message for unknown session: ${sessionId}`);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }

    await session.transport.handleRequest(req, res);
  }
}
