// Types for services
// Re-exports from centralized type definitions where applicable

import type * as vscode from 'vscode';

export type { TerminalResult } from '@type-defs/index.js';

export interface ManagedTerminal {
  id: string;
  name: string;
  terminal: vscode.Terminal;
  logFile: string;
  cwd: string;
  createdAt: number;
  alive: boolean;
  disposeListener: vscode.Disposable;
}

export type PushCallback = (type: string, payload: unknown) => void;
