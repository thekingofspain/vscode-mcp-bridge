// AUTO-GENERATED - DO NOT EDIT
// Source: src/commands/*/definition.yaml
// Run: npm run generate:commands

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getAllowedCommands } from '@config/Settings.js'
import type { TerminalManager } from '@services/TerminalManager.js'

import { execute as AddEditorDecorationExecute } from '../../commands/add-editor-decoration/handler.js'
import { AddEditorDecorationInputSchema } from '../../commands/add-editor-decoration/schema.js'
import { execute as ApplyCodeActionExecute } from '../../commands/apply-code-action/handler.js'
import { ApplyCodeActionInputSchema } from '../../commands/apply-code-action/schema.js'
import { execute as CloseFileExecute } from '../../commands/close-file/handler.js'
import { CloseFileInputSchema } from '../../commands/close-file/schema.js'
import { execute as CreateFileExecute } from '../../commands/create-file/handler.js'
import { CreateFileInputSchema } from '../../commands/create-file/schema.js'
import { execute as DeleteFileExecute } from '../../commands/delete-file/handler.js'
import { DeleteFileInputSchema } from '../../commands/delete-file/schema.js'
import { execute as ExecuteVscodeCommandExecute } from '../../commands/execute-vscode-command/handler.js'
import { ExecuteVscodeCommandInputSchema } from '../../commands/execute-vscode-command/schema.js'
import { execute as FindReferencesExecute } from '../../commands/find-references/handler.js'
import { FindReferencesInputSchema } from '../../commands/find-references/schema.js'
import { execute as GetActiveFileExecute } from '../../commands/get-active-file/handler.js'
import { GetActiveFileInputSchema } from '../../commands/get-active-file/schema.js'
import { execute as GetCodeActionsExecute } from '../../commands/get-code-actions/handler.js'
import { GetCodeActionsInputSchema } from '../../commands/get-code-actions/schema.js'
import { execute as GetCompletionsExecute } from '../../commands/get-completions/handler.js'
import { GetCompletionsInputSchema } from '../../commands/get-completions/schema.js'
import { execute as GetDiagnosticsExecute } from '../../commands/get-diagnostics/handler.js'
import { GetDiagnosticsInputSchema } from '../../commands/get-diagnostics/schema.js'
import { execute as GetDocumentSymbolsExecute } from '../../commands/get-document-symbols/handler.js'
import { GetDocumentSymbolsInputSchema } from '../../commands/get-document-symbols/schema.js'
import { execute as GetHoverExecute } from '../../commands/get-hover/handler.js'
import { GetHoverInputSchema } from '../../commands/get-hover/schema.js'
import { execute as GetOpenTabsExecute } from '../../commands/get-open-tabs/handler.js'
import { GetOpenTabsInputSchema } from '../../commands/get-open-tabs/schema.js'
import { execute as GetRepoMapExecute } from '../../commands/get-repo-map/handler.js'
import { GetRepoMapInputSchema } from '../../commands/get-repo-map/schema.js'
import { execute as GetSelectionExecute } from '../../commands/get-selection/handler.js'
import { GetSelectionInputSchema } from '../../commands/get-selection/schema.js'
import { execute as GetSignatureHelpExecute } from '../../commands/get-signature-help/handler.js'
import { GetSignatureHelpInputSchema } from '../../commands/get-signature-help/schema.js'
import { execute as GetWorkspaceInfoExecute } from '../../commands/get-workspace-info/handler.js'
import { GetWorkspaceInfoInputSchema } from '../../commands/get-workspace-info/schema.js'
import { execute as GitActionExecute } from '../../commands/git-action/handler.js'
import { GitActionInputSchema } from '../../commands/git-action/schema.js'
import { execute as GoToDefinitionExecute } from '../../commands/go-to-definition/handler.js'
import { GoToDefinitionInputSchema } from '../../commands/go-to-definition/schema.js'
import { execute as GoToImplementationExecute } from '../../commands/go-to-implementation/handler.js'
import { GoToImplementationInputSchema } from '../../commands/go-to-implementation/schema.js'
import { execute as GoToTypeDefinitionExecute } from '../../commands/go-to-type-definition/handler.js'
import { GoToTypeDefinitionInputSchema } from '../../commands/go-to-type-definition/schema.js'
import { execute as KillTerminalExecute } from '../../commands/kill-terminal/handler.js'
import { KillTerminalInputSchema } from '../../commands/kill-terminal/schema.js'
import { execute as ListTerminalsExecute } from '../../commands/list-terminals/handler.js'
import { ListTerminalsInputSchema } from '../../commands/list-terminals/schema.js'
import { execute as OpenFileExecute } from '../../commands/open-file/handler.js'
import { OpenFileInputSchema } from '../../commands/open-file/schema.js'
import { execute as ReadFileExecute } from '../../commands/read-file/handler.js'
import { ReadFileInputSchema } from '../../commands/read-file/schema.js'
import { execute as ReadTerminalExecute } from '../../commands/read-terminal/handler.js'
import { ReadTerminalInputSchema } from '../../commands/read-terminal/schema.js'
import { execute as RenameSymbolExecute } from '../../commands/rename-symbol/handler.js'
import { RenameSymbolInputSchema } from '../../commands/rename-symbol/schema.js'
import { execute as RequestInputExecute } from '../../commands/request-input/handler.js'
import { RequestInputInputSchema } from '../../commands/request-input/schema.js'
import { execute as RunTerminalCommandExecute } from '../../commands/run-terminal-command/handler.js'
import { RunTerminalCommandInputSchema } from '../../commands/run-terminal-command/schema.js'
import { execute as SearchWorkspaceSymbolsExecute } from '../../commands/search-workspace-symbols/handler.js'
import { SearchWorkspaceSymbolsInputSchema } from '../../commands/search-workspace-symbols/schema.js'
import { execute as ShowDiffExecute } from '../../commands/show-diff/handler.js'
import { ShowDiffInputSchema } from '../../commands/show-diff/schema.js'
import { execute as ShowMessageExecute } from '../../commands/show-message/handler.js'
import { ShowMessageInputSchema } from '../../commands/show-message/schema.js'
import { execute as ShowQuickPickExecute } from '../../commands/show-quick-pick/handler.js'
import { ShowQuickPickInputSchema } from '../../commands/show-quick-pick/schema.js'
import { execute as SpawnTerminalExecute } from '../../commands/spawn-terminal/handler.js'
import { SpawnTerminalInputSchema } from '../../commands/spawn-terminal/schema.js'
import { execute as WriteFileExecute } from '../../commands/write-file/handler.js'
import { WriteFileInputSchema } from '../../commands/write-file/schema.js'
import { execute as WriteTerminalExecute } from '../../commands/write-terminal/handler.js'
import { WriteTerminalInputSchema } from '../../commands/write-terminal/schema.js'

