import * as vscode from 'vscode'
import { exec } from 'child_process'

export interface TerminalResult {
  stdout: string
  stderr: string
  exitCode: number | null
}

/**
 * Run a shell command and capture its output
 */
export async function runCommand(
  command: string,
  cwd?: string,
  timeoutMs: number = 30000
): Promise<TerminalResult> {
  const workingDir = cwd ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd()

  return new Promise((resolve, reject) => {
    const proc = exec(command, { cwd: workingDir, timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({
        stdout: stdout ?? '',
        stderr: stderr ?? '',
        exitCode: err?.code ?? 0,
      })
    })
  })
}
