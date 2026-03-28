import * as vscode from 'vscode'

export interface GitActionResult {
  success: boolean
  output: string
}

/**
 * Execute common Git operations directly
 */
export async function gitAction(
  operation: 'commit' | 'checkout' | 'branch' | 'status',
  branchName?: string,
  commitMessage?: string
): Promise<GitActionResult> {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  if (!root) return { success: false, output: 'No workspace root found.' }

  let cmd = ''
  if (operation === 'status') cmd = 'git status'
  else if (operation === 'commit') {
    if (!commitMessage) return { success: false, output: 'Commit message is required.' }
    cmd = `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`
  } else if (operation === 'checkout') {
    if (!branchName) return { success: false, output: 'Branch name is required.' }
    cmd = `git checkout ${branchName}`
  } else if (operation === 'branch') {
    if (!branchName) return { success: false, output: 'Branch name is required.' }
    cmd = `git branch ${branchName}`
  }

  try {
    const { exec } = await import('child_process')
    const result = await new Promise<string>((resolve, reject) => {
      exec(cmd, { cwd: root }, (err, stdout, stderr) => {
        if (err) reject(err)
        else resolve(stdout || stderr)
      })
    })
    return { success: true, output: result }
  } catch (e) {
    return { success: false, output: e instanceof Error ? e.message : String(e) }
  }
}
