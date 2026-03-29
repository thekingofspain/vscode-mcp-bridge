import { log } from '@utils/logger.js';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import type { ManagedTerminal, TerminalResult } from './types.js';

const MAX_READ_SIZE = 128 * 1024; // Read last 128 KB from log file
// Dangerous shell patterns that should be blocked
const DANGEROUS_PATTERNS = [
  /rm\s+(-rf|--no-preserve-root)/i,
  /format\s+[c-z]:/i,
  />\s*\/dev\/.*/,
  /\|\s*(bash|sh|zsh|cmd|powershell)/i,
  /\$\([^)]+\)/, // Command substitution
  /`[^`]+`/, // Backtick command substitution
  /;\s*(rm|del|format|mkfs)/i,
];

export class TerminalManager {
  private terminals = new Map<string, ManagedTerminal>();
  private nextId = 1;
  private logDir: string;

  constructor() {
    this.logDir = path.join(os.tmpdir(), 'vscode-mcp-terminals');
    fs.mkdirSync(this.logDir, { recursive: true });
    // Run cleanup asynchronously to avoid blocking extension initialization
    setImmediate(() => { this.cleanupStaleLogFiles(); });
  }

  private cleanupStaleLogFiles(): void {
    try {
      const files = fs.readdirSync(this.logDir);

      for (const file of files) {
        const filePath = path.join(this.logDir, file);

        fs.unlinkSync(filePath);
        log.debug(TerminalManager.name, `Cleaned up stale log file: ${file}`);
      }

      if (files.length > 0) {
        log.info(TerminalManager.name, 'Cleaned up ' + String(files.length) + ' stale log file(s) from previous session');
      }
    } catch (err) {
      log.warn(TerminalManager.name, 'Failed to clean up stale log files', err);
    }
  }

  dispose(): void {
    for (const [, t] of this.terminals) {
      t.disposeListener.dispose();
      t.terminal.dispose();
      this.cleanupLogFile(t.logFile);
    }
    this.terminals.clear();
  }

  /**
   * Validate a shell command for dangerous patterns
   */
  private validateCommand(command: string): void {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        throw new Error(`Command contains dangerous patterns matching: ${pattern.toString()}`);
      }
    }
  }

  /**
   * Run a short-lived shell command and capture output
   */
  async runCommand(command: string, cwd?: string, timeoutMs = 30000): Promise<TerminalResult> {
    // Validate command for dangerous patterns
    this.validateCommand(command);

    const workingDir = cwd ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();

    return new Promise((resolve) => {
      exec(command, { cwd: workingDir, timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        resolve({
          stdout: stdout,
          stderr: stderr,
          exitCode: err?.code ?? 0,
        });
      });
    });
  }

  spawn(name: string, command?: string, cwd?: string): { id: string; name: string } {
    const id = `term_${String(this.nextId++)}`;
    const workingDir = cwd ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
    const logFile = path.join(this.logDir, `${id}.log`);
    const displayName = name || `Task ${id}`;
    // Launch script directly as the terminal shell so setup is invisible
    const isLinux = os.platform() === 'linux';
    const shell = process.env.SHELL ?? '/bin/zsh';
    // Sanitize logFile path to prevent shell injection
    const safeLogFile = logFile.replace(/['"`$\\]/g, '');
    // Use bash -c to set up trap and run script, which spawns the user's shell
    const setupCmd = isLinux
      ? `trap 'rm -f "${safeLogFile}"' EXIT HUP TERM; script -q -f "${safeLogFile}" -c "${shell}"`
      : `trap 'rm -f "${safeLogFile}"' EXIT HUP TERM; script -q -F "${safeLogFile}" "${shell}"`;
    const terminal = vscode.window.createTerminal({
      name: displayName,
      cwd: workingDir,
      shellPath: '/bin/bash',
      shellArgs: ['-c', setupCmd],
    });

    terminal.show(true);

    // If a command was provided, wait for the shell to be ready before sending
    if (command !== undefined) {
      this.waitForReady(logFile, () => {
        terminal.sendText(command, true);
      });
    }

    // Listen for terminal close
    const disposeListener = vscode.window.onDidCloseTerminal((closed) => {
      if (closed === terminal) {
        const managed = this.terminals.get(id);

        if (managed) {
          managed.alive = false;
          log.info(TerminalManager.name, `Terminal closed: ${id}`);
          this.cleanupLogFile(managed.logFile);
        }
      }
    });
    const managed: ManagedTerminal = {
      id,
      name: displayName,
      terminal,
      logFile,
      cwd: workingDir,
      createdAt: Date.now(),
      alive: true,
      disposeListener,
    };

    this.terminals.set(id, managed);
    log.info(TerminalManager.name, `Spawned terminal: ${id} (log: ${logFile})`);

    return { id, name: displayName };
  }

  list(): {
    id: string
    name: string
    alive: boolean
    cwd: string
    createdAt: number
    logSize: number
  }[] {
    return Array.from(this.terminals.values()).map(t => ({
      id: t.id,
      name: t.name,
      alive: t.alive,
      cwd: t.cwd,
      createdAt: t.createdAt,
      logSize: this.getLogSize(t.logFile),
    }));
  }

  readOutput(id: string, lines?: number): { output: string; alive: boolean; totalBytes: number } | null {
    const managed = this.terminals.get(id);

    if (!managed) return null;

    let output = '';
    let totalBytes = 0;

    try {
      const stats = fs.statSync(managed.logFile);

      totalBytes = stats.size;

      if (stats.size === 0) {
        return { output: '', alive: managed.alive, totalBytes: 0 };
      }

      // Read the last MAX_READ_SIZE bytes with explicit cap
      const readSize = Math.min(totalBytes, MAX_READ_SIZE);
      const buffer = Buffer.alloc(readSize);
      const fd = fs.openSync(managed.logFile, 'r');

      fs.readSync(fd, buffer, 0, readSize, totalBytes - readSize);
      fs.closeSync(fd);

      output = this.stripAnsi(buffer.toString('utf-8'));

      if (lines !== undefined && lines > 0) {
        const allLines = output.split('\n');

        output = allLines.slice(-lines).join('\n');
      }
    } catch (err) {
      log.debug(TerminalManager.name, `Could not read log for ${id}`, (err as Error).message);
    }

    return { output, alive: managed.alive, totalBytes };
  }

  write(id: string, input: string, addNewline = true): boolean {
    const managed = this.terminals.get(id);

    if (!managed?.alive) return false;

    managed.terminal.sendText(input, addNewline);
    return true;
  }

  kill(id: string): boolean {
    const managed = this.terminals.get(id);

    if (!managed) return false;

    log.info(TerminalManager.name, `Killing terminal: ${id}`);

    // Send exit to the script session, then dispose the terminal
    if (managed.alive) {
      managed.terminal.sendText('exit', true);
      // Give script a moment to clean up, then force dispose
      setTimeout(() => {
        managed.terminal.dispose();
        this.cleanupLogFile(managed.logFile);
      }, 1000);
      managed.alive = false;
    }

    this.terminals.delete(id);
    return true;
  }

  // Poll the log file until content appears (shell has started), then fire callback
  private waitForReady(logFile: string, callback: () => void, attempt = 0): void {
    const maxAttempts = 50; // 50 * 100ms = 5s max wait

    setTimeout(() => {
      if (this.getLogSize(logFile) > 0) {
        callback();
      } else if (attempt < maxAttempts) {
        this.waitForReady(logFile, callback, attempt + 1);
      } else {
        log.warn(TerminalManager.name, `Shell did not become ready after 5s, sending command anyway`);
        callback();
      }
    }, 100);
  }

  private getLogSize(logFile: string): number {
    try {
      return fs.statSync(logFile).size;
    } catch {
      return 0;
    }
  }

  private cleanupLogFile(logFile: string): void {
    try {
      fs.unlinkSync(logFile);
      log.debug(TerminalManager.name, `Cleaned up log file: ${logFile}`);
    } catch {
      // File may already be cleaned up by trap
    }
  }

  // Strip ANSI escape sequences and control characters from terminal output
  private stripAnsi(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;?]*[a-zA-Z]|\x1b\][^\x07]*(?:\x07|\x1b\\)|\x1b[()][0-9A-B]|\x1b[=>]|\x08.|\r/g, '');
  }
}
