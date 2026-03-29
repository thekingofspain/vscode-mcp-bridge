import * as vscode from 'vscode';
import type { GitActionResult, GitOperation } from './types.js';

/**
 * Execute common Git operations directly
 */
export async function gitAction(
  operation: GitOperation,
  branchName?: string,
  commitMessage?: string,
): Promise<GitActionResult> {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!root) return { success: false, output: 'No workspace root found.' };

  let cmd: string;

  switch (operation) {
    case 'status':
      cmd = 'git status';
      break;
    case 'commit':
      if (commitMessage === undefined)
        return { success: false, output: 'Commit message is required.' };

      cmd = `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`;
      break;
    case 'checkout':
      if (branchName === undefined)
        return { success: false, output: 'Branch name is required.' };

      cmd = `git checkout ${branchName}`;
      break;
    case 'branch':
      if (branchName === undefined)
        return { success: false, output: 'Branch name is required.' };

      cmd = `git branch ${branchName}`;
      break;
  }

  try {
    const { exec } = await import('child_process');
    const result = await new Promise<string>((resolve, reject) => {
      exec(cmd, { cwd: root }, (err, stdout, stderr) => {
        if (err) reject(err);
        else resolve(stdout || stderr);
      });
    });

    return { success: true, output: result };
  } catch (e) {
    return {
      success: false,
      output: e instanceof Error ? e.message : String(e),
    };
  }
}
