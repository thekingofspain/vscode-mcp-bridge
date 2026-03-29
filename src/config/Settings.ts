import * as vscode from 'vscode'

export class Settings {
  get(key: string): unknown {
    return vscode.workspace.getConfiguration('mcpServer').get(key)
  }

  get port(): number {
    return this.get('port') as number
  }

  get enableContextPush(): boolean {
    return this.get('enableContextPush') as boolean
  }

  get authToken(): string {
    return this.get('authToken') as string
  }

  get allowedCommands(): string[] {
    return (this.get('allowedCommands') as string[]) || []
  }

  onChange(cb: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('mcpServer')) cb()
    })
  }
}
