import * as path from 'path';
import * as vscode from 'vscode';
import type { OpenTab, SelectionSnapshot } from './types.js';

/**
 * Get the current text selection and cursor position
 */
export function getSelectionSnapshot(): SelectionSnapshot | null {
  const editor = vscode.window.activeTextEditor;

  if (!editor) return null;

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);

  return {
    text: selectedText,
    startLine: selection.start.line,
    startChar: selection.start.character,
    endLine: selection.end.line,
    endChar: selection.end.character,
    isEmpty: selection.isEmpty,
    filePath: editor.document.uri.fsPath,
  };
}

/**
 * Get all currently open file tabs in VS Code
 */
export function getOpenTabs(): OpenTab[] {
  const activeUri = vscode.window.activeTextEditor?.document.uri.fsPath;
  const tabs: OpenTab[] = [];

  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      const input = tab.input as vscode.TabInputText | vscode.TabInputTextDiff;

      if (input instanceof vscode.TabInputText) {
        const doc = vscode.workspace.textDocuments.find(
          (d) => d.uri.fsPath === input.uri.fsPath,
        );

        tabs.push({
          path: input.uri.fsPath,
          relativePath: vscode.workspace.asRelativePath(input.uri),
          language: doc?.languageId ?? 'unknown',
          isDirty: doc?.isDirty ?? false,
          isActive: input.uri.fsPath === activeUri,
          type: 'file',
        });
      } else if (input instanceof vscode.TabInputTextDiff) {
        const uri =
          input.original.scheme === 'file' ? input.original : input.modified;

        if (uri.scheme === 'file') {
          const doc = vscode.workspace.textDocuments.find(
            (d) => d.uri.fsPath === uri.fsPath,
          );

          tabs.push({
            path: uri.fsPath,
            relativePath: vscode.workspace.asRelativePath(uri),
            language: doc?.languageId ?? 'unknown',
            isDirty: false,
            isActive: uri.fsPath === activeUri,
            type: 'diff',
          });
        }
      }
    }
  }

  return tabs;
}

/**
 * Show a visual diff in VS Code before applying file changes
 */
export async function showDiff(
  filePath: string,
  newContent: string,
  title?: string,
): Promise<void> {
  const uri = vscode.Uri.file(filePath);
  const doc = await vscode.workspace.openTextDocument(uri);

  await vscode.window.showTextDocument(doc, { preview: false });

  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    new vscode.Position(0, 0),
    doc.positionAt(doc.getText().length),
  );

  edit.replace(uri, fullRange, newContent);

  const memFsUri = vscode.Uri.from({
    scheme: 'vscode-mcp-preview',
    path: `/diff/${path.basename(filePath)}`,
  });

  await vscode.commands.executeCommand(
    'vscode.diff',
    uri,
    memFsUri,
    title ?? `${path.basename(filePath)}: Original ↔ Modified`,
    { preview: false },
  );
}
