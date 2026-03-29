import * as vscode from 'vscode';

/**
 * Get the definition location(s) of a symbol at a given position
 */
export async function getDefinition(
  filePath: string,
  line: number,
  char: number
): Promise<(vscode.Location | vscode.LocationLink)[]> {
  const uri = vscode.Uri.file(filePath);
  const pos = new vscode.Position(line, char);

  return vscode.commands.executeCommand<(vscode.Location | vscode.LocationLink)[]>(
    'vscode.executeDefinitionProvider',
    uri,
    pos
  );
}

/**
 * Get the type definition location(s) of a symbol at a given position
 */
export async function getTypeDefinition(
  filePath: string,
  line: number,
  char: number
): Promise<(vscode.Location | vscode.LocationLink)[]> {
  const uri = vscode.Uri.file(filePath);
  const pos = new vscode.Position(line, char);

  return vscode.commands.executeCommand<(vscode.Location | vscode.LocationLink)[]>(
    'vscode.executeTypeDefinitionProvider',
    uri,
    pos
  );
}

/**
 * Get the implementation location(s) of a symbol at a given position
 */
export async function getImplementation(
  filePath: string,
  line: number,
  char: number
): Promise<(vscode.Location | vscode.LocationLink)[]> {
  const uri = vscode.Uri.file(filePath);
  const pos = new vscode.Position(line, char);

  return vscode.commands.executeCommand<(vscode.Location | vscode.LocationLink)[]>(
    'vscode.executeImplementationProvider',
    uri,
    pos
  );
}
