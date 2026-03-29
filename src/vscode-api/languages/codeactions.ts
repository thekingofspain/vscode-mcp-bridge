import * as vscode from 'vscode';

/**
 * Get available code actions (quick fixes, refactors) for a range in a file
 */
export async function getCodeActions(
  filePath: string,
  startLine: number,
  startChar: number,
  endLine: number,
  endChar: number
): Promise<(vscode.Command | vscode.CodeAction)[] | undefined> {
  const uri = vscode.Uri.file(filePath);
  const range = new vscode.Range(startLine, startChar, endLine, endChar);

  return vscode.commands.executeCommand<(vscode.Command | vscode.CodeAction)[]>(
    'vscode.executeCodeActionProvider',
    uri,
    range
  );
}

/**
 * Apply a code action
 */
export async function applyCodeAction(
  filePath: string,
  startLine: number,
  startChar: number,
  endLine: number,
  endChar: number,
  actionIndex: number
): Promise<{ applied: boolean; title: string }> {
  const actions = await getCodeActions(filePath, startLine, startChar, endLine, endChar);
  const action = actions?.[actionIndex];

  if (action === undefined) throw new Error(`No code action at index ${String(actionIndex)}`);

  let applied = false;

  if ('edit' in action && action.edit) {
    await vscode.workspace.applyEdit(action.edit);
    applied = true;
  } else if ('command' in action && action.command) {
    const cmd = typeof action.command === 'string' ? action.command : action.command.command;

    await vscode.commands.executeCommand(cmd);
    applied = true;
  }

  return { applied, title: 'title' in action ? action.title : '' };
}
