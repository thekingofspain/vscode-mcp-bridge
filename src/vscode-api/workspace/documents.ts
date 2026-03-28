import * as vscode from 'vscode'

export interface ActiveFileSnapshot {
  path: string
  relativePath: string
  content: string
  language: string
  isDirty: boolean
  lineCount: number
}

/**
 * Get a snapshot of the currently active text editor
 * @returns File snapshot or null if no active editor
 */
export function getActiveFileSnapshot(): ActiveFileSnapshot | null {
  const editor = vscode.window.activeTextEditor
  if (!editor) return null
  
  return {
    path: editor.document.uri.fsPath,
    relativePath: vscode.workspace.asRelativePath(editor.document.uri),
    content: editor.document.getText(),
    language: editor.document.languageId,
    isDirty: editor.document.isDirty,
    lineCount: editor.document.lineCount,
  }
}
