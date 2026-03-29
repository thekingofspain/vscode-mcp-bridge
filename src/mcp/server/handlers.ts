// HTTP Server request handlers
// Separated from HttpServer for better testability and organization

import { getAuthToken } from '@config/Settings.js';
import { log } from '@utils/logger.js';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Check if request is authorized
 */
export function checkAuth(req: IncomingMessage): boolean {
  const token = getAuthToken();

  if (token === '') return true;

  const header = req.headers.authorization ?? '';

  return header === `Bearer ${token}`;
}

/**
 * Handle health check endpoint
 */
export function handleHealth(
  res: ServerResponse,
  sessionCount: number,
  port: number
): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    version: '0.2.5',
    connectedAgents: sessionCount,
    port,
  }));
}

/**
 * Handle CORS preflight requests
 */
export function handleOptions(res: ServerResponse): void {
  res.writeHead(204);
  res.end();
}

/**
 * Set CORS headers on response
 */
export function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

/**
 * Handle unauthorized requests
 */
export function handleUnauthorized(res: ServerResponse, url?: string): void {
  log.warn('Server', `Unauthorized request to ${String(url)}`);
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Unauthorized' }));
}

/**
 * Handle 404 Not Found
 */
export function handleNotFound(res: ServerResponse): void {
  res.writeHead(404);
  res.end();
}
