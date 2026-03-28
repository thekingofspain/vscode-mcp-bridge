import * as vscode from 'vscode'

/**
 * Write content to a file. Integrates with VS Code undo history.
 */
export async function writeFile(
  filePath: string,
  content: string,
  createIfMissing = true
): Promise<{ success: boolean; path: string }> {
  const uri = vscode.Uri.file(filePath)
  const edit = new vscode.WorkspaceEdit()
  
  const doc = vscode.workspace.textDocuments.find(d => d.uri.fsPath === filePath)
  const created = !doc

  if (created && !createIfMissing) {
    return { success: false, path: filePath }
  }

  if (created) {
    edit.createFile(uri, { overwrite: false, contents: Buffer.from(content, 'utf-8') })
  } else {
    edit.set(uri, [
      vscode.TextEdit.replace(
        new vscode.Range(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
        content
      )
    ])
  }

  const success = await vscode.workspace.applyEdit(edit)
  return { success, path: filePath }
}

/**
 * Create a new file
 */
export async function createFile(filePath: string, content = ''): Promise<void> {
  const uri = vscode.Uri.file(filePath)
  const edit = new vscode.WorkspaceEdit()
  edit.createFile(uri, { overwrite: false, contents: Buffer.from(content, 'utf-8') })
  await vscode.workspace.applyEdit(edit)
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string): Promise<void> {
  const uri = vscode.Uri.file(filePath)
  const edit = new vscode.WorkspaceEdit()
  edit.deleteFile(uri, { recursive: false, ignoreIfNotExists: false })
  await vscode.workspace.applyEdit(edit)
}
