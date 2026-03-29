import * as vscode from 'vscode';
import {
  getSettings,
  isContextPushEnabled,
  onDidChangeConfig,
} from '@config/Settings.js';
import { HttpServer, SERVER_HOST } from '@mcp/server/HttpServer.js';
import { ContextPusher } from '@services/ContextPusher.js';
import { TerminalManager } from '@services/TerminalManager.js';
import { log } from '@utils/logger.js';

// Status bar update interval (ms) - balances responsiveness with performance
const STATUS_BAR_UPDATE_INTERVAL = 2000;
let httpServer: HttpServer | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;
let contextPusher: ContextPusher | undefined;
let terminalManager: TerminalManager | undefined;
let statusUpdateInterval: NodeJS.Timeout | undefined;

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const outputChannel = vscode.window.createOutputChannel('MCP Bridge');

  context.subscriptions.push(outputChannel);
  log.init(outputChannel, 'debug');
  log.info('Extension', 'Activating MCP Bridge extension');

  // Terminal manager for long-running processes
  terminalManager = new TerminalManager();
  log.info('Extension', 'Terminal manager initialized');

  // Context pusher (auto-push events to connected agents)
  contextPusher = new ContextPusher();

  if (isContextPushEnabled()) {
    contextPusher.start();
  }

  // Status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBarItem.command = 'mcpServer.showStatus';
  context.subscriptions.push(statusBarItem);

  // Start HTTP server
  httpServer = new HttpServer(contextPusher, terminalManager);

  async function startServer(): Promise<void> {
    try {
      const port = getSettings().port;

      log.info('Server', `Starting HTTP server on port ${String(port)}`);

      if (!httpServer) return;

      const actualPort = await httpServer.start(port);

      updateStatusBar(actualPort, 0);
      log.info('Server', `HTTP server listening on port ${String(actualPort)}`);
      vscode.window.showInformationMessage(
        `MCP Server running on http://${SERVER_HOST}:${String(actualPort)}`,
      );
    } catch (err) {
      log.error('Server', `Failed to start HTTP server`, err);
      vscode.window.showErrorMessage(
        `MCP Server failed to start: ${String(err)}`,
      );
      updateStatusBar(0, 0, true);
    }
  }

  async function stopServer(): Promise<void> {
    if (httpServer) {
      log.info('Server', 'Stopping HTTP server');
      await httpServer.stop();
      updateStatusBar(0, 0);
      vscode.window.showInformationMessage('MCP Server stopped.');
    }
  }

  function updateStatusBar(port: number, agents: number, error = false): void {
    if (!statusBarItem) return;

    if (error) {
      statusBarItem.text = '$(error) MCP Error';
      statusBarItem.tooltip = 'MCP Server failed to start. Click for options.';
      statusBarItem.backgroundColor = new vscode.ThemeColor(
        'statusBarItem.errorBackground',
      );
    } else if (port === 0) {
      statusBarItem.text = '$(circle-slash) MCP Stopped';
      statusBarItem.tooltip = 'MCP Server is stopped. Click to start.';
      statusBarItem.backgroundColor = undefined;
    } else {
      statusBarItem.text = `$(radio-tower) MCP :${String(port)}${agents > 0 ? ` | ${String(agents)} agent${agents !== 1 ? 's' : ''}` : ''}`;
      statusBarItem.tooltip = `MCP Server running on port ${String(port)}. Click for options.`;
      statusBarItem.backgroundColor = undefined;
    }

    statusBarItem.show();
  }

  // Update agent count on connections changing
  statusUpdateInterval = setInterval(() => {
    if (httpServer && httpServer.port > 0) {
      updateStatusBar(httpServer.port, httpServer.connectionCount);
    }
  }, STATUS_BAR_UPDATE_INTERVAL);

  // Clean up interval on extension deactivation
  context.subscriptions.push({
    dispose: () => {
      if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
        statusUpdateInterval = undefined;
      }
    },
  });

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('mcpServer.start', startServer),
    vscode.commands.registerCommand('mcpServer.stop', stopServer),
    vscode.commands.registerCommand('mcpServer.restart', async () => {
      await stopServer();
      await startServer();
    }),
    vscode.commands.registerCommand('mcpServer.copyConnectionUrl', async () => {
      if (!httpServer || httpServer.port === 0) {
        vscode.window.showWarningMessage('MCP Server is not running.');
        return;
      }

      const url = `http://${SERVER_HOST}:${String(httpServer.port)}/sse`;

      await vscode.env.clipboard.writeText(url);
      vscode.window.showInformationMessage(`Copied: ${url}`);
    }),
    vscode.commands.registerCommand('mcpServer.showStatus', async () => {
      if (!httpServer || httpServer.port === 0) {
        const choice = await vscode.window.showQuickPick(['Start Server'], {
          placeHolder: 'MCP Server is stopped',
        });

        if (choice === 'Start Server') await startServer();

        return;
      }

      const url = `http://${SERVER_HOST}:${String(httpServer.port)}/sse`;
      const choice = await vscode.window.showQuickPick(
        [
          `Connected agents: ${String(httpServer.connectionCount)}`,
          'Copy connection URL',
          'Stop server',
        ],
        { placeHolder: `MCP Server on port ${String(httpServer.port)}` },
      );

      if (choice === 'Copy connection URL') {
        await vscode.env.clipboard.writeText(url);
        vscode.window.showInformationMessage(`Copied: ${url}`);
      } else if (choice === 'Stop server') {
        await stopServer();
      }
    }),
  );

  // Restart server if settings change
  context.subscriptions.push(
    onDidChangeConfig(() => {
      void (async () => {
        try {
          await stopServer();

          if (isContextPushEnabled()) {
            contextPusher?.start();
          } else {
            contextPusher?.stop();
          }

          await startServer();
        } catch (err) {
          log.error(
            'Extension',
            'Failed to restart server on settings change',
            err,
          );
          vscode.window.showErrorMessage(
            'Failed to restart MCP server after settings change',
          );
        }
      })();
    }),
  );

  // Auto-start
  await startServer();
}

export async function deactivate(): Promise<void> {
  log.info('Extension', 'Deactivating MCP Bridge extension');

  // Clean up status update interval
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval);
    statusUpdateInterval = undefined;
  }

  terminalManager?.dispose();
  contextPusher?.stop();
  await httpServer?.stop();
}
