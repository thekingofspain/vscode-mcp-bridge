import * as vscode from 'vscode';

/**
 * Execute a VS Code command with allowed commands check.
 * 
 * Security model: Empty allowedCommands list means DENY ALL.
 * This is a secure-by-default approach - commands must be explicitly allowed.
 */
export async function executeCommand(
  command: string,
  args: unknown[] | undefined,
  allowedCommands: string[]
): Promise<unknown> {
  // Deny by default - empty allowlist blocks all commands
  if (allowedCommands.length === 0) {
    throw new Error(`Command '${command}' is not allowed. No commands are permitted with the current configuration.`);
  }

  if (!allowedCommands.includes(command)) {
    throw new Error(`Command '${command}' is not in the allowed commands list`);
  }

  return vscode.commands.executeCommand(command, ...(args ?? []));
}
