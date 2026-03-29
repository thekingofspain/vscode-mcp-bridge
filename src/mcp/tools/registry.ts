// AUTO-GENERATED - DO NOT EDIT
// Source: src/commands/*/definition.yaml
// Run: npm run generate:commands
// Generated: 2026-03-29T01:46:09.369Z

import { getAllowedCommands } from '@config/Settings.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TerminalManager } from '@services/TerminalManager.js';

import { execute as AddEditorDecorationExecute, AddEditorDecorationInputSchema } from '@commands/add-editor-decoration/index.js';
import { execute as ApplyCodeActionExecute, ApplyCodeActionInputSchema } from '@commands/apply-code-action/index.js';
import { execute as CloseFileExecute, CloseFileInputSchema } from '@commands/close-file/index.js';
import { execute as CreateFileExecute, CreateFileInputSchema } from '@commands/create-file/index.js';
import { execute as DeleteFileExecute, DeleteFileInputSchema } from '@commands/delete-file/index.js';
import { execute as ExecuteVscodeCommandExecute, ExecuteVscodeCommandInputSchema } from '@commands/execute-vscode-command/index.js';
import { execute as FindReferencesExecute, FindReferencesInputSchema } from '@commands/find-references/index.js';
import { execute as GetActiveFileExecute, GetActiveFileInputSchema } from '@commands/get-active-file/index.js';
import { execute as GetCodeActionsExecute, GetCodeActionsInputSchema } from '@commands/get-code-actions/index.js';
import { execute as GetCompletionsExecute, GetCompletionsInputSchema } from '@commands/get-completions/index.js';
import { execute as GetDiagnosticsExecute, GetDiagnosticsInputSchema } from '@commands/get-diagnostics/index.js';
import { execute as GetDocumentSymbolsExecute, GetDocumentSymbolsInputSchema } from '@commands/get-document-symbols/index.js';
import { execute as GetHoverExecute, GetHoverInputSchema } from '@commands/get-hover/index.js';
import { execute as GetOpenTabsExecute, GetOpenTabsInputSchema } from '@commands/get-open-tabs/index.js';
import { execute as GetRepoMapExecute, GetRepoMapInputSchema } from '@commands/get-repo-map/index.js';
import { execute as GetSelectionExecute, GetSelectionInputSchema } from '@commands/get-selection/index.js';
import { execute as GetSignatureHelpExecute, GetSignatureHelpInputSchema } from '@commands/get-signature-help/index.js';
import { execute as GetWorkspaceInfoExecute, GetWorkspaceInfoInputSchema } from '@commands/get-workspace-info/index.js';
import { execute as GitActionExecute, GitActionInputSchema } from '@commands/git-action/index.js';
import { execute as GoToDefinitionExecute, GoToDefinitionInputSchema } from '@commands/go-to-definition/index.js';
import { execute as GoToImplementationExecute, GoToImplementationInputSchema } from '@commands/go-to-implementation/index.js';
import { execute as GoToTypeDefinitionExecute, GoToTypeDefinitionInputSchema } from '@commands/go-to-type-definition/index.js';
import { execute as KillTerminalExecute, KillTerminalInputSchema } from '@commands/kill-terminal/index.js';
import { execute as ListTerminalsExecute, ListTerminalsInputSchema } from '@commands/list-terminals/index.js';
import { execute as OpenFileExecute, OpenFileInputSchema } from '@commands/open-file/index.js';
import { execute as ReadFileExecute, ReadFileInputSchema } from '@commands/read-file/index.js';
import { execute as ReadTerminalExecute, ReadTerminalInputSchema } from '@commands/read-terminal/index.js';
import { execute as RenameSymbolExecute, RenameSymbolInputSchema } from '@commands/rename-symbol/index.js';
import { execute as RequestInputExecute, RequestInputInputSchema } from '@commands/request-input/index.js';
import { execute as RunTerminalCommandExecute, RunTerminalCommandInputSchema } from '@commands/run-terminal-command/index.js';
import { execute as SearchWorkspaceSymbolsExecute, SearchWorkspaceSymbolsInputSchema } from '@commands/search-workspace-symbols/index.js';
import { execute as ShowDiffExecute, ShowDiffInputSchema } from '@commands/show-diff/index.js';
import { execute as ShowMessageExecute, ShowMessageInputSchema } from '@commands/show-message/index.js';
import { execute as ShowQuickPickExecute, ShowQuickPickInputSchema } from '@commands/show-quick-pick/index.js';
import { execute as SpawnTerminalExecute, SpawnTerminalInputSchema } from '@commands/spawn-terminal/index.js';
import { execute as WriteFileExecute, WriteFileInputSchema } from '@commands/write-file/index.js';
import { execute as WriteTerminalExecute, WriteTerminalInputSchema } from '@commands/write-terminal/index.js';

