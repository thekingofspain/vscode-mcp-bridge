import * as vscode from 'vscode'

let allowedCommands: string[] = []

/**
 * Set the list of allowed VS Code commands
 */
export function setAllowedCommands(commands: string[]): void {
  allowedCommands = commands
}

/**
 * Execute a VS Code command
 */
export async function executeCommand(
  command: string,
  args?: unknown[]
): Promise<unknown> {
  if (allowedCommands.length > 0 && !allowedCommands.includes(command)) {
    throw new Error(`Command '${command}' is not in the allowed commands list`)
  }
  return vscode.commands.executeCommand(command, ...(args ?? []))
}
