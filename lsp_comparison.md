# VS Code LSP vs. MCP Bridge Comparison

This document provides a comprehensive mapping between Microsoft's development interfaces (LSP 3.17 and VS Code Window API) and the tools exposed by the `vscode-mcp-bridge`.

## Table 1: Language Server Protocol (LSP 3.17) Mapping

| LSP 3.17 Method / Notification | MCP Tool | API Output Format | MCP Output Format | Parity | Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `codeLens/resolve` | N/A | `CodeLens` | N/A | **N/A** | **Not Exposed.** |
| `documentLink/resolve` | N/A | `DocumentLink` | N/A | **N/A** | **Not Exposed.** |
| `inlayHint/resolve` | N/A | `InlayHint` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/callHierarchy` | N/A | `CallHierarchyItem[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/codeAction` | `get_code_actions` | `(Command/CodeAction)[]` | `SerializedAction[]` | **No** | MCP flattens actions to indices; loses detailed edit/command objects until applied. |
| `textDocument/codeLens` | N/A | `CodeLens[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/colorPresentation` | N/A | `ColorPresentation[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/completion` | N/A | `CompletionList` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/declaration` | N/A | `Location[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/definition` | `go_to_definition` | `Location/LocationLink[]` | `SimplifiedLoc[]` | **No** | MCP flattens and returns raw coordinates; loses `originSelectionRange`. |
| `textDocument/diagnostic` (Pull) | `get_diagnostics` | `DocDiagReport` | `DiagItem[]` | **No** | MCP flattens severity and loses `relatedInformation` / `tags`. |
| `textDocument/didChange` | N/A | `void` | N/A | **N/A** | **Internal.** Managed by VS Code. |
| `textDocument/didClose` | N/A | `void` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/didOpen` | `get_active_file` | `void` | `FileSnapshot` | **Yes** | MCP captures the resulting document state (content, language). |
| `textDocument/didSave` | N/A | `void` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/documentColor` | N/A | `ColorInformation[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/documentHighlight` | N/A | `DocumentHighlight[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/documentLink` | N/A | `DocumentLink[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/documentSymbol` | `get_document_symbols` | `DocumentSymbol[]` | `SerializedSymbol[]` | **No** | Tree structure preserved but `selectionRange` and specific flags lost. |
| `textDocument/foldingRange` | N/A | `FoldingRange[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/formatting` | N/A | `TextEdit[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/hover` | `get_hover` | `Hover` | `{ contents: string[] }` | **Partial** | MCP extracts plain strings; loses `range` and `MarkupContent` formatting. |
| `textDocument/implementation` | N/A | `Location/LocationLink[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/inlayHint` | N/A | `InlayHint[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/inlineValue` | N/A | `InlineValue[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/linkedEditingRange` | N/A | `LinkedEditingRanges` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/onTypeFormatting` | N/A | `TextEdit[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/publishDiagnostics` | `get_diagnostics` | `DiagParams` | `DiagItem[]` | **No** | Common bridge used to pull pushed diagnostics from VS Code. |
| `textDocument/rangeFormatting` | N/A | `TextEdit[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/references` | `find_references` | `Location[]` | `SimplifiedLoc[]` | **Yes** | Standard URI and range coordinates are preserved. |
| `textDocument/rename` | `rename_symbol` | `WorkspaceEdit` | `{ files, edits }` | **No** | Executes the edit but only reports stats (count) rather than the diff. |
| `textDocument/selectionRange` | N/A | `SelectionRange[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/semanticTokens` | N/A | `SemanticTokens` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/signatureHelp` | N/A | `SignatureHelp` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/typeDefinition` | N/A | `Location/LocationLink[]` | N/A | **N/A** | **Not Exposed.** |
| `textDocument/typeHierarchy` | N/A | `TypeHierarchyItem[]` | N/A | **N/A** | **Not Exposed.** |
| `workspace/executeCommand` | `apply_code_action` | `any` | `{ applied, title }` | **No** | Executes command but returns a boolean success status instead of raw data. |
| `workspace/symbol` | `search_workspace_symbols` | `SymbolInformation[]` | `SerializedSymbol[]` | **Yes** | Key metadata (name, kind, location) mapped to flat results. |
| `workspace/workspaceFolders` | `get_workspace_info` | `WorkspaceFolder[]` | `FolderInfo[]` | **Yes** | Root paths and folder names are fully mapped. |

## Table 2: VS Code Window API Mapping (Exhaustive)

| Window API Member | MCP Tool | API Output Format | MCP Output Format | Parity | Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `activeTerminal` | N/A | `Terminal` | N/A | **N/A** | **Not Exposed.** |
| `activeTextEditor` | `get_active_file` | `TextEditor` | `ActiveFileSnapshot` | **Yes** | Captures document URI, content, and language ID. |
| `activeTextEditor` | `get_selection` | `Selection` | `SelectionSnapshot` | **Yes** | Captures start/end coordinates and selected text. |
| `createInputBox` | N/A | `InputBox` | N/A | **N/A** | **Not Exposed.** Low-level interactive input. |
| `createOutputChannel` | N/A | `OutputChannel` | N/A | **N/A** | **Not Exposed.** Output logging. |
| `createQuickPick` | N/A | `QuickPick` | N/A | **N/A** | **Not Exposed.** Advanced selection menus. |
| `createStatusBarItem` | N/A | `StatusBarItem` | N/A | **N/A** | **Not Exposed.** Status bar widgets. |
| `createTerminal` | `spawn_terminal` | `Terminal` | `{ id, name }` | **No** | MCP registers as "Managed Terminal" but loses native object reference. |
| `createTreeView` | N/A | `TreeView` | N/A | **N/A** | **Not Exposed.** Custom sidebar views. |
| `createWebviewPanel` | N/A | `WebviewPanel` | N/A | **N/A** | **Not Exposed.** Custom HTML interfaces. |
| `onDidChangeActiveTerminal` | N/A | `Event` | N/A | **N/A** | **Not Exposed.** Technology: Push events. |
| `onDidChangeActiveTextEditor` | N/A | `Event` | N/A | **N/A** | **Not Exposed.** Technology: Push events. |
| `onDidChangeTerminalState` | N/A | `Event` | N/A | **N/A** | **Not Exposed.** Technology: Push events. |
| `onDidChangeWindowState` | N/A | `Event` | N/A | **N/A** | **Not Exposed.** Technology: Push events. |
| `onDidCloseTerminal` | N/A | `Event` | N/A | **N/A** | **Not Exposed.** Technology: Push events. |
| `onDidOpenTerminal` | N/A | `Event` | N/A | **N/A** | **Not Exposed.** Technology: Push events. |
| `setStatusBarMessage` | N/A | `Disposable` | N/A | **N/A** | **Not Exposed.** |
| `showErrorMessage` | N/A | `Thenable` | N/A | **N/A** | **Not Exposed.** |
| `showInformationMessage" | N/A | `Thenable` | N/A | **N/A** | **Not Exposed.** |
| `showInputBox` | N/A | `Thenable` | N/A | **N/A** | **Not Exposed.** |
| `showOpenDialog` | N/A | `Thenable` | N/A | **N/A** | **Not Exposed.** System file picker. |
| `showQuickPick` | N/A | `Thenable` | N/A | **N/A** | **Not Exposed.** |
| `showSaveDialog` | N/A | `Thenable` | N/A | **N/A** | **Not Exposed.** System save picker. |
| `showTextDocument` | `open_file` | `Thenable<Editor>` | `{ opened, filePath }` | **No** | Opens document but results in a boolean flag. |
| `showWarningMessage` | N/A | `Thenable` | N/A | **N/A** | **Not Exposed.** |
| `showWorkspaceFolderPick` | N/A | `Thenable` | N/A | **N/A** | **Not Exposed.** |
| `state` | N/A | `WindowState` | N/A | **N/A** | **Not Exposed.** Workspace focus state. |
| `tabGroups.all` | `get_open_tabs` | `TabGroup[]` | `OpenTab[]` | **Partial** | Maps tab URIs but loses group focus and layout metadata. |
| `tabGroups.close` | `close_file` | `Thenable<boolean>` | `{ closed: count }` | **Yes** | Correctly reports number of matching tabs closed. |
| `terminals` | `list_terminals" | `Terminal[]` | `ManagedTerminal[]` | **No** | Only returns terminals spawned by the MCP bridge. |
| `visibleTextEditors` | N/A | `TextEditor[]` | N/A | **N/A** | **Not Exposed.** Information about all visible groups. |
| `withProgress` | N/A | `Thenable` | N/A | **N/A** | **Not Exposed.** |

## Table 4: Serena Agent Technology & Feature Mapping

| Serena Feature / Technology | MCP Bridge Equivalent | Technology Basis | Status |
| :--- | :--- | :--- | :--- |
| `find_symbol` | `get_document_symbols` | LSP `textDocument/documentSymbol` | **Equivalent** |
| `go_to_definition` | `go_to_definition` | LSP `textDocument/definition` | **Matched** |
| `find_references` | `find_references` | LSP `textDocument/references` | **Matched** |
| `insert_after_symbol` | N/A | AST Parsing + WorkspaceEdit | **Gap.** Serena uses semantic insertions. |
| `replace_symbol_content` | N/A | AST Parsing + WorkspaceEdit | **Gap.** Serena targets symbols semantically. |
| `semantic_search` | `search_workspace_symbols` | LSP `workspace/symbol` | **Partial.** Serena often wraps vector RAG. |
| Project Indexing | N/A | Background LSP Crawl | **Gap.** Serena builds a persistent symbol graph. |

## Table 5: Repo Mapping Technologies (Aider `repomap` vs. Bridge)

| Repo Mapper Feature | MCP Bridge Equivalent | Technology Basis | Details |
| :--- | :--- | :--- | :--- |
| **Global Symbol Map** | `search_workspace_symbols` | LSP `workspace/symbol` | **Partial.** Bridge provides raw search; Repo Map provides a ranked summary. |
| **Prioritization** | N/A | PageRank / Graph Analysis | **Gap.** Repo Map identifies "important" files to fit in context window. |
| **AST Extraction** | `get_document_symbols` | Tree-sitter / LSP Providers | **Equivalent.** Both use semantic parsers for signatures. |
| **Call Graph Integration** | N/A | Dependency Graph Analysis | **Gap.** Repo Map understands cross-file dependencies for ranking. |
| **Token Optimization** | N/A | Trimmed Summary | **Gap.** Bridge returns full JSON; Repo Map outputs a compact text map. |

## Table 6: Extended Bridge Capabilities (Implementation Details)

| Bridge Command | Library | API / Property | Order |
| :--- | :--- | :--- | :--- |
| `create_file` | `vscode` | `Uri.file(filePath)` | 1 |
| | `vscode` | `new WorkspaceEdit()` | 2 |
| | `vscode` | `WorkspaceEdit.createFile(uri)` | 3 |
| | `vscode` | `workspace.applyEdit(edit)` | 4 |
| `delete_file` | `vscode` | `Uri.file(filePath)` | 1 |
| | `vscode` | `new WorkspaceEdit()` | 2 |
| | `vscode` | `WorkspaceEdit.deleteFile(uri)` | 3 |
| | `vscode` | `workspace.applyEdit(edit)` | 4 |
| `execute_vscode_command` | `vscode" | `commands.executeCommand(command, ...args)` | 1 |
| `kill_terminal` | `vscode` | `Terminal.sendText('exit', true)` | 1 |
| | `vscode` | `Terminal.dispose()` | 2 |
| | `fs` | `unlinkSync(logFile)` | 3 |
| `list_terminals` | `fs" | `statSync(logFile)` (to get logSize) | 1 |
| `read_file` | `vscode` | `Uri.file(filePath)` | 1 |
| | `vscode` | `workspace.openTextDocument(uri)` | 2 |
| | `vscode` | `TextDocument.getText()` | 3 |
| `read_terminal` | `fs" | `statSync(logFile)` | 1 |
| | `fs" | `openSync(logFile, 'r')` | 2 |
| | `fs" | `readSync(fd, buffer, offset, length, pos)` | 3 |
| | `fs" | `closeSync(fd)` | 4 |
| `run_terminal_command` (Strategy: `childProcess`) | `child_process` | `exec(command, {cwd, timeout})` | 1 |
| `run_terminal_command` (Strategy: `shellIntegration`) | `vscode` | `window.createTerminal()` | 1 |
| | `vscode` | `Terminal.show()` | 2 |
| | `vscode` | `Terminal.sendText(command)` | 3 |
| | `vscode` | `window.onDidEndTerminalShellExecution` | 4 |
| `show_diff` | `vscode` | `Uri.file(filePath)` (Original source) | 1 |
| | `vscode" | `Uri.parse('vscode-mcp-preview:path')` | 2 |
| | `internal` | `MemoryFileSystemProvider.writeFile()` | 3 |
| | `vscode" | `commands.executeCommand('vscode.diff')` | 4 |
| `spawn_terminal` | `vscode" | `window.createTerminal({shellPath, shellArgs})` | 1 |
| | `vscode" | `Terminal.show(true)` | 2 |
| | `vscode" | `Terminal.sendText(command)` (if provided) | 3 |
| | `vscode" | `window.onDidCloseTerminal` (listener) | 4 |
| `write_file" | `vscode` | `Uri.file(filePath)` | 1 |
| | `vscode` | `workspace.fs.stat(uri)` | 2 |
| | `vscode` | `new WorkspaceEdit()` | 3 |
| | `vscode` | `WorkspaceEdit.createFile(uri)` (conditional) | 4 |
| | `vscode` | `WorkspaceEdit.set(uri, [TextEdit.replace])` | 5 |
| | `vscode` | `workspace.applyEdit(edit)` | 6 |
| `write_terminal" | `vscode` | `Terminal.sendText(input, addNewline)` | 1 |
