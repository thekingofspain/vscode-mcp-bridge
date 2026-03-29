import { exec } from 'child_process';
import * as vscode from 'vscode';
import type { TerminalResult } from '@services/types.js';

/**
 * Run a shell command and capture its output
 */
export async function runCommand(
  command: string,
  cwd?: string,
  timeoutMs = 30000,
): Promise<TerminalResult> {
  const workingDir =
    cwd ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();

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
