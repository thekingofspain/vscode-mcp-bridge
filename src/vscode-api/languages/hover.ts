import * as vscode from 'vscode';

/**
 * Get hover information (type info, documentation) for a symbol at a given position
 */
export async function getHover(
  filePath: string,
  line: number,
  char: number,
): Promise<vscode.Hover[]> {
  const uri = vscode.Uri.file(filePath);
  const pos = new vscode.Position(line, char);

  return vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    pos,
  );
}
