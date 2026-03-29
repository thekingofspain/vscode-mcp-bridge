import * as vscode from 'vscode'

/**
 * Execute a VS Code command with allowed commands check
 */
export async function executeCommand(
  command: string,
  args: unknown[] | undefined,
  allowedCommands: string[]
): Promise<unknown> {
  if (allowedCommands.length > 0 && !allowedCommands.includes(command)) {
    throw new Error(`Command '${command}' is not in the allowed commands list`)
  }
  return vscode.commands.executeCommand(command, ...(args ?? []))
}
