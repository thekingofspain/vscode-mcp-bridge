import * as vscode from 'vscode'
import * as path from 'path'
import { exec } from 'child_process'

export interface ActiveFileSnapshot {
  path: string
  relativePath: string
  content: string
  language: string
  isDirty: boolean
  lineCount: number
}

export interface SelectionSnapshot {
  text: string
  startLine: number
  startChar: number
  endLine: number
  endChar: number
  isEmpty: boolean
  filePath: string
}

export interface OpenTab {
  path: string
  relativePath: string
  language: string
  isDirty: boolean
  isActive: boolean
  type: 'file' | 'diff'
}

export interface DiagnosticItem {
  filePath: string
  severity: 'error' | 'warning' | 'information' | 'hint'
  message: string
  source: string
  code: string | number | null
  startLine: number
  startChar: number
  endLine: number
  endChar: number
}

export interface TerminalResult {
  stdout: string
  stderr: string
  exitCode: number | null
}

// In-memory file system provider for diff previews
class MemoryFileSystemProvider implements vscode.FileSystemProvider {
  private files = new Map<string, Uint8Array>()
  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>()
  readonly onDidChangeFile = this._emitter.event

  watch(): vscode.Disposable { return new vscode.Disposable(() => undefined) }
  stat(uri: vscode.Uri): vscode.FileStat {
    const data = this.files.get(uri.path)
    if (!data) throw vscode.FileSystemError.FileNotFound(uri)
    return { type: vscode.FileType.File, ctime: 0, mtime: Date.now(), size: data.byteLength }
  }
  readDirectory(): [string, vscode.FileType][] { return [] }
  createDirectory(): void { return }
  readFile(uri: vscode.Uri): Uint8Array {
    const data = this.files.get(uri.path)
    if (!data) throw vscode.FileSystemError.FileNotFound(uri)
    return data
  }
  writeFile(uri: vscode.Uri, content: Uint8Array): void {
    this.files.set(uri.path, content)
    this._emitter.fire([{ type: vscode.FileChangeType.Changed, uri }])
  }
  delete(uri: vscode.Uri): void { this.files.delete(uri.path) }
  rename(): void { return }
}

export class VsCodeBridge {
  readonly memFs: MemoryFileSystemProvider

  constructor() {
    this.memFs = new MemoryFileSystemProvider()
  }

  // --- Active File ---

  getActiveFileSnapshot(): ActiveFileSnapshot | null {
    const editor = vscode.window.activeTextEditor
    if (!editor) return null
    return {
      path: editor.document.uri.fsPath,
      relativePath: vscode.workspace.asRelativePath(editor.document.uri),
      content: editor.document.getText(),
      language: editor.document.languageId,
      isDirty: editor.document.isDirty,
      lineCount: editor.document.lineCount,
    }
  }

  // --- Selection ---

  getSelectionSnapshot(): SelectionSnapshot | null {
    const editor = vscode.window.activeTextEditor
    if (!editor) return null
    const sel = editor.selection
    return {
      text: editor.document.getText(sel),
      startLine: sel.start.line,
      startChar: sel.start.character,
      endLine: sel.end.line,
      endChar: sel.end.character,
      isEmpty: sel.isEmpty,
      filePath: editor.document.uri.fsPath,
    }
  }

  // --- Open Tabs ---

  getOpenTabs(): OpenTab[] {
    const activeUri = vscode.window.activeTextEditor?.document.uri.fsPath
    const tabs: OpenTab[] = []

    for (const group of vscode.window.tabGroups.all) {
      for (const tab of group.tabs) {
        if (tab.input instanceof vscode.TabInputText) {
          const uri = tab.input.uri
          if (uri.scheme !== 'file') continue
          const doc = vscode.workspace.textDocuments.find(d => d.uri.fsPath === uri.fsPath)
          tabs.push({
            path: uri.fsPath,
            relativePath: vscode.workspace.asRelativePath(uri),
            language: doc?.languageId ?? path.extname(uri.fsPath).slice(1),
            isDirty: doc?.isDirty ?? tab.isDirty,
            isActive: uri.fsPath === activeUri,
            type: 'file',
          })
        } else if (tab.input instanceof vscode.TabInputTextDiff) {
          // For diffs (e.g. show_diff), modified may use a preview scheme — prefer original (the real file)
          const uri = tab.input.original.scheme === 'file' ? tab.input.original
            : tab.input.modified.scheme === 'file' ? tab.input.modified
              : null
          if (!uri) continue
          const doc = vscode.workspace.textDocuments.find(d => d.uri.fsPath === uri.fsPath)
          tabs.push({
            path: uri.fsPath,
            relativePath: vscode.workspace.asRelativePath(uri),
            language: doc?.languageId ?? path.extname(uri.fsPath).slice(1),
            isDirty: doc?.isDirty ?? tab.isDirty,
            isActive: uri.fsPath === activeUri,
            type: 'diff',
          })
        }
      }
    }
    return tabs
  }

