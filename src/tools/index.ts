import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { VsCodeBridge } from '../bridge/VsCodeBridge.js'
import { TerminalManager } from '../terminal/TerminalManager.js'
import type { Settings } from '../config/Settings.js'
import { log } from '../utils/logger.js'

function symbolKindName(kind: number): string {
  const kinds = ['File', 'Module', 'Namespace', 'Package', 'Class', 'Method', 'Property', 'Field', 'Constructor',
    'Enum', 'Interface', 'Function', 'Variable', 'Constant', 'String', 'Number', 'Boolean', 'Array', 'Object',
    'Key', 'Null', 'EnumMember', 'Struct', 'Event', 'Operator', 'TypeParameter']
  return kinds[kind] ?? 'Unknown'
}

function serializeSymbols(symbols: { name: string; kind: number; range: { start: { line: number; character: number }; end: { line: number; character: number } }; detail?: string; children?: unknown[] }[]): unknown {
  return symbols.map(s => ({
    name: s.name,
    kind: symbolKindName(s.kind),
    startLine: s.range.start.line,
    endLine: s.range.end.line,
    detail: s.detail ?? null,
    children: s.children ? serializeSymbols(s.children as Parameters<typeof serializeSymbols>[0]) : [],
  }))
}

// Wrap a tool handler with logging
function logged<T, R>(toolName: string, handler: (args: T) => R): (args: T) => R {
  return (args: T) => {
    log.debug('Tool', `${toolName} called`, args)
    try {
      const result = handler(args)
      log.debug('Tool', `${toolName} completed`)
      return result
    } catch (err) {
      log.error('Tool', `${toolName} failed`, (err as Error).message)
      throw err
    }
  }
}

