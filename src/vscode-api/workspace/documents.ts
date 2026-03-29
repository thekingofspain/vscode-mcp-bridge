import * as vscode from 'vscode'
import * as path from 'path'

export interface ActiveFileSnapshot {
  path: string
  relativePath: string
  content: string
  language: string
  isDirty: boolean
  lineCount: number
}

export interface WorkspaceInfo {
  workspaceFolders: string[]
  workspaceFile: string | undefined
}

/**
 * Get a snapshot of the currently active text editor
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

/**
 * Read the contents of a file
 */
export async function readFile(
  filePath: string,
  startLine?: number,
  endLine?: number
): Promise<{ content: string; exists: boolean }> {
  try {
    const doc = await vscode.workspace.openTextDocument(filePath)
    const allLines = doc.getText().split('\n')

    const sliced = startLine !== undefined && endLine !== undefined
      ? allLines.slice(startLine, endLine + 1)
      : allLines

    return { content: sliced.join('\n'), exists: true }
  } catch {
    return { content: '', exists: false }
  }
}

/**
 * Open a file in the VS Code editor
 */
export async function openFile(
  filePath: string,
  line?: number,
  character?: number,
  preview = false
): Promise<void> {
  const uri = vscode.Uri.file(filePath)
  const doc = await vscode.workspace.openTextDocument(uri)

  if (line !== undefined && character !== undefined) {
    await vscode.window.showTextDocument(doc, { preview, selection: new vscode.Range(line, character, line, character) })
  } else {
    await vscode.window.showTextDocument(doc, { preview })
  }
}

/**
 * Close a file tab in VS Code
 */
export async function closeFile(filePath: string): Promise<{ closed: boolean; filePath: string }> {
  const uri = vscode.Uri.file(filePath)
  const doc = vscode.workspace.textDocuments.find(d => d.uri.fsPath === filePath)

  if (!doc) {
    return { closed: false, filePath }
  }

  const closedTabs = await vscode.window.tabGroups.close(
    vscode.window.tabGroups.all
      .flatMap(g => g.tabs)
      .filter(t => {
        const input = t.input as vscode.TabInputText
        return input instanceof vscode.TabInputText && input.uri.fsPath === filePath
      })
  )

  return { closed: closedTabs.length > 0, filePath }
}

/**
 * Get information about the current workspace
 */
export function getWorkspaceInfo(): WorkspaceInfo {
  return {
    workspaceFolders: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) ?? [],
    workspaceFile: vscode.workspace.workspaceFile?.fsPath,
  }
}
