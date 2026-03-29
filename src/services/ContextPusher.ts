import * as vscode from 'vscode'
import { getActiveFileSnapshot } from '../vscode-api/workspace/documents.js'
import { getSelectionSnapshot } from '../vscode-api/window/editors.js'
import type { DiagnosticItem } from '../vscode-api/workspace/diagnostics.js'

type PushCallback = (type: string, payload: unknown) => void

function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number): (...args: T) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => { fn(...args); }, ms)
  }
}

export class ContextPusher {
  private disposables: vscode.Disposable[] = []
  private callbacks = new Set<PushCallback>()

  constructor() { }

  start(): void {
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(
        debounce(() => { this.pushActiveFile(); }, 200)
      ),
      vscode.window.onDidChangeTextEditorSelection(
        debounce(() => { this.pushSelection(); }, 300)
      ),
      vscode.languages.onDidChangeDiagnostics(
        debounce(() => { void this.pushDiagnostics() }, 500)
      ),
      vscode.workspace.onDidSaveTextDocument(
        () => { this.pushActiveFile(); }
      ),
    )
  }

  stop(): void {
    for (const d of this.disposables) d.dispose()
    this.disposables = []
  }

  onPush(cb: PushCallback): () => void {
    this.callbacks.add(cb)
    return () => this.callbacks.delete(cb)
  }

  private emit(type: string, payload: unknown): void {
    for (const cb of this.callbacks) {
      try { cb(type, payload) } catch { /* ignore */ }
    }
  }

  private pushActiveFile(): void {
    const snap = getActiveFileSnapshot()
    if (snap) this.emit('activeFile', snap)
  }

  private pushSelection(): void {
    const snap = getSelectionSnapshot()
    if (snap) this.emit('selection', snap)
  }

  private async pushDiagnostics(): Promise<void> {
    const { getDiagnostics } = await import('../vscode-api/workspace/diagnostics.js')
    const filtered = await getDiagnostics({ scope: 'open_files' })
    this.emit('diagnostics', filtered)
  }
}