  // --- Diagnostics ---

  async getDiagnostics(opts: {
    scope: 'open_files' | 'workspace' | 'git_delta' | 'folder' | 'file';
    targetPath?: string;
    recursive?: boolean;
    severity?: string;
  }): Promise<DiagnosticItem[]> {
    const severityMap: Record<number, DiagnosticItem['severity']> = {
      [vscode.DiagnosticSeverity.Error]: 'error',
      [vscode.DiagnosticSeverity.Warning]: 'warning',
      [vscode.DiagnosticSeverity.Information]: 'information',
      [vscode.DiagnosticSeverity.Hint]: 'hint',
    }

    let urisToFilter: Set<string> | null = null

    if (opts.scope === 'file' && opts.targetPath) {
      const uri = vscode.Uri.file(opts.targetPath)
      await vscode.workspace.openTextDocument(uri)
      await new Promise(resolve => setTimeout(resolve, 500))
      urisToFilter = new Set([uri.fsPath])
    } else if (opts.scope === 'git_delta') {
      try {
        const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
        if (root) {
          const result = await this.runCommand('git diff --name-only && git ls-files --others --exclude-standard', root)
          const files = result.stdout.split('\n').map(f => f.trim()).filter(Boolean)
          urisToFilter = new Set(files.map(f => path.join(root, f)))
        }
      } catch {
        // ignore
      }
    } else if (opts.scope === 'open_files') {
      urisToFilter = new Set()
      for (const group of vscode.window.tabGroups.all) {
        for (const tab of group.tabs) {
          if (tab.input instanceof vscode.TabInputText) {
            urisToFilter.add(tab.input.uri.fsPath)
          }
        }
      }
    }

    const allDiags = vscode.languages.getDiagnostics()
    const levels = ['hint', 'information', 'warning', 'error']
    const minLevel = opts.severity ? levels.indexOf(opts.severity) : -1

    const results: DiagnosticItem[] = []
    for (const [uri, diags] of allDiags) {
      if (uri.scheme !== 'file') continue

      const fsPath = uri.fsPath
      if (urisToFilter && !urisToFilter.has(fsPath)) continue

      if (opts.scope === 'folder' && opts.targetPath) {
        const rel = path.relative(opts.targetPath, fsPath)
        if (rel.startsWith('..')) continue // Not in target folder
        if (opts.recursive === false && rel.includes(path.sep)) continue // Nested folder
      }

      for (const d of diags) {
        const mappedSeverity = severityMap[d.severity as keyof typeof severityMap] ?? 'information'
        if (minLevel >= 0 && levels.indexOf(mappedSeverity) < minLevel) continue

        results.push({
          filePath: fsPath,
          severity: mappedSeverity,
          message: d.message,
          source: d.source ?? '',
          code: typeof d.code === 'object' ? String(d.code.value) : (d.code ?? null),
          startLine: d.range.start.line,
          startChar: d.range.start.character,
          endLine: d.range.end.line,
          endChar: d.range.end.character,
        })
      }
    }
    return results
  }

  // --- Repo Map ---

  async getRepoMap(dir?: string): Promise<string> {
    const root = dir ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    if (!root) return 'No workspace root found.'

    const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>('vscode.executeWorkspaceSymbolProvider', '')

    if (symbols.length === 0) {
      return 'No symbols found by LSP. This workspace may not have a language server capable of full-workspace symbols.'
    }

    const fileMap = new Map<string, vscode.SymbolInformation[]>()
    for (const sym of symbols) {
      if (sym.location.uri.scheme !== 'file') continue
      const fsPath = sym.location.uri.fsPath
      if (!fsPath.startsWith(root)) continue
      const rel = path.relative(root, fsPath)

      let arr = fileMap.get(rel)
      if (!arr) { arr = []; fileMap.set(rel, arr) }
      arr.push(sym)
    }

    const sortedFiles = Array.from(fileMap.keys()).sort()
    let out = `Repository Map for ${root}\n\n`
    for (const file of sortedFiles) {
      out += `${file}:\n`
      const syms = fileMap.get(file)
      if (syms) {
        syms.sort((a, b) => a.location.range.start.line - b.location.range.start.line)
        for (const s of syms) {
          const kinds = ['File', 'Module', 'Namespace', 'Package', 'Class', 'Method', 'Property', 'Field', 'Constructor',
            'Enum', 'Interface', 'Function', 'Variable', 'Constant', 'String', 'Number', 'Boolean', 'Array', 'Object',
            'Key', 'Null', 'EnumMember', 'Struct', 'Event', 'Operator', 'TypeParameter']
          const kindName = kinds[s.kind] ?? 'Unknown'
          out += `  - [${kindName}] ${s.name} (Line ${String(s.location.range.start.line + 1)})\n`
        }
      }
    }

    return out.slice(0, 500000)
  }

