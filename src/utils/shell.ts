import { exec } from 'child_process';
import * as vscode from 'vscode';
import type { TerminalResult } from '@services/types.js';

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

/**
 * Validate a shell command for dangerous patterns
 */
function validateCommand(command: string): void {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      throw new Error(
        `Command contains dangerous patterns matching: ${pattern.toString()}`,
      );
    }
  }
}

/**
 * Run a short-lived shell command and capture output
 */
export async function runCommand(
  command: string,
  cwd?: string,
  timeoutMs = 30000,
): Promise<TerminalResult> {
  // Validate command for dangerous patterns
  validateCommand(command);

  const workingDir =
    cwd ??
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ??
    process.cwd();

  return new Promise((resolve) => {
    exec(
      command,
      { cwd: workingDir, timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        resolve({
          stdout: stdout,
          stderr: stderr,
          exitCode: err?.code ?? 0,
        });
      },
    );
  });
}