export function registerTools(server: McpServer, bridge: VsCodeBridge, settings: Settings, terminalManager: TerminalManager): void {
  log.info('Tools', 'Registering tools')

  // --- Active File ---
  server.registerTool('get_active_file', {
    description: 'Get the currently active/open file in VS Code',
    inputSchema: {}
  }, () => {
    const snap = bridge.getActiveFileSnapshot()
    return { content: [{ type: 'text', text: JSON.stringify(snap) }] }
  })

  // --- Selection ---
  server.registerTool('get_selection', {
    description: 'Get the current text selection and cursor position',
    inputSchema: {}
  }, () => {
    const snap = bridge.getSelectionSnapshot()
    return { content: [{ type: 'text', text: JSON.stringify(snap) }] }
  })

  // --- Open Tabs ---
  server.registerTool('get_open_tabs', {
    description: 'Get all currently open file tabs in VS Code',
    inputSchema: {}
  }, () => {
    const tabs = bridge.getOpenTabs()
    return { content: [{ type: 'text', text: JSON.stringify(tabs) }] }
  })

  // --- Diagnostics ---
  server.registerTool('get_diagnostics', {
    description: 'Get LSP diagnostics with expanded filtering options (Git delta, recursive folders)',
    inputSchema: {
      scope: z.enum(['open_files', 'workspace', 'git_delta', 'folder', 'file']).describe('Filtering scope for diagnostics'),
      targetPath: z.string().optional().describe('Absolute path to a specific file or folder (required if scope is file or folder)'),
      recursive: z.boolean().optional().default(true).describe('Recursive folder search (if scope is folder)'),
      severity: z.enum(['error', 'warning', 'information', 'hint']).optional().describe('Filter by minimum severity'),
    }
  }, async ({ scope, targetPath, recursive, severity }) => {
    const diags = await bridge.getDiagnostics({ scope, targetPath, recursive, severity })
    return { content: [{ type: 'text', text: JSON.stringify(diags) }] }
  })

  // --- Repo Map ---
  server.registerTool('get_repo_map', {
    description: 'Generate an AST-based global symbol map of the repository to provide context to agents',
    inputSchema: {
      directory: z.string().optional().describe('Absolute path to the directory to map. Defaults to workspace root.'),
    }
  }, async ({ directory }) => {
    const map = await bridge.getRepoMap(directory)
    return { content: [{ type: 'text', text: map }] }
  })

  // --- Show Diff ---
  server.registerTool('show_diff', {
    description: 'Show a visual diff in VS Code before applying file changes. Does NOT write the file.',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file to diff'),
      newContent: z.string().describe('The proposed new content to show in the diff'),
      title: z.string().optional().describe('Title for the diff editor tab'),
    }
  }, async ({ filePath, newContent, title }) => {
    await bridge.showDiff(filePath, newContent, title)
    return { content: [{ type: 'text', text: JSON.stringify({ shown: true, filePath }) }] }
  })

  // --- Show Message ---
  server.registerTool('show_message', {
    description: 'Display a notification message to the user in the VS Code UI',
    inputSchema: {
      message: z.string().describe('The text of the message'),
      level: z.enum(['info', 'warning', 'error']).optional().default('info').describe('The severity level of the message'),
      items: z.array(z.string()).optional().default([]).describe('Buttons/options to show alongside the message'),
    }
  }, async ({ message, level, items }) => {
    const selectedItem = await bridge.showMessage(message, level, items)
    return { content: [{ type: 'text', text: JSON.stringify({ selectedItem: selectedItem ?? null }) }] }
  })

  // --- Show Quick Pick ---
  server.registerTool('show_quick_pick', {
    description: 'Show a dropdown menu for the user to select from multiple options',
    inputSchema: {
      items: z.array(z.string()).describe('The list of options to display'),
      placeHolder: z.string().optional().describe('Prompt text shown in the input box'),
      canPickMany: z.boolean().optional().default(false).describe('Allow selecting multiple items'),
    }
  }, async ({ items, placeHolder, canPickMany }) => {
    const selectedItems = await bridge.showQuickPick(items, placeHolder, canPickMany)
    return { content: [{ type: 'text', text: JSON.stringify({ selectedItems: selectedItems ?? [] }) }] }
  })

  // --- Request Input ---
  server.registerTool('request_input', {
    description: 'Prompt the user for direct free-text input',
    inputSchema: {
      prompt: z.string().describe('The text to explain what input is needed'),
      placeHolder: z.string().optional().describe('Placeholder text in the input box'),
      value: z.string().optional().describe('Pre-filled value'),
    }
  }, async ({ prompt, placeHolder, value }) => {
    const inputValue = await bridge.requestInput(prompt, placeHolder, value)
    return { content: [{ type: 'text', text: JSON.stringify({ value: inputValue ?? null }) }] }
  })

  // --- Read File ---
  server.registerTool('read_file', {
    description: 'Read the contents of a file',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      startLine: z.number().int().min(0).optional().describe('Start line (0-indexed, inclusive)'),
      endLine: z.number().int().min(0).optional().describe('End line (0-indexed, inclusive)'),
    }
  }, async ({ filePath, startLine, endLine }) => {
    const result = await bridge.readFile(filePath, startLine, endLine)
    return { content: [{ type: 'text', text: JSON.stringify(result) }] }
  })

  // --- Write File ---
  server.registerTool('write_file', {
    description: 'Write content to a file. Integrates with VS Code undo history.',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      content: z.string().describe('The full content to write'),
      createIfMissing: z.boolean().optional().default(true).describe('Create the file if it does not exist'),
    }
  }, async ({ filePath, content, createIfMissing }) => {
    const result = await bridge.writeFile(filePath, content, createIfMissing)
    return { content: [{ type: 'text', text: JSON.stringify(result) }] }
  })

  // --- Create File ---
  server.registerTool('create_file', {
    description: 'Create a new file',
    inputSchema: {
      filePath: z.string().describe('Absolute path for the new file'),
      content: z.string().optional().default('').describe('Initial content'),
    }
  }, async ({ filePath, content }) => {
    await bridge.createFile(filePath, content)
    return { content: [{ type: 'text', text: JSON.stringify({ created: true, filePath }) }] }
  })

  // --- Delete File ---
  server.registerTool('delete_file', {
    description: 'Delete a file',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file to delete'),
    }
  }, async ({ filePath }) => {
    await bridge.deleteFile(filePath)
    return { content: [{ type: 'text', text: JSON.stringify({ deleted: true, filePath }) }] }
  })

  // --- Open File ---
  server.registerTool('open_file', {
    description: 'Open a file in the VS Code editor',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      line: z.number().int().min(0).optional().describe('Line to jump to (0-indexed)'),
      character: z.number().int().min(0).optional().describe('Character position'),
      preview: z.boolean().optional().default(false).describe('Open in preview mode'),
    }
  }, async ({ filePath, line, character, preview }) => {
    await bridge.openFile(filePath, line, character, preview)
    return { content: [{ type: 'text', text: JSON.stringify({ opened: true, filePath }) }] }
  })

  // --- Close File ---
  server.registerTool('close_file', {
    description: 'Close a file tab in VS Code',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file to close'),
    }
  }, async ({ filePath }) => {
    const result = await bridge.closeFile(filePath)
    return { content: [{ type: 'text', text: JSON.stringify({ ...result, filePath }) }] }
  })

  // --- Run Terminal Command ---
  server.registerTool('run_terminal_command', {
    description: 'Run a shell command and capture its output',
    inputSchema: {
      command: z.string().describe('The shell command to run'),
      cwd: z.string().optional().describe('Working directory (defaults to workspace root)'),
      timeoutMs: z.number().int().min(1000).optional().default(30000).describe('Timeout in milliseconds'),
    }
  }, async ({ command, cwd, timeoutMs }) => {
    const strategy = (settings.get('terminalStrategy') as string) || 'childProcess'
    const result = await bridge.runCommand(command, cwd, timeoutMs, strategy)
    return { content: [{ type: 'text', text: JSON.stringify(result) }] }
  })

  // --- Find References ---
  server.registerTool('find_references', {
    description: 'Find all references to a symbol at a given position using LSP',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      line: z.number().int().min(0).describe('Line number (0-indexed)'),
      character: z.number().int().min(0).describe('Character position (0-indexed)'),
      includeDeclaration: z.boolean().optional().default(true),
    }
  }, async ({ filePath, line, character, includeDeclaration }) => {
    const refs = await bridge.getReferences(filePath, line, character, includeDeclaration)
    const serialized = refs.map(r => ({
      filePath: r.uri.fsPath,
      startLine: r.range.start.line,
      startChar: r.range.start.character,
      endLine: r.range.end.line,
      endChar: r.range.end.character,
    }))
    return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
  })

  // --- Go To Definition ---
  server.registerTool('go_to_definition', {
    description: 'Get the definition location(s) of a symbol at a given position using LSP',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      line: z.number().int().min(0).describe('Line number (0-indexed)'),
      character: z.number().int().min(0).describe('Character position (0-indexed)'),
    }
  }, async ({ filePath, line, character }) => {
    const defs = await bridge.getDefinition(filePath, line, character)
    const serialized = defs.map(d => {
      if ('uri' in d) {
        return { filePath: d.uri.fsPath, startLine: d.range.start.line, startChar: d.range.start.character, endLine: d.range.end.line, endChar: d.range.end.character }
      }
      return { filePath: d.targetUri.fsPath, startLine: d.targetRange.start.line, startChar: d.targetRange.start.character, endLine: d.targetRange.end.line, endChar: d.targetRange.end.character }
    })
    return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
  })

  // --- Go To Type Definition ---
  server.registerTool('go_to_type_definition', {
    description: 'Get the type definition location(s) of a symbol at a given position using LSP',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      line: z.number().int().min(0).describe('Line number (0-indexed)'),
      character: z.number().int().min(0).describe('Character position (0-indexed)'),
    }
  }, async ({ filePath, line, character }) => {
    const defs = await bridge.getTypeDefinition(filePath, line, character)
    const serialized = defs.map(d => {
      if ('uri' in d) {
        return { filePath: d.uri.fsPath, startLine: d.range.start.line, startChar: d.range.start.character, endLine: d.range.end.line, endChar: d.range.end.character }
      }
      return { filePath: d.targetUri.fsPath, startLine: d.targetRange.start.line, startChar: d.targetRange.start.character, endLine: d.targetRange.end.line, endChar: d.targetRange.end.character }
    })
    return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
  })

  // --- Go To Implementation ---
  server.registerTool('go_to_implementation', {
    description: 'Get the implementation location(s) of a symbol at a given position using LSP',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      line: z.number().int().min(0).describe('Line number (0-indexed)'),
      character: z.number().int().min(0).describe('Character position (0-indexed)'),
    }
  }, async ({ filePath, line, character }) => {
    const defs = await bridge.getImplementation(filePath, line, character)
    const serialized = defs.map(d => {
      if ('uri' in d) {
        return { filePath: d.uri.fsPath, startLine: d.range.start.line, startChar: d.range.start.character, endLine: d.range.end.line, endChar: d.range.end.character }
      }
      return { filePath: d.targetUri.fsPath, startLine: d.targetRange.start.line, startChar: d.targetRange.start.character, endLine: d.targetRange.end.line, endChar: d.targetRange.end.character }
    })
    return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
  })

  // --- Get Signature Help ---
  server.registerTool('get_signature_help', {
    description: 'Get parameter hints and signature information for a function call using LSP',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      line: z.number().int().min(0).describe('Line number (0-indexed)'),
      character: z.number().int().min(0).describe('Character position (0-indexed)'),
      triggerCharacter: z.string().optional().describe('The character that triggered the signature help (e.g., ",")'),
    }
  }, async ({ filePath, line, character, triggerCharacter }) => {
    const help = await bridge.getSignatureHelp(filePath, line, character, triggerCharacter)
    if (help == null) return { content: [{ type: 'text', text: JSON.stringify({ activeSignature: 0, activeParameter: 0, signatures: [] }) }] }

    const serialized = {
      activeSignature: help.activeSignature,
      activeParameter: help.activeParameter,
      signatures: help.signatures.map(s => ({
        label: s.label,
        documentation: typeof s.documentation === 'string' ? s.documentation : s.documentation?.value,
        parameters: s.parameters.map(p => ({
          label: typeof p.label === 'string' ? p.label : (Array.isArray(p.label) ? p.label.map(n => n.toString()).join(',') : ''),
          documentation: typeof p.documentation === 'string' ? p.documentation : p.documentation?.value
        }))
      }))
    }
    return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
  })

  // --- Get Completions ---
  server.registerTool('get_completions', {
    description: 'Get IntelliSense completion suggestions at a specific position using LSP',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      line: z.number().int().min(0).describe('Line number (0-indexed)'),
      character: z.number().int().min(0).describe('Character position (0-indexed)'),
      triggerCharacter: z.string().optional().describe('The character that triggered the completion (e.g., ".")'),
    }
  }, async ({ filePath, line, character, triggerCharacter }) => {
    const completions = await bridge.getCompletions(filePath, line, character, triggerCharacter)
    const serialized = completions.items.map(c => ({
      label: typeof c.label === 'string' ? c.label : c.label.label,
      kind: c.kind !== undefined ? c.kind.toString() : 'Unknown',
      detail: c.detail,
      documentation: typeof c.documentation === 'string' ? c.documentation : c.documentation?.value,
    }))
    return { content: [{ type: 'text', text: JSON.stringify({ completions: serialized }) }] }
  })

  // --- Get Hover ---
  server.registerTool('get_hover', {
    description: 'Get hover information (type info, documentation) for a symbol at a given position',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      line: z.number().int().min(0).describe('Line number (0-indexed)'),
      character: z.number().int().min(0).describe('Character position (0-indexed)'),
    }
  }, async ({ filePath, line, character }) => {
    const hovers = await bridge.getHover(filePath, line, character)
    const contents = hovers.flatMap(h => {
      const c = h.contents
      if (Array.isArray(c)) {
        return c.map(item => (typeof item === 'string' ? item : (item as { value: string }).value))
      }
      return [typeof c === 'string' ? c : (c as { value: string }).value]
    })
    return { content: [{ type: 'text', text: JSON.stringify({ contents }) }] }
  })

  // --- Get Document Symbols ---
  server.registerTool('get_document_symbols', {
    description: 'Get all symbols (functions, classes, variables, etc.) in a file',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
    }
  }, async ({ filePath }) => {
    const symbols = await bridge.getDocumentSymbols(filePath)
    const serialized = serializeSymbols(symbols)
    return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
  })

  // --- Search Workspace Symbols ---
  server.registerTool('search_workspace_symbols', {
    description: 'Search for symbols across the entire workspace',
    inputSchema: {
      query: z.string().describe('Symbol name to search for'),
    }
  }, async ({ query }) => {
    const symbols = await bridge.getWorkspaceSymbols(query)
    const serialized = symbols.map(s => ({
      name: s.name,
      kind: symbolKindName(s.kind),
      filePath: s.location.uri.fsPath,
      startLine: s.location.range.start.line,
      containerName: s.containerName,
    }))
    return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
  })

  // --- Get Code Actions ---
  server.registerTool('get_code_actions', {
    description: 'Get available code actions (quick fixes, refactors) for a range in a file',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      startLine: z.number().int().min(0),
      startChar: z.number().int().min(0),
      endLine: z.number().int().min(0),
      endChar: z.number().int().min(0),
    }
  }, async ({ filePath, startLine, startChar, endLine, endChar }) => {
    const actions = await bridge.getCodeActions(filePath, startLine, startChar, endLine, endChar)
    interface AnyAction { title: string; kind?: { value: string }; isPreferred?: boolean }
    const serialized = (actions ?? []).map((a, i) => {
      const action = a as AnyAction
      return {
        index: i,
        title: action.title,
        kind: action.kind?.value,
        isPreferred: action.isPreferred ?? false,
      }
    })
    return { content: [{ type: 'text', text: JSON.stringify(serialized) }] }
  })

  // --- Apply Code Action ---
  server.registerTool('apply_code_action', {
    description: 'Apply a code action by index (get index from get_code_actions first)',
    inputSchema: {
      filePath: z.string(),
      startLine: z.number().int().min(0),
      startChar: z.number().int().min(0),
      endLine: z.number().int().min(0),
      endChar: z.number().int().min(0),
      actionIndex: z.number().int().min(0).describe('Index from get_code_actions result'),
    }
  }, async ({ filePath, startLine, startChar, endLine, endChar, actionIndex }) => {
    const actions = await bridge.getCodeActions(filePath, startLine, startChar, endLine, endChar)
    const action = actions?.at(actionIndex)

    if (action == null) throw new Error(`No code action at index ${String(actionIndex)}`)

    let applied = false
    if ('edit' in action) {
      const edit = action.edit
      if (edit) {
        await import('vscode').then(vscode => vscode.workspace.applyEdit(edit))
        applied = true
      }
    }
    if (!applied && 'command' in action && action.command) {
      const cmd = typeof action.command === 'string' ? action.command : action.command.command
      await import('vscode').then(vscode => vscode.commands.executeCommand(cmd))
      applied = true
    }

    return { content: [{ type: 'text', text: JSON.stringify({ applied, title: 'title' in action ? action.title : '' }) }] }
  })

  // --- Rename Symbol ---
  server.registerTool('rename_symbol', {
    description: 'Rename a symbol and all its references across the workspace',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      line: z.number().int().min(0).describe('Line number (0-indexed)'),
      character: z.number().int().min(0).describe('Character position (0-indexed)'),
      newName: z.string().describe('The new name for the symbol'),
    }
  },
    async ({ filePath, line, character, newName }) => {
      const edit = await bridge.getRenameEdits(filePath, line, character, newName)
      if (edit == null) throw new Error('Rename not supported at this position')
      const vscode = await import('vscode')
      await vscode.workspace.applyEdit(edit)
      const filesChanged = new Set(edit.entries().map(([uri]) => uri.fsPath)).size
      const editsApplied = edit.entries().reduce((sum, [, edits]) => sum + edits.length, 0)
      return { content: [{ type: 'text', text: `Applied ${String(editsApplied)} edits across ${String(filesChanged)} files` }] }
    }
  )

  // --- Workspace Info ---
  server.registerTool('get_workspace_info', {
    description: 'Get information about the current VS Code workspace',
    inputSchema: {}
  },
    () => {
      const info = bridge.getWorkspaceInfo()
      return { content: [{ type: 'text', text: JSON.stringify(info) }] }
    })

  // --- Execute VS Code Command ---
  server.registerTool('execute_vscode_command', {
    description: 'Execute any VS Code command. Requires the command to be in the allowedCommands setting.',
    inputSchema: {
      command: z.string().describe('The VS Code command ID to execute'),
      args: z.array(z.unknown()).optional().default([]).describe('Arguments to pass to the command'),
    }
  }, async ({ command, args }) => {
    const allowedCommands = settings.get('allowedCommands') as string[]
    const result = await bridge.executeCommand(command, args, allowedCommands)
    return { content: [{ type: 'text', text: JSON.stringify({ result }) }] }
  })

  // --- Managed Terminals (long-running processes) ---

  server.registerTool('spawn_terminal', {
    description: 'Spawn a long-running process (dev server, watch mode, etc.) in a VS Code terminal with output capture. Use run_terminal_command for short-lived commands instead.',
    inputSchema: {
      name: z.string().describe('Display name for the terminal (e.g. "dev-server", "tests-watch")'),
      command: z.string().optional().describe('Command to run immediately (e.g. "npm run dev"). Omit to just open a shell.'),
      cwd: z.string().optional().describe('Working directory (defaults to workspace root)'),
    }
  }, logged('spawn_terminal', ({ name, command, cwd }) => {
    const result = terminalManager.spawn(name, command, cwd)
    return { content: [{ type: 'text', text: JSON.stringify(result) }] }
  }))

  server.registerTool('list_terminals', {
    description: 'List all managed terminals and their status (alive/dead, log size)',
    inputSchema: {}
  }, logged('list_terminals', () => {
    const terminals = terminalManager.list()
    return { content: [{ type: 'text', text: JSON.stringify(terminals) }] }
  }))

  server.registerTool('read_terminal', {
    description: 'Read recent output from a managed terminal. Returns the tail of the output buffer.',
    inputSchema: {
      id: z.string().describe('Terminal ID (from spawn_terminal or list_terminals)'),
      lines: z.number().int().min(1).optional().describe('Number of lines to return from the end (default: all buffered output)'),
    }
  }, logged('read_terminal', ({ id, lines }) => {
    const result = terminalManager.readOutput(id, lines)
    if (!result) throw new Error(`Terminal '${id}' not found`)
    return { content: [{ type: 'text', text: JSON.stringify(result) }] }
  }))

  server.registerTool('write_terminal', {
    description: 'Send input/text to a managed terminal (e.g. answer a prompt, send a command)',
    inputSchema: {
      id: z.string().describe('Terminal ID'),
      input: z.string().describe('Text to send to the terminal stdin'),
      addNewline: z.boolean().optional().default(true).describe('Append a newline after the input (default: true). Set to false for interactive prompts where the process reads the input directly.'),
    }
  }, logged('write_terminal', ({ id, input, addNewline }) => {
    const ok = terminalManager.write(id, input, addNewline)
    if (!ok) throw new Error(`Terminal '${id}' not found or not alive`)
    return { content: [{ type: 'text', text: JSON.stringify({ sent: true }) }] }
  }))

  server.registerTool('kill_terminal', {
    description: 'Kill a managed terminal and its process',
    inputSchema: {
      id: z.string().describe('Terminal ID'),
    }
  }, logged('kill_terminal', ({ id }) => {
    const ok = terminalManager.kill(id)
    if (!ok) throw new Error(`Terminal '${id}' not found`)
    return { content: [{ type: 'text', text: JSON.stringify({ killed: true }) }] }
  }))

  // --- Git Tools ---
  server.registerTool('git_action', {
    description: 'Execute common Git operations directly',
    inputSchema: {
      operation: z.enum(['commit', 'checkout', 'branch', 'status']).describe('The git operation to perform'),
      branchName: z.string().optional().describe('Target branch for checkout or branch commands'),
      commitMessage: z.string().optional().describe('Message for commit command'),
    }
  }, ({ operation, branchName, commitMessage }) => {
    const result = bridge.gitAction(operation, branchName, commitMessage)
    return { content: [{ type: 'text', text: JSON.stringify(result) }] }
  })

  // --- Editor Control ---
  server.registerTool('add_editor_decoration', {
    description: 'Highlight specific lines or ranges in the active editor to provide visual feedback',
    inputSchema: {
      filePath: z.string().describe('Absolute path to the file'),
      startLine: z.number().int().min(0).describe('0-indexed start line'),
      endLine: z.number().int().min(0).describe('0-indexed end line'),
      color: z.string().optional().describe("CSS color name or hex code. Defaults to 'rgba(255, 255, 0, 0.3)'"),
    }
  }, ({ filePath, startLine, endLine, color }) => {
    const success = bridge.addEditorDecoration(filePath, startLine, endLine, color)
    return { content: [{ type: 'text', text: JSON.stringify({ success }) }] }
  })
}