  // --- LSP Commands ---

  async getReferences(filePath: string, line: number, char: number, includeDeclaration: boolean) {
    const uri = vscode.Uri.file(filePath)
    const pos = new vscode.Position(line, char)
    return vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeReferenceProvider', uri, pos, { includeDeclaration }
    )
  }

  async getDefinition(filePath: string, line: number, char: number) {
    const uri = vscode.Uri.file(filePath)
    const pos = new vscode.Position(line, char)
    return vscode.commands.executeCommand<(vscode.Location | vscode.LocationLink)[]>(
      'vscode.executeDefinitionProvider', uri, pos
    )
  }

  async getTypeDefinition(filePath: string, line: number, char: number) {
    const uri = vscode.Uri.file(filePath)
    const pos = new vscode.Position(line, char)
    return vscode.commands.executeCommand<(vscode.Location | vscode.LocationLink)[]>(
      'vscode.executeTypeDefinitionProvider', uri, pos
    )
  }

  async getImplementation(filePath: string, line: number, char: number) {
    const uri = vscode.Uri.file(filePath)
    const pos = new vscode.Position(line, char)
    return vscode.commands.executeCommand<(vscode.Location | vscode.LocationLink)[]>(
      'vscode.executeImplementationProvider', uri, pos
    )
  }

  async getHover(filePath: string, line: number, char: number) {
    const uri = vscode.Uri.file(filePath)
    const pos = new vscode.Position(line, char)
    return vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider', uri, pos
    )
  }

  async getSignatureHelp(filePath: string, line: number, char: number, triggerCharacter?: string): Promise<vscode.SignatureHelp | undefined> {
    const uri = vscode.Uri.file(filePath)
    const pos = new vscode.Position(line, char)
    return vscode.commands.executeCommand<vscode.SignatureHelp>(
      'vscode.executeSignatureHelpProvider', uri, pos, triggerCharacter
    )
  }

  async getCompletions(filePath: string, line: number, char: number, triggerCharacter?: string) {
    const uri = vscode.Uri.file(filePath)
    const pos = new vscode.Position(line, char)
    return vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider', uri, pos, triggerCharacter
    )
  }

  async getCodeActions(filePath: string, startLine: number, startChar: number, endLine: number, endChar: number): Promise<(vscode.Command | vscode.CodeAction)[] | undefined> {
    const uri = vscode.Uri.file(filePath)
    const range = new vscode.Range(startLine, startChar, endLine, endChar)
    return vscode.commands.executeCommand<(vscode.Command | vscode.CodeAction)[]>(
      'vscode.executeCodeActionProvider', uri, range
    )
  }

  async getRenameEdits(filePath: string, line: number, char: number, newName: string): Promise<vscode.WorkspaceEdit | undefined> {
    const uri = vscode.Uri.file(filePath)
    const pos = new vscode.Position(line, char)
    return vscode.commands.executeCommand<vscode.WorkspaceEdit>(
      'vscode.executeDocumentRenameProvider', uri, pos, newName
    )
  }

  async getDocumentSymbols(filePath: string) {
    const uri = vscode.Uri.file(filePath)
    return vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider', uri
    )
  }

  async getWorkspaceSymbols(query: string) {
    return vscode.commands.executeCommand<vscode.SymbolInformation[]>(
      'vscode.executeWorkspaceSymbolProvider', query
    )
  }

  // --- Window UI ---

  async showMessage(message: string, level = 'info', items: string[] = []): Promise<string | undefined> {
    if (level === 'error') {
      return items.length > 0 ? vscode.window.showErrorMessage(message, ...items) : vscode.window.showErrorMessage(message)
    } else if (level === 'warning') {
      return items.length > 0 ? vscode.window.showWarningMessage(message, ...items) : vscode.window.showWarningMessage(message)
    }
    return items.length > 0 ? vscode.window.showInformationMessage(message, ...items) : vscode.window.showInformationMessage(message)
  }

  async showQuickPick(items: string[], placeHolder?: string, canPickMany = false): Promise<string[] | undefined> {
    const result = await vscode.window.showQuickPick(items, { placeHolder, canPickMany })
    if (!result) return undefined
    if (Array.isArray(result)) return result as string[]
    return [result]
  }

  async requestInput(prompt: string, placeHolder?: string, value?: string): Promise<string | undefined> {
    return vscode.window.showInputBox({ prompt, placeHolder, value })
  }

  // --- Diff Editor ---

  async showDiff(filePath: string, newContent: string, title?: string) {
    const originalUri = vscode.Uri.file(filePath)
    const previewUri = vscode.Uri.parse(`vscode-mcp-preview:${filePath}`)
    this.memFs.writeFile(previewUri, Buffer.from(newContent, 'utf-8'))
    const label = title ?? `Proposed: ${path.basename(filePath)}`
    await vscode.commands.executeCommand('vscode.diff', originalUri, previewUri, label, { preview: true })
  }

  // --- File Operations ---

  async readFile(filePath: string, startLine?: number, endLine?: number): Promise<{ content: string; lineCount: number; language: string }> {
    const uri = vscode.Uri.file(filePath)
    const doc = await vscode.workspace.openTextDocument(uri)
    let content = doc.getText()
    if (startLine !== undefined || endLine !== undefined) {
      const lines = content.split('\n')
      const sl = startLine ?? 0
      const el = endLine !== undefined ? endLine + 1 : lines.length
      content = lines.slice(sl, el).join('\n')
    }
    return { content, lineCount: doc.lineCount, language: doc.languageId }
  }

  async writeFile(filePath: string, content: string, createIfMissing = true): Promise<{ bytesWritten: number; created: boolean }> {
    const uri = vscode.Uri.file(filePath)
    let created = false
    try {
      await vscode.workspace.fs.stat(uri)
    } catch {
      if (!createIfMissing) throw new Error(`File not found: ${filePath}`)
      created = true
    }
    const edit = new vscode.WorkspaceEdit()
    if (created) {
      edit.createFile(uri, { overwrite: false })
    }
    edit.set(uri, [vscode.TextEdit.replace(
      created
        ? new vscode.Range(0, 0, 0, 0)
        : new vscode.Range(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
      content
    )])
    await vscode.workspace.applyEdit(edit)
    return { bytesWritten: Buffer.byteLength(content, 'utf-8'), created }
  }

  async createFile(filePath: string, content = ''): Promise<void> {
    const uri = vscode.Uri.file(filePath)
    const edit = new vscode.WorkspaceEdit()
    edit.createFile(uri, { overwrite: false, contents: Buffer.from(content, 'utf-8') })
    await vscode.workspace.applyEdit(edit)
  }

  async deleteFile(filePath: string): Promise<void> {
    const uri = vscode.Uri.file(filePath)
    const edit = new vscode.WorkspaceEdit()
    edit.deleteFile(uri, { recursive: false, ignoreIfNotExists: false })
    await vscode.workspace.applyEdit(edit)
  }

  async openFile(filePath: string, line?: number, char?: number, preview = false): Promise<void> {
    const uri = vscode.Uri.file(filePath)
    const doc = await vscode.workspace.openTextDocument(uri)
    const opts: vscode.TextDocumentShowOptions = { preview }
    if (line !== undefined) {
      const pos = new vscode.Position(line, char ?? 0)
      opts.selection = new vscode.Range(pos, pos)
    }
    await vscode.window.showTextDocument(doc, opts)
  }

  async closeFile(filePath: string): Promise<{ closed: number }> {
    const uri = vscode.Uri.file(filePath)
    const tabsToClose: vscode.Tab[] = []

    for (const group of vscode.window.tabGroups.all) {
      for (const tab of group.tabs) {
        if (tab.input instanceof vscode.TabInputText && tab.input.uri.fsPath === uri.fsPath) {
          tabsToClose.push(tab)
        } else if (tab.input instanceof vscode.TabInputTextDiff) {
          if (tab.input.original.fsPath === uri.fsPath || tab.input.modified.fsPath === uri.fsPath) {
            tabsToClose.push(tab)
          }
        }
      }
    }

    for (const tab of tabsToClose) {
      await vscode.window.tabGroups.close(tab)
    }
    return { closed: tabsToClose.length }
  }

  // --- Terminal ---

  async runCommand(command: string, cwd?: string, timeoutMs = 30000, strategy = 'childProcess'): Promise<TerminalResult> {
    const workingDir = cwd ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd()

    if (strategy === 'shellIntegration') {
      return this.runViaShellIntegration(command, workingDir, timeoutMs)
    }
    return this.runViaChildProcess(command, workingDir, timeoutMs)
  }

  private runViaChildProcess(command: string, cwd: string, timeoutMs: number): Promise<TerminalResult> {
    return new Promise((resolve, reject) => {
      const proc = exec(command, { cwd, timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        resolve({
          stdout: stdout,
          stderr: stderr,
          exitCode: err?.code ?? 0,
        })
      })
      proc.on('error', reject)
    })
  }

  private runViaShellIntegration(command: string, cwd: string, timeoutMs: number): Promise<TerminalResult> {
    return new Promise((resolve, reject) => {
      const terminal = vscode.window.createTerminal({ name: 'MCP Agent', cwd })
      terminal.show()
      terminal.sendText(command)

      const timeout = setTimeout(() => {
        disposable.dispose()
        terminal.dispose()
        reject(new Error(`Command timed out after ${String(timeoutMs)}ms`))
      }, timeoutMs)

      const disposable = vscode.window.onDidEndTerminalShellExecution((e) => {
        if (e.terminal === terminal) {
          clearTimeout(timeout)
          disposable.dispose()
          resolve({ stdout: '', stderr: '', exitCode: e.exitCode ?? null })
        }
      })
    })
  }

  // --- Workspace ---

  getWorkspaceInfo() {
    const folders = vscode.workspace.workspaceFolders ?? []
    return {
      folders: folders.map(f => ({ name: f.name, path: f.uri.fsPath })),
      name: vscode.workspace.name ?? null,
      rootPath: folders[0]?.uri.fsPath ?? null,
    }
  }

  // --- Execute VS Code Command ---

  async executeCommand(command: string, args: unknown[] = [], allowedCommands: string[] = []): Promise<unknown> {
    if (allowedCommands.length > 0 && !allowedCommands.includes(command)) {
      throw new Error(`Command '${command}' is not in the allowed commands list`)
    }
    return vscode.commands.executeCommand(command, ...args)
  }

  // --- Editor Decorations ---

  private decorationTypes = new Map<string, vscode.TextEditorDecorationType>()

  async addEditorDecoration(filePath: string, startLine: number, endLine: number, color = 'rgba(255, 255, 0, 0.3)'): Promise<boolean> {
    let editor = vscode.window.activeTextEditor
    if (editor?.document.uri.fsPath !== filePath) {
      await this.openFile(filePath, startLine, 0)
      editor = vscode.window.activeTextEditor
    }
    if (editor?.document.uri.fsPath !== filePath) return false

    let decType = this.decorationTypes.get(color)
    if (!decType) {
      decType = vscode.window.createTextEditorDecorationType({ backgroundColor: color })
      this.decorationTypes.set(color, decType)
    }

    const range = new vscode.Range(startLine, 0, endLine, Number.MAX_SAFE_INTEGER)
    // We add to existing instead of clearing, but for simplicity we just set it. 
    // Usually extending would require reading existing ranges.
    editor.setDecorations(decType, [range])
    return true
  }

  // --- Git Actions ---

  async gitAction(operation: string, branchName?: string, commitMessage?: string): Promise<{ success: boolean; output: string }> {
    const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    if (!root) return { success: false, output: 'No workspace root found.' }

    let cmd: string
    if (operation === 'status') cmd = 'git status'
    else if (operation === 'commit') {
      if (!commitMessage) return { success: false, output: 'Commit message is required.' }
      cmd = `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`
    }
    else if (operation === 'checkout') {
      if (!branchName) return { success: false, output: 'Branch name is required.' }
      cmd = `git checkout ${branchName}`
    }
    else if (operation === 'branch') {
      if (!branchName) return { success: false, output: 'Branch name is required.' }
      cmd = `git branch ${branchName}`
    }
    else return { success: false, output: `Unknown operation: ${operation}` }

    try {
      const res = await this.runCommand(cmd, root)
      return { success: res.exitCode === 0, output: res.stdout || res.stderr }
    } catch (e) {
      return { success: false, output: e instanceof Error ? e.message : String(e) }
    }
  }
}
