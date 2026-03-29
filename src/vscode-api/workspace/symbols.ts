import * as vscode from 'vscode';
import * as path from 'path';

// Default symbol limit to prevent performance issues on large codebases
const DEFAULT_SYMBOL_LIMIT = 1000;

/**
 * Generate an AST-based global symbol map of the repository
 */
export async function getRepoMap(dir?: string, limit?: number): Promise<string> {
  const root = dir ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!root) return 'No workspace root found.';

  const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
    'vscode.executeWorkspaceSymbolProvider',
    ''
  );

  if (symbols.length === 0) {
    return 'No symbols found by LSP. This workspace may not have a language server capable of full-workspace symbols.';
  }

  // Apply limit to prevent performance issues on large codebases
  const effectiveLimit = limit ?? DEFAULT_SYMBOL_LIMIT;
  const limitedSymbols = symbols.length > effectiveLimit
    ? symbols.slice(0, effectiveLimit)
    : symbols;
  const fileMap = new Map<string, vscode.SymbolInformation[]>();

  for (const sym of limitedSymbols) {
    if (sym.location.uri.scheme !== 'file') continue;

    const fsPath = sym.location.uri.fsPath;

    if (!fsPath.startsWith(root)) continue;

    const rel = path.relative(root, fsPath);
    let arr = fileMap.get(rel);

    if (arr === undefined) { arr = []; fileMap.set(rel, arr); }

    arr.push(sym);
  }

  const sortedFiles = Array.from(fileMap.keys()).sort();
  let out = `Repository Map for ${root}\n\n`;

  for (const file of sortedFiles) {
    out += `${file}:\n`;
    const syms = fileMap.get(file);

    if (syms !== undefined) {
      // Sort once before output - symbols already grouped by file
      syms.sort((a, b) => a.location.range.start.line - b.location.range.start.line);
      for (const s of syms) {
        const kinds = ['File', 'Module', 'Namespace', 'Package', 'Class', 'Method', 'Property', 'Field', 'Constructor',
          'Enum', 'Interface', 'Function', 'Variable', 'Constant', 'String', 'Number', 'Boolean', 'Array', 'Object',
          'Key', 'Null', 'EnumMember', 'Struct', 'Event', 'Operator', 'TypeParameter'];
        const kindName = kinds[s.kind] ?? 'Unknown';

        out += `  - [${kindName}] ${s.name} (Line ${String(s.location.range.start.line + 1)})\n`;
      }
    }
  }

  return out.slice(0, 500000);
}

/**
 * Get all symbols in a file
 */
export async function getDocumentSymbols(filePath: string): Promise<vscode.DocumentSymbol[]> {
  const uri = vscode.Uri.file(filePath);

  return vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    uri
  );
}

/**
 * Search for symbols across the entire workspace
 */
export async function getWorkspaceSymbols(query: string, limit?: number): Promise<vscode.SymbolInformation[]> {
  const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[] | undefined>(
    'vscode.executeWorkspaceSymbolProvider',
    query
  );

  if (!symbols) return [];

  const effectiveLimit = limit ?? DEFAULT_SYMBOL_LIMIT;

  return symbols.slice(0, effectiveLimit);
}
