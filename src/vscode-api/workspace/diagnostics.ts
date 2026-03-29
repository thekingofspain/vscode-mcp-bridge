import * as vscode from 'vscode'
import * as path from 'path'

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

interface GetDiagnosticsOptions {
  scope: 'open_files' | 'workspace' | 'git_delta' | 'folder' | 'file'
  targetPath?: string
  recursive?: boolean
  severity?: 'error' | 'warning' | 'information' | 'hint'
}

/**
 * Get LSP diagnostics with expanded filtering options
 */
export async function getDiagnostics(opts: GetDiagnosticsOptions): Promise<DiagnosticItem[]> {
  const severityMap: Record<number, DiagnosticItem['severity']> = {
    [vscode.DiagnosticSeverity.Error]: 'error',
    [vscode.DiagnosticSeverity.Warning]: 'warning',
    [vscode.DiagnosticSeverity.Information]: 'information',
    [vscode.DiagnosticSeverity.Hint]: 'hint',
  }

  let urisToFilter: Set<string> | null = null
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath

  if (opts.scope === 'git_delta' && root) {
    try {
      const { exec } = await import('child_process')
      const result = await new Promise<string>((resolve, reject) => {
        exec('git diff --name-only && git ls-files --others --exclude-standard', { cwd: root }, (err, stdout) => {
          if (err) reject(err)
          else resolve(stdout)
        })
      })
      urisToFilter = new Set(result.split('\n').map(f => path.join(root, f.trim())).filter(Boolean))
    } catch {
      // ignore
    }
  } else if (opts.scope === 'open_files') {
    urisToFilter = new Set(
      vscode.window.visibleTextEditors.map(e => e.document.uri.fsPath)
    )
  } else if (opts.scope === 'file' && opts.targetPath) {
    urisToFilter = new Set([opts.targetPath])
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
      if (rel.startsWith('..')) continue
    }

    for (const d of diags) {
      const mappedSeverity = severityMap[d.severity] ?? 'information'
      if (minLevel >= 0 && levels.indexOf(mappedSeverity) < minLevel) continue

      const codeValue = typeof d.code === 'object' && d.code !== null ? (d.code as { value: string | number }).value : d.code

      results.push({
        filePath: fsPath,
        severity: mappedSeverity,
        message: d.message,
        source: d.source ?? 'unknown',
        code: codeValue ?? null,
        startLine: d.range.start.line,
        startChar: d.range.start.character,
        endLine: d.range.end.line,
        endChar: d.range.end.character,
      })
    }
  }

  return results
}