export function registerAllTools(
  server: McpServer,
  terminalManager: TerminalManager
): void {
  server.registerTool('add_editor_decoration', {
    description: 'Highlight specific lines or ranges in the active editor to provide visual feedback',
    inputSchema: AddEditorDecorationInputSchema
  }, AddEditorDecorationExecute as never);

  server.registerTool('apply_code_action', {
    description: 'Apply a code action by index (get index from get_code_actions first)',
    inputSchema: ApplyCodeActionInputSchema
  }, ApplyCodeActionExecute as never);

  server.registerTool('close_file', {
    description: 'Close a file tab in VS Code',
    inputSchema: CloseFileInputSchema
  }, CloseFileExecute as never);

  server.registerTool('create_file', {
    description: 'Create a new file',
    inputSchema: CreateFileInputSchema
  }, CreateFileExecute as never);

  server.registerTool('delete_file', {
    description: 'Delete a file',
    inputSchema: DeleteFileInputSchema
  }, DeleteFileExecute as never);

  server.registerTool('execute_vscode_command', {
    description: 'Execute any VS Code command. Requires the command to be in the allowedCommands setting.',
    inputSchema: ExecuteVscodeCommandInputSchema
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, (args, _extra) => ExecuteVscodeCommandExecute(getAllowedCommands(), args as { command: string; args?: unknown[] }));
  
  server.registerTool('find_references', {
    description: 'Find all references to a symbol at a given position using LSP',
    inputSchema: FindReferencesInputSchema
  }, FindReferencesExecute as never);

  server.registerTool('get_active_file', {
    description: 'Get the currently active/open file in VS Code',
    inputSchema: GetActiveFileInputSchema
  }, GetActiveFileExecute as never);

  server.registerTool('get_code_actions', {
    description: 'Get available code actions (quick fixes, refactors) for a range in a file',
    inputSchema: GetCodeActionsInputSchema
  }, GetCodeActionsExecute as never);

  server.registerTool('get_completions', {
    description: 'Get IntelliSense completion suggestions at a specific position using LSP',
    inputSchema: GetCompletionsInputSchema
  }, GetCompletionsExecute as never);

  server.registerTool('get_diagnostics', {
    description: 'Get LSP diagnostics with expanded filtering options (Git delta, recursive folders)',
    inputSchema: GetDiagnosticsInputSchema
  }, GetDiagnosticsExecute as never);

  server.registerTool('get_document_symbols', {
    description: 'Get all symbols (functions, classes, variables, etc.) in a file',
    inputSchema: GetDocumentSymbolsInputSchema
  }, GetDocumentSymbolsExecute as never);

  server.registerTool('get_hover', {
    description: 'Get hover information (type info, documentation) for a symbol at a given position',
    inputSchema: GetHoverInputSchema
  }, GetHoverExecute as never);

  server.registerTool('get_open_tabs', {
    description: 'Get all currently open file tabs in VS Code',
    inputSchema: GetOpenTabsInputSchema
  }, GetOpenTabsExecute as never);

  server.registerTool('get_repo_map', {
    description: 'Generate an AST-based global symbol map of the repository to provide context to agents',
    inputSchema: GetRepoMapInputSchema
  }, GetRepoMapExecute as never);

  server.registerTool('get_selection', {
    description: 'Get the current text selection and cursor position',
    inputSchema: GetSelectionInputSchema
  }, GetSelectionExecute as never);

  server.registerTool('get_signature_help', {
    description: 'Get parameter hints and signature information for a function call using LSP',
    inputSchema: GetSignatureHelpInputSchema
  }, GetSignatureHelpExecute as never);

  server.registerTool('get_workspace_info', {
    description: 'Get information about the current VS Code workspace',
    inputSchema: GetWorkspaceInfoInputSchema
  }, GetWorkspaceInfoExecute as never);

  server.registerTool('git_action', {
    description: 'Execute common Git operations directly',
    inputSchema: GitActionInputSchema
  }, GitActionExecute as never);

  server.registerTool('go_to_definition', {
    description: 'Get the definition location(s) of a symbol at a given position using LSP',
    inputSchema: GoToDefinitionInputSchema
  }, GoToDefinitionExecute as never);

  server.registerTool('go_to_implementation', {
    description: 'Get the implementation location(s) of a symbol at a given position using LSP',
    inputSchema: GoToImplementationInputSchema
  }, GoToImplementationExecute as never);

  server.registerTool('go_to_type_definition', {
    description: 'Get the type definition location(s) of a symbol at a given position using LSP',
    inputSchema: GoToTypeDefinitionInputSchema
  }, GoToTypeDefinitionExecute as never);

  server.registerTool('kill_terminal', {
    description: 'Kill a managed terminal and its process',
    inputSchema: KillTerminalInputSchema
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, (args, _extra) => KillTerminalExecute(terminalManager, args as { id: string }));
  server.registerTool('list_terminals', {
    description: 'List all managed terminals and their status (alive/dead, log size)',
    inputSchema: ListTerminalsInputSchema
  }, () => ListTerminalsExecute(terminalManager));
  server.registerTool('open_file', {
    description: 'Open a file in the VS Code editor',
    inputSchema: OpenFileInputSchema
  }, OpenFileExecute as never);

  server.registerTool('read_file', {
    description: 'Read the contents of a file from the file system',
    inputSchema: ReadFileInputSchema
  }, ReadFileExecute as never);

  server.registerTool('read_terminal', {
    description: 'Read recent output from a managed terminal. Returns the tail of the output buffer.',
    inputSchema: ReadTerminalInputSchema
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, (args, _extra) => ReadTerminalExecute(terminalManager, args as { id: string; lines?: number }));
  server.registerTool('rename_symbol', {
    description: 'Rename a symbol and all its references across the workspace',
    inputSchema: RenameSymbolInputSchema
  }, RenameSymbolExecute as never);

  server.registerTool('request_input', {
    description: 'Prompt the user for direct free-text input',
    inputSchema: RequestInputInputSchema
  }, RequestInputExecute as never);

  server.registerTool('run_terminal_command', {
    description: 'Run a shell command and capture its output',
    inputSchema: RunTerminalCommandInputSchema
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, (args, _extra) => RunTerminalCommandExecute(terminalManager, args as { command: string; cwd?: string; timeoutMs?: number }));
  server.registerTool('search_workspace_symbols', {
    description: 'Search for symbols across the entire workspace',
    inputSchema: SearchWorkspaceSymbolsInputSchema
  }, SearchWorkspaceSymbolsExecute as never);

  server.registerTool('show_diff', {
    description: 'Show a visual diff in VS Code before applying file changes. Does NOT write the file.',
    inputSchema: ShowDiffInputSchema
  }, ShowDiffExecute as never);

  server.registerTool('show_message', {
    description: 'Display a notification message to the user in the VS Code UI',
    inputSchema: ShowMessageInputSchema
  }, ShowMessageExecute as never);

  server.registerTool('show_quick_pick', {
    description: 'Show a dropdown menu for the user to select from multiple options',
    inputSchema: ShowQuickPickInputSchema
  }, ShowQuickPickExecute as never);

  server.registerTool('spawn_terminal', {
    description: 'Spawn a long-running process (dev server, watch mode, etc.) in a VS Code terminal with output capture. Use run_terminal_command for short-lived commands instead.',
    inputSchema: SpawnTerminalInputSchema
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, (args, _extra) => SpawnTerminalExecute(terminalManager, args as { name: string; command?: string; cwd?: string }));
  server.registerTool('write_file', {
    description: 'Write content to a file. Integrates with VS Code undo history.',
    inputSchema: WriteFileInputSchema
  }, WriteFileExecute as never);

  server.registerTool('write_terminal', {
    description: 'Send input/text to a managed terminal (e.g. answer a prompt, send a command)',
    inputSchema: WriteTerminalInputSchema
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, (args, _extra) => WriteTerminalExecute(terminalManager, args as { id: string; input: string; addNewline?: boolean }));
}
