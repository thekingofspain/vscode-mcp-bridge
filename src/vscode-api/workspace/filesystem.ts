import * as fs from 'fs';
import * as vscode from 'vscode';
import { normalizePath } from '@utils/path.js';

const MAX_RANGE = new vscode.Range(
  0,
  0,
  Number.MAX_SAFE_INTEGER,
  Number.MAX_SAFE_INTEGER,
);

/**
 * Validate that a file path is safe to access
 * - Must be within workspace folders (unless allowOutsideWorkspace is true)
 * - Must not contain path traversal patterns
 */
function validatePath(filePath: string, allowOutsideWorkspace = false): void {
  const normalized = normalizePath(filePath);

  // Block path traversal patterns
  if (filePath.includes('..')) {
    throw new Error('Path traversal not allowed');
  }

  // Check workspace boundaries
  if (!allowOutsideWorkspace) {
    const workspaceFolders =
      vscode.workspace.workspaceFolders?.map((f) =>
        normalizePath(f.uri.fsPath),
      ) ?? [];

    if (workspaceFolders.length > 0) {
      const isInWorkspace = workspaceFolders.some((ws) =>
        normalized.startsWith(ws),
      );

      if (!isInWorkspace) {
        throw new Error('File path must be within workspace folders');
      }
    }
  }
}

/**
 * Check if a file exists on disk
 */
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Write content to a file. Integrates with VS Code undo history.
 */
export async function writeFile(
  filePath: string,
  content: string,
  createIfMissing = true,
): Promise<{ success: boolean; path: string }> {
  // Validate path for security
  validatePath(filePath);

  const uri = vscode.Uri.file(filePath);
  const edit = new vscode.WorkspaceEdit();
  // Check actual file existence on disk, not just open documents
  const exists = fileExists(filePath);
  const doc = vscode.workspace.textDocuments.find(
    (d) => d.uri.fsPath === filePath,
  );

  if (!exists && !createIfMissing) {
    return { success: false, path: filePath };
  }

  if (!exists) {
    edit.createFile(uri, {
      overwrite: false,
      contents: Buffer.from(content, 'utf-8'),
    });
  } else if (doc) {
    // Use actual document bounds instead of MAX_SAFE_INTEGER
    const lastLine = doc.lineAt(doc.lineCount - 1);

    edit.set(uri, [
      vscode.TextEdit.replace(
        new vscode.Range(0, 0, doc.lineCount, lastLine.text.length),
        content,
      ),
    ]);
  } else {
    // File exists but not open - read it to get bounds
    try {
      const tempDoc = await vscode.workspace.openTextDocument(uri);
      const lastLine = tempDoc.lineAt(tempDoc.lineCount - 1);

      edit.set(uri, [
        vscode.TextEdit.replace(
          new vscode.Range(0, 0, tempDoc.lineCount, lastLine.text.length),
          content,
        ),
      ]);
    } catch {
      // Fallback for binary or unreadable files
      edit.set(uri, [vscode.TextEdit.replace(MAX_RANGE, content)]);
    }
  }

  const success = await vscode.workspace.applyEdit(edit);

  return { success, path: filePath };
}

/**
 * Create a new file
 */
export async function createFile(
  filePath: string,
  content = '',
): Promise<void> {
  validatePath(filePath);
  const uri = vscode.Uri.file(filePath);
  const edit = new vscode.WorkspaceEdit();

  edit.createFile(uri, {
    overwrite: false,
    contents: Buffer.from(content, 'utf-8'),
  });
  await vscode.workspace.applyEdit(edit);
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string): Promise<void> {
  validatePath(filePath);
  const uri = vscode.Uri.file(filePath);
  const edit = new vscode.WorkspaceEdit();

  edit.deleteFile(uri, { recursive: false, ignoreIfNotExists: false });
  await vscode.workspace.applyEdit(edit);
}
