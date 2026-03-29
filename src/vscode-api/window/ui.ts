import * as vscode from 'vscode';
import type { MessageSeverity } from '@type-defs/index.js';

/**
 * Display a notification message to the user in the VS Code UI
 */
export async function showMessage(
  message: string,
  level: MessageSeverity = 'info',
  items: string[] = [],
): Promise<string | undefined> {
  if (level === 'error') {
    return items.length > 0
      ? vscode.window.showErrorMessage(message, ...items)
      : vscode.window.showErrorMessage(message);
  } else if (level === 'warning') {
    return items.length > 0
      ? vscode.window.showWarningMessage(message, ...items)
      : vscode.window.showWarningMessage(message);
  }

  return items.length > 0
    ? vscode.window.showInformationMessage(message, ...items)
    : vscode.window.showInformationMessage(message);
}

/**
 * Show a dropdown menu for the user to select from multiple options
 */
export async function showQuickPick(
  items: string[],
  placeHolder?: string,
  canPickMany = false,
): Promise<string[] | string | undefined> {
  const result = await vscode.window.showQuickPick(items, {
    placeHolder,
    canPickMany,
  });

  if (!result) return undefined;

  if (Array.isArray(result)) return result;

  return result;
}

/**
 * Prompt the user for direct free-text input
 */
export async function requestInput(
  prompt: string,
  placeHolder?: string,
  value?: string,
): Promise<string | undefined> {
  return vscode.window.showInputBox({ prompt, placeHolder, value });
}
