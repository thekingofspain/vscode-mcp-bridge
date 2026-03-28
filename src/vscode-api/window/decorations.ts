import * as vscode from 'vscode'

const decorationTypes = new Map<string, vscode.TextEditorDecorationType>()

/**
 * Add a decoration to specific lines in an editor
 */
export async function addEditorDecoration(
  filePath: string,
  startLine: number,
  endLine: number,
  color = 'rgba(255, 255, 0, 0.3)'
): Promise<boolean> {
  let editor = vscode.window.activeTextEditor
  if (!editor || editor.document.uri.fsPath !== filePath) {
    await vscode.window.showTextDocument(vscode.Uri.file(filePath))
    editor = vscode.window.activeTextEditor
  }
  if (!editor || editor.document.uri.fsPath !== filePath) return false

  let decType = decorationTypes.get(color)
  if (!decType) {
    decType = vscode.window.createTextEditorDecorationType({ backgroundColor: color })
    decorationTypes.set(color, decType)
  }

  const range = new vscode.Range(startLine, 0, endLine, Number.MAX_VALUE)
  editor.setDecorations(decType, [range])

  return true
}
