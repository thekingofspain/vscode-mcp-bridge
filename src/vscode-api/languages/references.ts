import * as vscode from 'vscode';

/**
 * Find all references to a symbol at a given position
 */
export async function getReferences(
  filePath: string,
  line: number,
  char: number,
  includeDeclaration = true
): Promise<vscode.Location[]> {
  const uri = vscode.Uri.file(filePath);
  const pos = new vscode.Position(line, char);

  return vscode.commands.executeCommand<vscode.Location[]>(
    'vscode.executeReferenceProvider',
    uri,
    pos,
    { includeDeclaration }
  );
}

/**
 * Rename a symbol and all its references across the workspace
 */
export async function renameSymbol(
  filePath: string,
  line: number,
  char: number,
  newName: string
): Promise<{ filesChanged: number; editsApplied: number }> {
  const uri = vscode.Uri.file(filePath);
  const pos = new vscode.Position(line, char);
  const edit = await vscode.commands.executeCommand<vscode.WorkspaceEdit | undefined>(
    'vscode.executeDocumentRenameProvider',
    uri,
    pos,
    newName
  );

  if (edit === undefined) throw new Error('Rename not supported at this position');

  await vscode.workspace.applyEdit(edit);

  const filesChanged = new Set(edit.entries().map(([uri]) => uri.fsPath)).size;
  const editsApplied = edit.entries().reduce((sum, [, edits]) => sum + edits.length, 0);

  return { filesChanged, editsApplied };
}
