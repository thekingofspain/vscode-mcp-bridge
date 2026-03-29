import * as vscode from 'vscode';

const decorationTypes = new Map<string, vscode.TextEditorDecorationType>();

/**
 * Get or open a text editor for a specific file path
 */
export async function getEditorForFile(filePath: string): Promise<vscode.TextEditor | null> {
  let editor = vscode.window.activeTextEditor;

  // Return early if already showing the correct file
  if (editor?.document.uri.fsPath === filePath) return editor;

  // Open the file in a new editor
  await vscode.window.showTextDocument(vscode.Uri.file(filePath));
  editor = vscode.window.activeTextEditor;

  // Return early if file could not be opened
  if (editor?.document.uri.fsPath !== filePath) return null;

  return editor;
}

/**
 * Get or create a cached decoration type for a specific color
 */
export function getDecorationType(color: string): vscode.TextEditorDecorationType {
  let decType = decorationTypes.get(color);

  if (decType === undefined) {
    decType = vscode.window.createTextEditorDecorationType({ backgroundColor: color });
    decorationTypes.set(color, decType);
  }

  return decType;
}
