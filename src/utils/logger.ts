import type * as vscode from 'vscode';

/**
 * Logger configuration - single source of truth for log levels and priorities
 * Pattern: Winston/pino style - object with `as const` for type inference
 */
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

interface Logger {
  init(channel: vscode.OutputChannel, level?: LogLevel): void;
  setLevel(level: LogLevel): void;
  debug(component: string, message: string, data?: unknown): void;
  info(component: string, message: string, data?: unknown): void;
  warn(component: string, message: string, data?: unknown): void;
  error(component: string, message: string, data?: unknown): void;
}

export const log: Logger = (() => {
  let channel: vscode.OutputChannel | null = null;
  let level: LogLevel = 'info';

  function logMessage(
    logLevel: LogLevel,
    component: string,
    message: string,
    data?: unknown,
  ): void {
    if (LOG_LEVELS[logLevel] >= LOG_LEVELS[level]) {
      const timestamp = new Date().toISOString().slice(11, 23);
      const prefix = `[${timestamp}] [${logLevel.toUpperCase()}] [${component}]`;
      const line =
        data !== undefined
          ? `${prefix} ${message} ${JSON.stringify(data)}`
          : `${prefix} ${message}`;

      channel?.appendLine(line);

      if (logLevel === 'error') {
        console.error(`[MCP Bridge] ${line}`);
      }
    }
  }

  return {
    init(outputChannel: vscode.OutputChannel, logLevel?: LogLevel): void {
      channel = outputChannel;

      if (logLevel) level = logLevel;
    },

    setLevel(logLevel: LogLevel): void {
      level = logLevel;
    },

    debug(component: string, message: string, data?: unknown): void {
      logMessage('debug', component, message, data);
    },

    info(component: string, message: string, data?: unknown): void {
      logMessage('info', component, message, data);
    },

    warn(component: string, message: string, data?: unknown): void {
      logMessage('warn', component, message, data);
    },

    error(component: string, message: string, data?: unknown): void {
      logMessage('error', component, message, data);
    },
  };
})();
