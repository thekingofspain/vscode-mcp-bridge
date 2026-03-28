import * as vscode from 'vscode'

/**
 * Get IntelliSense completion suggestions at a specific position
 */
export async function getCompletions(
  filePath: string,
  line: number,
  char: number,
  triggerCharacter?: string
): Promise<vscode.CompletionList | undefined> {
  const uri = vscode.Uri.file(filePath)
  const pos = new vscode.Position(line, char)
  return vscode.commands.executeCommand<vscode.CompletionList>(
    'vscode.executeCompletionItemProvider',
    uri,
    pos,
    triggerCharacter
  )
}
