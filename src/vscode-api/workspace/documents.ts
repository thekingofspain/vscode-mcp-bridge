import * as vscode from 'vscode';
import { normalizePath } from '@utils/path.js';
import type {
  ActiveFileSnapshot,
  ReadFileResult,
  WorkspaceInfo,
} from './types.js';

/**
 * Get a snapshot of the currently active text editor
 */
export function getActiveFileSnapshot(): ActiveFileSnapshot | null {
  const editor = vscode.window.activeTextEditor;

  if (!editor) return null;

  return {
    path: editor.document.uri.fsPath,
    relativePath: vscode.workspace.asRelativePath(editor.document.uri),
    content: editor.document.getText(),
    language: editor.document.languageId,
    isDirty: editor.document.isDirty,
    lineCount: editor.document.lineCount,
  };
}

/**
 * Read the contents of a file with optional line range
 */
export async function readFile(
  filePath: string,
  startLine?: number,
  endLine?: number,
): Promise<ReadFileResult> {
  try {
    const doc = await vscode.workspace.openTextDocument(filePath);
    const allLines = doc.getText().split('\n');

    // Validate and normalize line numbers for range reads
    if (startLine !== undefined && endLine !== undefined) {
      const safeStart = Math.max(0, Math.min(startLine, allLines.length - 1));
      const safeEnd = Math.max(
        safeStart,
        Math.min(endLine, allLines.length - 1),
      );
      const sliced = allLines.slice(safeStart, safeEnd + 1);

      return { content: sliced.join('\n'), exists: true };
    }

    return { content: allLines.join('\n'), exists: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    return { content: '', exists: false, error: errorMsg };
  }
}

/**
 * Open a file in the VS Code editor
 */
export async function openFile(
  filePath: string,
  line?: number,
  character?: number,
  preview = false,
): Promise<void> {
  const uri = vscode.Uri.file(filePath);
  const doc = await vscode.workspace.openTextDocument(uri);

  if (line !== undefined && character !== undefined) {
    await vscode.window.showTextDocument(doc, {
      preview,
      selection: new vscode.Range(line, character, line, character),
    });
  } else {
    await vscode.window.showTextDocument(doc, { preview });
  }
}

/**
 * Close a file tab in VS Code
 * Handles multiple tab types and normalizes path comparison
 */
export async function closeFile(
  filePath: string,
): Promise<{ closed: boolean; filePath: string }> {
  const targetPath = normalizePath(filePath);
  const tabsToClose = vscode.window.tabGroups.all
    .flatMap((g) => g.tabs)
    .filter((t) => {
      const input = t.input as vscode.TabInputText | { uri?: vscode.Uri };

      if (input instanceof vscode.TabInputText) {
        return normalizePath(input.uri.fsPath) === targetPath;
      }

      if ('uri' in input && input.uri) {
        return normalizePath(input.uri.fsPath) === targetPath;
      }

      return false;
    });

  if (tabsToClose.length === 0) {
    return { closed: false, filePath };
  }

  await vscode.window.tabGroups.close(tabsToClose);
  return { closed: true, filePath };
}

/**
 * Get information about the current workspace
 */
export function getWorkspaceInfo(): WorkspaceInfo {
  return {
    workspaceFolders:
      vscode.workspace.workspaceFolders?.map((f) => f.uri.fsPath) ?? [],
    workspaceFile: vscode.workspace.workspaceFile?.fsPath,
  };
}
