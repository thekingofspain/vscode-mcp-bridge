import * as vscode from 'vscode';
import {
  getDecorationType,
  getEditorForFile,
} from '@vscode-api/window/utils.js';

/**
 * Add a decoration to specific lines in an editor
 */
export async function addEditorDecoration(
  filePath: string,
  startLine: number,
  endLine: number,
  color = 'rgba(255, 255, 0, 0.3)',
): Promise<boolean> {
  const editor = await getEditorForFile(filePath);

  if (editor === null) return false;

  const range = new vscode.Range(startLine, 0, endLine, Number.MAX_VALUE);
  const decType = getDecorationType(color);

  editor.setDecorations(decType, [range]);

  return true;
}
