import * as vscode from 'vscode'
import * as path from 'path'

export interface SelectionSnapshot {
  text: string
  startLine: number
  startChar: number
  endLine: number
  endChar: number
  isEmpty: boolean
  filePath: string
}

export interface OpenTab {
  path: string
  relativePath: string
  language: string
  isDirty: boolean
  isActive: boolean
  type: 'file' | 'diff'
}

/**
 * Get the current text selection and cursor position
 */
export function getSelectionSnapshot(): SelectionSnapshot | null {
  const editor = vscode.window.activeTextEditor
  if (!editor) return null
  
  const selection = editor.selection
  const selectedText = editor.document.getText(selection)
  
  return {
    text: selectedText,
    startLine: selection.start.line,
    startChar: selection.start.character,
    endLine: selection.end.line,
    endChar: selection.end.character,
    isEmpty: selection.isEmpty,
    filePath: editor.document.uri.fsPath,
  }
}

/**
 * Get all currently open file tabs in VS Code
 */
export function getOpenTabs(): OpenTab[] {
  const activeUri = vscode.window.activeTextEditor?.document.uri.fsPath
  const tabs: OpenTab[] = []

  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      const input = tab.input as vscode.TabInputText | vscode.TabInputTextDiff
      
      if (input instanceof vscode.TabInputText) {
        tabs.push({
          path: input.uri.fsPath,
          relativePath: vscode.workspace.asRelativePath(input.uri),
          language: vscode.workspace.textDocuments.find(d => d.uri.fsPath === input.uri.fsPath)?.languageId ?? 'unknown',
          isDirty: vscode.workspace.textDocuments.find(d => d.uri.fsPath === input.uri.fsPath)?.isDirty ?? false,
          isActive: input.uri.fsPath === activeUri,
          type: 'file',
        })
      } else if (input instanceof vscode.TabInputTextDiff) {
        const uri = input.original.scheme === 'file' ? input.original : input.modified
        if (uri.scheme === 'file') {
          const doc = vscode.workspace.textDocuments.find(d => d.uri.fsPath === uri.fsPath)
          tabs.push({
            path: uri.fsPath,
            relativePath: vscode.workspace.asRelativePath(uri),
            language: doc?.languageId ?? 'unknown',
            isDirty: false,
            isActive: uri.fsPath === activeUri,
            type: 'diff',
          })
        }
      }
    }
  }

  return tabs
}

/**
 * Show a visual diff in VS Code before applying file changes
 */
export async function showDiff(filePath: string, newContent: string, title?: string): Promise<void> {
  const uri = vscode.Uri.file(filePath)
  const doc = await vscode.workspace.openTextDocument(uri)
  await vscode.window.showTextDocument(doc, { preview: false })
  
  const edit = new vscode.WorkspaceEdit()
  const fullRange = new vscode.Range(
    new vscode.Position(0, 0),
  doc.positionAt(doc.getText().length)
  )
  edit.replace(uri, fullRange, newContent)
  
  const memFsUri = vscode.Uri.from({
    scheme: 'vscode-mcp-preview',
    path: `/diff/${path.basename(filePath)}`,
  })
  
  await vscode.commands.executeCommand(
    'vscode.diff',
    uri,
    memFsUri,
    title ?? `${path.basename(filePath)}: Original ↔ Modified`,
    { preview: false }
  )
}

/**
 * Add a decoration to specific lines in the active editor
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

  const range = new vscode.Range(startLine, 0, endLine, Number.MAX_VALUE)
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: color,
  })

  editor.setDecorations(decorationType, [range])
  
  setTimeout(() => {
    decorationType.dispose()
  }, 5000)

  return true
}
