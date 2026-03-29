import * as vscode from 'vscode';

const CONFIG_SECTION = 'mcpServer';
const CONFIG = vscode.workspace.getConfiguration(CONFIG_SECTION);

/**
 * Current MCP server port
 */
export function getPort(): number {
  return CONFIG.get<number>('port') ?? 3333;
}

/**
 * Whether context pushing is enabled
 */
export function isContextPushEnabled(): boolean {
  return CONFIG.get<boolean>('enableContextPush') ?? true;
}

/**
 * Bearer token for HTTP authentication (empty string = no auth)
 */
export function getAuthToken(): string {
  return CONFIG.get<string>('authToken') ?? '';
}

/**
 * List of VS Code commands allowed via execute_vscode_command tool
 */
export function getAllowedCommands(): string[] {
  return CONFIG.get<string[]>('allowedCommands') ?? [];
}

/**
 * Server host address
 */
export function getServerHost(): string {
  return CONFIG.get<string>('serverHost') ?? '127.0.0.1';
}

/**
 * Subscribe to configuration changes
 * Callback fires when any mcpServer.* setting changes
 */
export function onDidChangeConfig(cb: () => void): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(CONFIG_SECTION)) cb();
  });
}

/**
 * Get all settings as a single object
 * Useful for passing to components that need multiple settings
 */
export interface McpServerSettings {
  port: number;
  enableContextPush: boolean;
  authToken: string;
  allowedCommands: string[];
  serverHost: string;
}

export function getSettings(): McpServerSettings {
  return {
    port: getPort(),
    enableContextPush: isContextPushEnabled(),
    authToken: getAuthToken(),
    allowedCommands: getAllowedCommands(),
    serverHost: getServerHost(),
  };
}
