import * as vscode from 'vscode';

/**
 * Get parameter hints and signature information for a function call
 */
export async function getSignatureHelp(
  filePath: string,
  line: number,
  char: number,
  triggerCharacter?: string,
): Promise<vscode.SignatureHelp | undefined> {
  const uri = vscode.Uri.file(filePath);
  const pos = new vscode.Position(line, char);

  return vscode.commands.executeCommand<vscode.SignatureHelp>(
    'vscode.executeSignatureHelpProvider',
    uri,
    pos,
    triggerCharacter,
  );
}
