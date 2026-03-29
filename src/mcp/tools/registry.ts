// AUTO-GENERATED - DO NOT EDIT
// Source: src/commands/*/definition.yaml
// Run: npm run generate:commands
// Generated: 2026-03-29T01:20:49.743Z

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { registerAddEditorDecoration } from '../../commands/add-editor-decoration/index.js'
import { registerApplyCodeAction } from '../../commands/apply-code-action/index.js'
import { registerCloseFile } from '../../commands/close-file/index.js'
import { registerCreateFile } from '../../commands/create-file/index.js'
import { registerDeleteFile } from '../../commands/delete-file/index.js'
import { registerExecuteVscodeCommand } from '../../commands/execute-vscode-command/index.js'
import { registerFindReferences } from '../../commands/find-references/index.js'
import { registerGetActiveFile } from '../../commands/get-active-file/index.js'
import { registerGetCodeActions } from '../../commands/get-code-actions/index.js'
import { registerGetCompletions } from '../../commands/get-completions/index.js'
import { registerGetDiagnostics } from '../../commands/get-diagnostics/index.js'
import { registerGetDocumentSymbols } from '../../commands/get-document-symbols/index.js'
import { registerGetHover } from '../../commands/get-hover/index.js'
import { registerGetOpenTabs } from '../../commands/get-open-tabs/index.js'
import { registerGetRepoMap } from '../../commands/get-repo-map/index.js'
import { registerGetSelection } from '../../commands/get-selection/index.js'
import { registerGetSignatureHelp } from '../../commands/get-signature-help/index.js'
import { registerGetWorkspaceInfo } from '../../commands/get-workspace-info/index.js'
import { registerGitAction } from '../../commands/git-action/index.js'
import { registerGoToDefinition } from '../../commands/go-to-definition/index.js'
import { registerGoToImplementation } from '../../commands/go-to-implementation/index.js'
import { registerGoToTypeDefinition } from '../../commands/go-to-type-definition/index.js'
import { registerKillTerminal } from '../../commands/kill-terminal/index.js'
import { registerListTerminals } from '../../commands/list-terminals/index.js'
import { registerOpenFile } from '../../commands/open-file/index.js'
import { registerReadFile } from '../../commands/read-file/index.js'
import { registerReadTerminal } from '../../commands/read-terminal/index.js'
import { registerRenameSymbol } from '../../commands/rename-symbol/index.js'
import { registerRequestInput } from '../../commands/request-input/index.js'
import { registerRunTerminalCommand } from '../../commands/run-terminal-command/index.js'
import { registerSearchWorkspaceSymbols } from '../../commands/search-workspace-symbols/index.js'
import { registerShowDiff } from '../../commands/show-diff/index.js'
import { registerShowMessage } from '../../commands/show-message/index.js'
import { registerShowQuickPick } from '../../commands/show-quick-pick/index.js'
import { registerSpawnTerminal } from '../../commands/spawn-terminal/index.js'
import { registerWriteFile } from '../../commands/write-file/index.js'
import { registerWriteTerminal } from '../../commands/write-terminal/index.js'

export function registerAllTools(server: McpServer): void {
  registerAddEditorDecoration(server)
  registerApplyCodeAction(server)
  registerCloseFile(server)
  registerCreateFile(server)
  registerDeleteFile(server)
  registerExecuteVscodeCommand(server)
  registerFindReferences(server)
  registerGetActiveFile(server)
  registerGetCodeActions(server)
  registerGetCompletions(server)
  registerGetDiagnostics(server)
  registerGetDocumentSymbols(server)
  registerGetHover(server)
  registerGetOpenTabs(server)
  registerGetRepoMap(server)
  registerGetSelection(server)
  registerGetSignatureHelp(server)
  registerGetWorkspaceInfo(server)
  registerGitAction(server)
  registerGoToDefinition(server)
  registerGoToImplementation(server)
  registerGoToTypeDefinition(server)
  registerKillTerminal(server)
  registerListTerminals(server)
  registerOpenFile(server)
  registerReadFile(server)
  registerReadTerminal(server)
  registerRenameSymbol(server)
  registerRequestInput(server)
  registerRunTerminalCommand(server)
  registerSearchWorkspaceSymbols(server)
  registerShowDiff(server)
  registerShowMessage(server)
  registerShowQuickPick(server)
  registerSpawnTerminal(server)
  registerWriteFile(server)
  registerWriteTerminal(server)
}