export function registerAllTools(
  server: McpServer,
  terminalManager: TerminalManager,
): void {
    server.registerTool('add_editor_decoration', {
      description: 'Highlight specific lines or ranges in the active editor to provide visual feedback',
      inputSchema: AddEditorDecorationInputSchema
    }, AddEditorDecorationExecute as never)
      server.registerTool('apply_code_action', {
      description: 'Apply a code action by index (get index from get_code_actions first)',
      inputSchema: ApplyCodeActionInputSchema
    }, ApplyCodeActionExecute as never)
      server.registerTool('close_file', {
      description: 'Close a file tab in VS Code',
      inputSchema: CloseFileInputSchema
    }, CloseFileExecute as never)
      server.registerTool('create_file', {
      description: 'Create a new file',
      inputSchema: CreateFileInputSchema
    }, CreateFileExecute as never)
      server.registerTool('delete_file', {
      description: 'Delete a file',
      inputSchema: DeleteFileInputSchema
    }, DeleteFileExecute as never)
      server.registerTool('execute_vscode_command', {
      description: 'Execute any VS Code command. Requires the command to be in the allowedCommands setting.',
      inputSchema: ExecuteVscodeCommandInputSchema
    }, ExecuteVscodeCommandExecute as never)
      server.registerTool('find_references', {
      description: 'Find all references to a symbol at a given position using LSP',
      inputSchema: FindReferencesInputSchema
    }, FindReferencesExecute as never)
      server.registerTool('get_active_file', {
      description: 'Get the currently active/open file in VS Code',
      inputSchema: GetActiveFileInputSchema
    }, GetActiveFileExecute as never)
      server.registerTool('get_code_actions', {
      description: 'Get available code actions (quick fixes, refactors) for a range in a file',
      inputSchema: GetCodeActionsInputSchema
    }, GetCodeActionsExecute as never)
      server.registerTool('get_completions', {
      description: 'Get IntelliSense completion suggestions at a specific position using LSP',
      inputSchema: GetCompletionsInputSchema
    }, GetCompletionsExecute as never)
      server.registerTool('get_diagnostics', {
      description: 'Get LSP diagnostics with expanded filtering options (Git delta, recursive folders)',
      inputSchema: GetDiagnosticsInputSchema
    }, GetDiagnosticsExecute as never)
      server.registerTool('get_document_symbols', {
      description: 'Get all symbols (functions, classes, variables, etc.) in a file',
      inputSchema: GetDocumentSymbolsInputSchema
    }, GetDocumentSymbolsExecute as never)
      server.registerTool('get_hover', {
      description: 'Get hover information (type info, documentation) for a symbol at a given position',
      inputSchema: GetHoverInputSchema
    }, GetHoverExecute as never)
      server.registerTool('get_open_tabs', {
      description: 'Get all currently open file tabs in VS Code',
      inputSchema: GetOpenTabsInputSchema
    }, GetOpenTabsExecute as never)
      server.registerTool('get_repo_map', {
      description: 'Generate an AST-based global symbol map of the repository to provide context to agents',
      inputSchema: GetRepoMapInputSchema
    }, GetRepoMapExecute as never)
      server.registerTool('get_selection', {
      description: 'Get the current text selection and cursor position',
      inputSchema: GetSelectionInputSchema
    }, GetSelectionExecute as never)
      server.registerTool('get_signature_help', {
      description: 'Get parameter hints and signature information for a function call using LSP',
      inputSchema: GetSignatureHelpInputSchema
    }, GetSignatureHelpExecute as never)
      server.registerTool('get_workspace_info', {
      description: 'Get information about the current VS Code workspace',
      inputSchema: GetWorkspaceInfoInputSchema
    }, GetWorkspaceInfoExecute as never)
      server.registerTool('git_action', {
      description: 'Execute common Git operations directly',
      inputSchema: GitActionInputSchema
    }, GitActionExecute as never)
      server.registerTool('go_to_definition', {
      description: 'Get the definition location(s) of a symbol at a given position using LSP',
      inputSchema: GoToDefinitionInputSchema
    }, GoToDefinitionExecute as never)
      server.registerTool('go_to_implementation', {
      description: 'Get the implementation location(s) of a symbol at a given position using LSP',
      inputSchema: GoToImplementationInputSchema
    }, GoToImplementationExecute as never)
      server.registerTool('go_to_type_definition', {
      description: 'Get the type definition location(s) of a symbol at a given position using LSP',
      inputSchema: GoToTypeDefinitionInputSchema
    }, GoToTypeDefinitionExecute as never)
      server.registerTool('kill_terminal', {
      description: 'Kill a managed terminal and its process',
      inputSchema: KillTerminalInputSchema
    }, KillTerminalExecute as never)
      server.registerTool('list_terminals', {
      description: 'List all managed terminals and their status (alive/dead, log size)',
      inputSchema: ListTerminalsInputSchema
    }, ListTerminalsExecute as never)
      server.registerTool('open_file', {
      description: 'Open a file in the VS Code editor',
      inputSchema: OpenFileInputSchema
    }, OpenFileExecute as never)
      server.registerTool('read_file', {
      description: 'Read the contents of a file from the file system',
      inputSchema: ReadFileInputSchema
    }, ReadFileExecute as never)
      server.registerTool('read_terminal', {
      description: 'Read recent output from a managed terminal. Returns the tail of the output buffer.',
      inputSchema: ReadTerminalInputSchema
    }, ReadTerminalExecute as never)
      server.registerTool('rename_symbol', {
      description: 'Rename a symbol and all its references across the workspace',
      inputSchema: RenameSymbolInputSchema
    }, RenameSymbolExecute as never)
      server.registerTool('request_input', {
      description: 'Prompt the user for direct free-text input',
      inputSchema: RequestInputInputSchema
    }, RequestInputExecute as never)
      server.registerTool('run_terminal_command', {
      description: 'Run a shell command and capture its output',
      inputSchema: RunTerminalCommandInputSchema
    }, RunTerminalCommandExecute as never)
      server.registerTool('search_workspace_symbols', {
      description: 'Search for symbols across the entire workspace',
      inputSchema: SearchWorkspaceSymbolsInputSchema
    }, SearchWorkspaceSymbolsExecute as never)
      server.registerTool('show_diff', {
      description: 'Show a visual diff in VS Code before applying file changes. Does NOT write the file.',
      inputSchema: ShowDiffInputSchema
    }, ShowDiffExecute as never)
      server.registerTool('show_message', {
      description: 'Display a notification message to the user in the VS Code UI',
      inputSchema: ShowMessageInputSchema
    }, ShowMessageExecute as never)
      server.registerTool('show_quick_pick', {
      description: 'Show a dropdown menu for the user to select from multiple options',
      inputSchema: ShowQuickPickInputSchema
    }, ShowQuickPickExecute as never)
      server.registerTool('spawn_terminal', {
      description: 'Spawn a long-running process (dev server, watch mode, etc.) in a VS Code terminal with output capture. Use run_terminal_command for short-lived commands instead.',
      inputSchema: SpawnTerminalInputSchema
    }, SpawnTerminalExecute as never)
      server.registerTool('write_file', {
      description: 'Write content to a file. Integrates with VS Code undo history.',
      inputSchema: WriteFileInputSchema
    }, WriteFileExecute as never)
      server.registerTool('write_terminal', {
      description: 'Send input/text to a managed terminal (e.g. answer a prompt, send a command)',
      inputSchema: WriteTerminalInputSchema
    }, WriteTerminalExecute as never)
  }
