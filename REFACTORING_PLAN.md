# MCP Bridge Codebase Refactoring Plan

> **⚠️ HISTORICAL DOCUMENT** - This plan was partially implemented with modifications. See [REFACTORING_PROGRESS.md](./REFACTORING_PROGRESS.md) for actual implementation status.

## Overview

This document outlines a comprehensive refactoring plan combining:
- **Plan A**: Extension Interface Layer (VS Code vs MCP separation)
- **Plan B**: API Owner + Feature Modules (by domain/function)

The hybrid approach provides clear ownership boundaries while maintaining feature cohesion.

---

## Implementation Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Foundation | ✅ Complete | Directory structure, code gen, YAML pipeline |
| Phase 2: Bridge Layer | ✅ Complete | Implemented as `src/vscode-api/` instead of `src/bridge/` |
| Phase 2: Command Migration | ✅ Complete | All 37 commands migrated to YAML-driven modules |
| Phase 3: Extension Layer | ❌ Not started | `extension.ts` still monolithic |
| Phase 4: MCP Layer + YAML | ✅ Complete | `src/mcp/tools/registry.ts` auto-generated |
| Phase 5: Services + Cleanup | ⏳ Partial | ContextPusher/TerminalManager in `services/`, DiffService not extracted |

---

## Architecture Actually Implemented

The actual implementation diverged from this plan in the following ways:

| Plan Proposed | Actual Implementation |
|--------------|----------------------|
| `src/bridge/` directory | `src/vscode-api/` directory |
| `src/mcp/tools/definitions/*.yaml` | `src/commands/*/definition.yaml` (per-command folders) |
| `src/mcp/tools/handlers/*.ts` (category-based) | `src/commands/*/handler.ts` (one per tool) |
| `src/tools/index.ts` | `src/mcp/tools/registry.ts` |

---

## Design Principles

| Principle | Description |
|-----------|-------------|
| **API Ownership** | Clear separation: VS Code API ↔ MCP SDK ↔ Extension Lifecycle |
| **Feature Cohesion** | Related functionality grouped by domain (files, editor, LSP, terminal, git) |
| **Declarative Definitions** | Tool schemas in YAML, generated at compile time |
| **Single Responsibility** | Each file <200 lines, one purpose |
| **Testability** | Mockable boundaries, isolated handlers |

---

## Proposed Architecture

### Three-Layer Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTENSION LAYER                              │
│  (VS Code Extension Lifecycle, UI, Commands, Status Bar)        │
├─────────────────────────────────────────────────────────────────┤
│                      MCP LAYER                                  │
│  (MCP Protocol, HTTP Server, Tool Registration, Transport)      │
├─────────────────────────────────────────────────────────────────┤
│                    BRIDGE LAYER                                 │
│  (VS Code API Abstraction - owned by VS Code API surface)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure (Combined Plan A + B)

```
src/
│
├── extension/                    # EXTENSION LAYER
│   ├── extension.ts              # Entry point, activate/deactivate
│   ├── commands.ts               # VS Code command registrations
│   ├── statusbar.ts              # Status bar UI management
│   └── lifecycle.ts              # Startup/shutdown orchestration
│
├── mcp/                          # MCP LAYER
│   ├── server/
│   │   ├── HttpServer.ts         # HTTP server & transport
│   │   └── session.ts            # Session management
│   │
│   ├── tools/                    # MCP Tool Definitions
│   │   ├── index.ts              # Auto-generated from YAML
│   │   ├── registry.ts           # Tool registration logic
│   │   │
│   │   ├── definitions/          # YAML Source of Truth
│   │   │   ├── 01-files.yaml
│   │   │   ├── 02-editor.yaml
│   │   │   ├── 03-lsp.yaml
│   │   │   ├── 04-terminal.yaml
│   │   │   └── 05-git.yaml
│   │   │
│   │   └── handlers/             # Hand-written implementations
│   │       ├── files.ts
│   │       ├── editor.ts
│   │       ├── lsp.ts
│   │       ├── terminal.ts
│   │       └── git.ts
│   │
│   └── protocol/                 # MCP Protocol Abstractions
│       ├── notifications.ts      # Server→Client notifications
│       └── resources.ts          # MCP resources (if needed)
│
├── bridge/                       # BRIDGE LAYER (VS Code API Owner)
│   ├── index.ts                  # Facade - re-exports all modules
│   │
│   ├── workspace/                # vscode.workspace.* APIs
│   │   ├── documents.ts          # Text documents, file operations
│   │   ├── diagnostics.ts        # LSP diagnostics
│   │   ├── symbols.ts            # Workspace symbols, repo map
│   │   ├── filesystem.ts         # File system operations
│   │   └── config.ts             # Configuration/settings access
│   │
│   ├── window/                   # vscode.window.* APIs
│   │   ├── editors.ts            # Active editor, selections, tabs
│   │   ├── terminals.ts          # Terminal creation, shell integration
│   │   ├── ui.ts                 # Messages, quick picks, input boxes
│   │   └── decorations.ts        # Editor decorations
│   │
│   ├── languages/                # vscode.languages.* APIs
│   │   ├── references.ts         # Find references
│   │   ├── definitions.ts        # Go to definition/implementation
│   │   ├── completions.ts        # IntelliSense completions
│   │   ├── hover.ts              # Hover information
│   │   ├── signature.ts          # Signature help
│   │   └── codeactions.ts        # Code actions, refactors
│   │
│   ├── commands/                 # vscode.commands.* APIs
│   │   ├── execute.ts            # Command execution wrapper
│   │   └── git.ts                # Git extension API access
│   │
│   └── VsCodeBridge.ts           # Legacy facade (deprecated, keep for transition)
│
├── services/                     # CROSS-CUTTING BUSINESS LOGIC
│   ├── ContextPusher.ts          # Context event pushing (uses bridge)
│   ├── TerminalManager.ts        # Long-running terminal management
│   └── DiffService.ts            # Diff preview orchestration
│
├── config/
│   └── Settings.ts               # VS Code settings wrapper (uses bridge/workspace/config)
│
├── types/
│   ├── git.d.ts                  # Git extension types
│   ├── bridge.ts                 # Shared bridge type definitions
│   └── tools.ts                  # Tool handler types
│
├── utils/
│   ├── logger.ts                 # Logging utility
│   └── helpers.ts                # Common utilities
│
└── scripts/                      # BUILD-TIME TOOLING
    └── generate-tools.ts         # YAML → TypeScript generator
```

---

## Layer Responsibilities

### Extension Layer (`src/extension/`)

**Owner**: VS Code Extension API

| File | Responsibility |
|------|----------------|
| `extension.ts` | Extension entry point, minimal bootstrap |
| `commands.ts` | Register VS Code commands (`mcpServer.start`, etc.) |
| `statusbar.ts` | Status bar item UI, updates |
| `lifecycle.ts` | Activation, deactivation, state management |

**Does NOT contain**:
- MCP protocol logic
- VS Code API calls directly (uses bridge layer)
- Business logic

---

### MCP Layer (`src/mcp/`)

**Owner**: MCP SDK / Protocol

| Subdirectory | Responsibility |
|--------------|----------------|
| `server/` | HTTP server, StreamableHTTP transport, sessions |
| `tools/definitions/` | YAML tool schemas (SOURCE OF TRUTH) |
| `tools/handlers/` | Tool implementation (calls bridge layer) |
| `tools/index.ts` | Auto-generated tool registration |
| `protocol/` | MCP notifications, resources, prompts |

**Key Pattern**: Handlers receive typed args, call bridge, return MCP-formatted response.

```typescript
// src/mcp/tools/handlers/files.ts
export async function readFile(
  args: { filePath: string; startLine?: number; endLine?: number },
  bridge: Bridge
): Promise<McpResponse> {
  const result = await bridge.workspace.documents.readFile(args.filePath, args.startLine, args.endLine)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
}
```

---

### Bridge Layer (`src/bridge/`)

**Owner**: VS Code API Surface Area

This is the **core abstraction** - wraps VS Code APIs into testable, mockable modules.

| Subdirectory | VS Code API | Functions |
|--------------|-------------|-----------|
| `workspace/documents.ts` | `vscode.workspace.textDocuments`, `openTextDocument` | `getActiveFile()`, `readFile()`, `openFile()`, `closeFile()` |
| `workspace/diagnostics.ts` | `vscode.languages.getDiagnostics()` | `getDiagnostics()` |
| `workspace/symbols.ts` | `vscode.executeWorkspaceSymbolProvider` | `getRepoMap()`, `getWorkspaceSymbols()` |
| `workspace/filesystem.ts` | `vscode.workspace.fs`, `applyEdit` | `writeFile()`, `deleteFile()`, `createFile()` |
| `window/editors.ts` | `vscode.window.activeTextEditor`, `tabGroups` | `getSelection()`, `getOpenTabs()` |
| `window/terminals.ts` | `vscode.window.createTerminal`, `onDidEndTerminalShellExecution` | `runCommand()`, `createTerminal()` |
| `window/ui.ts` | `vscode.window.show*Message`, `showQuickPick` | `showMessage()`, `showQuickPick()`, `requestInput()` |
| `window/decorations.ts` | `vscode.window.createTextEditorDecorationType` | `addDecoration()` |
| `languages/references.ts` | `vscode.executeReferenceProvider` | `getReferences()` |
| `languages/definitions.ts` | `vscode.executeDefinitionProvider` | `getDefinition()`, `getTypeDefinition()`, `getImplementation()` |
| `languages/completions.ts` | `vscode.executeCompletionItemProvider` | `getCompletions()` |
| `languages/hover.ts` | `vscode.executeHoverProvider` | `getHover()` |
| `languages/signature.ts` | `vscode.executeSignatureHelpProvider` | `getSignatureHelp()` |
| `languages/codeactions.ts` | `vscode.executeCodeActionProvider` | `getCodeActions()`, `applyCodeAction()` |
| `commands/execute.ts` | `vscode.commands.executeCommand` | `executeCommand()` |
| `commands/git.ts` | `vscode.extensions.getExtension('vscode.git')` | `getGitAPI()`, `gitAction()` |

**Key Pattern**: Each module exports pure functions that call VS Code APIs directly.

```typescript
// src/bridge/workspace/documents.ts
import * as vscode from 'vscode'

export function getActiveFileSnapshot(): ActiveFileSnapshot | null {
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

export async function readFile(
  filePath: string,
  startLine?: number,
  endLine?: number
): Promise<{ content: string; exists: boolean }> {
  try {
    const doc = await vscode.workspace.openTextDocument(filePath)
    const allLines = doc.getText().split('\n')
    
    const sliced = startLine !== undefined && endLine !== undefined
      ? allLines.slice(startLine, endLine + 1)
      : allLines
    
    return { content: sliced.join('\n'), exists: true }
  } catch {
    return { content: '', exists: false }
  }
}
```

---

## YAML Tool Definition Format

### Schema

```yaml
# src/mcp/tools/definitions/01-files.yaml

---
tool: read_file
description: Read the contents of a file from the file system
category: files
version: 1.0.0
stability: stable

input:
  filePath:
    type: string
    description: Absolute path to the file
    required: true
    examples:
      - "/Users/dev/project/src/index.ts"
  startLine:
    type: number
    description: Start line (0-indexed, inclusive)
    required: false
    constraints:
      min: 0
    examples:
      - 10
  endLine:
    type: number
    description: End line (0-indexed, inclusive)
    required: false
    constraints:
      min: 0
    examples:
      - 20

output:
  type: object
  schema:
    content: string
    path: string
    exists: boolean

handler:
  module: handlers/files.ts
  function: readFile
  bridge:
    - workspace/documents.readFile

examples:
  - name: Read entire file
    description: Read all content from a file
    input:
      filePath: /path/to/file.ts
    output:
      content: "// File content..."
      path: "/path/to/file.ts"
      exists: true
      
  - name: Read specific lines
    description: Read lines 10-20 from a file
    input:
      filePath: /path/to/file.ts
      startLine: 10
      endLine: 20

metadata:
  created: 2024-01-15
  lastUpdated: 2025-03-28
  author: @jhamama
  relatedTools:
    - write_file
    - open_file
```

---

## Code Generation Script

### `scripts/generate-tools.ts`

```typescript
/**
 * Code Generation Script: YAML → TypeScript Tool Registration
 * 
 * Reads: src/mcp/tools/definitions/*.yaml
 * Writes: src/mcp/tools/index.ts (auto-generated)
 * 
 * Run: npm run generate:tools
 */

import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

interface ToolDefinition {
  tool: string
  description: string
  category: string
  version: string
  stability: 'stable' | 'experimental' | 'deprecated'
  input: Record<string, InputField>
  output?: OutputDefinition
  handler: {
    module: string
    function: string
    bridge: string[]
  }
  examples?: Example[]
  metadata?: {
    created: string
    lastUpdated: string
    author: string
    relatedTools: string[]
  }
}

interface InputField {
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array'
  description: string
  required: boolean
  default?: unknown
  values?: string[]  // for enum
  constraints?: { min?: number; max?: number }
  examples?: unknown[]
}

function generateZodSchema(input: Record<string, InputField>): string {
  const lines: string[] = []
  
  for (const [name, field] of Object.entries(input)) {
    let schema = `z.${field.type}()`
    
    if (field.type === 'enum' && field.values) {
      schema = `z.enum([${field.values.map(v => `'${v}'`).join(', ')}])`
    }
    
    if (field.constraints?.min !== undefined) {
      schema += `.min(${field.constraints.min})`
    }
    
    if (field.constraints?.max !== undefined) {
      schema += `.max(${field.constraints.max})`
    }
    
    if (field.required === false) {
      schema += '.optional()'
      if (field.default !== undefined) {
        schema += `.default(${JSON.stringify(field.default)})`
      }
    }
    
    if (field.description) {
      schema += `.describe('${field.description.replace(/'/g, "\\'")}')`
    }
    
    lines.push(`    ${name}: ${schema}`)
  }
  
  return `{\n${lines.join(',\n')}\n  }`
}

function generateToolRegistration(tool: ToolDefinition): string {
  const { tool: name, description, input, handler } = tool
  const { module: handlerFile, function: handlerFn } = handler
  
  const zodSchema = generateZodSchema(input)
  
  return `
  // ${tool.category.toUpperCase()}: ${name} (${tool.stability})
  server.registerTool('${name}', {
    description: '${description.replace(/'/g, "\\'")}',
    inputSchema: ${zodSchema}
  }, ${handlerFn})
`
}

async function generateToolsIndex(): Promise<void> {
  const definitionsDir = path.join(__dirname, '../src/mcp/tools/definitions')
  const outputPath = path.join(__dirname, '../src/mcp/tools/index.ts')
  
  // Read all YAML files (sorted by prefix for consistent ordering)
  const files = fs.readdirSync(definitionsDir)
    .filter(f => f.endsWith('.yaml'))
    .sort()
  
  const allTools: ToolDefinition[] = []
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(definitionsDir, file), 'utf-8')
    const docs = yaml.loadAll(content) as ToolDefinition[]
    allTools.push(...docs)
  }
  
  // Generate imports grouped by category
  const importsByModule = new Map<string, string[]>()
  for (const tool of allTools) {
    const moduleName = tool.handler.module.replace('.ts', '')
    const fn = tool.handler.function
    if (!importsByModule.has(moduleName)) {
      importsByModule.set(moduleName, [])
    }
    importsByModule.get(moduleName)!.push(fn)
  }
  
  const importLines = Array.from(importsByModule.entries()).map(
    ([mod, fns]) => `import { ${fns.join(', ')} } from './${mod}.js'`
  )
  
  // Generate output
  const output = `// ⚠️ AUTO-GENERATED - DO NOT EDIT MANUALLY\n` +
    `// Source: src/mcp/tools/definitions/*.yaml\n` +
    `// Run: npm run generate:tools\n` +
    `// Generated: ${new Date().toISOString()}\n\n` +
    `import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'\n` +
    `import { z } from 'zod'\n` +
    `import type { Settings } from '../../config/Settings.js'\n` +
    `import type { Bridge } from '../../bridge/index.js'\n` +
    `import type { TerminalManager } from '../../services/TerminalManager.js'\n\n` +
    `${importLines.join('\n')}\n\n` +
    `export function registerTools(\n` +
    `  server: McpServer,\n` +
    `  bridge: Bridge,\n` +
    `  settings: Settings,\n` +
    `  terminalManager: TerminalManager\n` +
    `): void {\n` +
    `  log.info('Tools', 'Registering ${allTools.length} tools')\n\n` +
    allTools.map(t => generateToolRegistration(t)).join('\n') +
    `\n\n  log.info('Tools', 'Tool registration complete')\n` +
    `}\n`
  
  fs.writeFileSync(outputPath, output)
  console.log(`✅ Generated ${allTools.length} tool registrations`)
  
  // Also generate Markdown documentation
  generateDocumentation(allTools)
}

function generateDocumentation(tools: ToolDefinition[]): void {
  const outputDir = path.join(__dirname, '../docs')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // Group by category
  const byCategory = new Map<string, ToolDefinition[]>()
  for (const tool of tools) {
    if (!byCategory.has(tool.category)) {
      byCategory.set(tool.category, [])
    }
    byCategory.get(tool.category)!.push(tool)
  }
  
  // Generate category docs
  for (const [category, categoryTools] of byCategory.entries()) {
    const doc = `# ${category.toUpperCase()} Tools\n\n` +
      `Auto-generated from YAML definitions.\n\n` +
      `| Tool | Description | Stability |\n` +
      `|------|-------------|----------|\n` +
      categoryTools.map(t => `| [\`${t.tool}\`](#${t.tool}) | ${t.description} | ${t.stability} |`).join('\n') +
      `\n\n` +
      categoryTools.map(t => generateToolDoc(t)).join('\n\n---\n\n')
    
    fs.writeFileSync(path.join(outputDir, `${category}-tools.md'), doc)
  }
  
  // Generate index
  const index = `# MCP Tool Reference\n\n` +
    `**Total Tools**: ${tools.length}\n\n` +
    `## By Category\n\n` +
    Array.from(byCategory.entries()).map(
      ([cat, ts]) => `- [${cat.toUpperCase()}](./${cat}-tools.md) (${ts.length} tools)`
    ).join('\n') +
    `\n\n## All Tools\n\n` +
    `| Tool | Category | Description | Stability |\n` +
    `|------|----------|-------------|----------|\n` +
    tools.map(t => `| \`${t.tool}\` | ${t.category} | ${t.description} | ${t.stability} |`).join('\n')
  
  fs.writeFileSync(path.join(outputDir, 'TOOLS.md'), index)
  console.log(`📄 Generated documentation in docs/`)
}

function generateToolDoc(tool: ToolDefinition): string {
  const inputTable = Object.entries(tool.input).map(
    ([name, field]) => `| \`${name}\` | ${field.type} | ${field.required ? 'Required' : 'Optional'} | ${field.description} |`
  ).join('\n')
  
  return `### \`${tool.tool}\`\n\n${tool.description}\n\n` +
    `**Stability**: ${tool.stability}\n\n` +
    `#### Input\n\n` +
    `| Parameter | Type | | Description |\n` +
    `|-----------|------|-|-------------|\n` +
    inputTable +
    `\n\n#### Example\n\n\`\`\`json\n${JSON.stringify(tool.examples?.[0]?.input || {}, null, 2)}\n\`\`\``
}

generateToolsIndex().catch(console.error)
```

---

## Plan Comparison Matrix

| Criteria | Plan A Only | Plan B Only | **Combined (Recommended)** |
|----------|-------------|-------------|---------------------------|
| **Layer Separation** | ✅ Excellent (Extension/MCP/Bridge) | ⚠️ Fair (mixed) | ✅ Excellent (clear 3-layer model) |
| **API Ownership** | ⚠️ Good | ✅ Excellent (by VS Code API surface) | ✅ Excellent (both dimensions) |
| **Feature Cohesion** | ⚠️ Moderate (split by layer only) | ✅ Excellent (domain modules) | ✅ Excellent (both dimensions) |
| **File Size** | ✅ Good | ✅ Good | ✅ Excellent (<100 lines typical) |
| **Discoverability** | ⚠️ Moderate (need to know layer) | ✅ Excellent (by feature name) | ✅ Excellent (both axes) |
| **Testability** | ✅ Good | ✅ Excellent | ✅ Excellent (mockable boundaries) |
| **YAML Integration** | ❌ No | ❌ No | ✅ Yes (declarative tools) |
| **Refactoring Effort** | ⚠️ Medium | ❌ High | ❌ High (but one-time) |
| **Long-term Maintainability** | ✅ Good | ✅ Good | ✅ Excellent |
| **Onboarding New Devs** | ⚠️ Moderate | ✅ Good | ✅ Excellent (clear mental model) |

---

## Migration Phases

### Phase 1: Foundation (Week 1-2)

| Task | Files | Priority |
|------|-------|----------|
| Create new directory structure | All | 🔴 Critical |
| Set up YAML parsing (`js-yaml`) | package.json | 🔴 Critical |
| Write code generation script | `scripts/generate-tools.ts` | 🔴 Critical |
| Create type definitions | `src/types/bridge.ts` | 🔴 Critical |
| Add npm scripts | `package.json` | 🟡 High |

**Exit Criteria**: `npm run generate:tools` works with sample YAML

---

### Phase 2: Bridge Layer Extraction (Week 3-4)

| Module | Source | Target | Functions |
|--------|--------|--------|-----------|
| `bridge/workspace/documents.ts` | VsCodeBridge.ts | New | `getActiveFileSnapshot()`, `readFile()`, `openFile()`, `closeFile()` |
| `bridge/workspace/diagnostics.ts` | VsCodeBridge.ts | New | `getDiagnostics()` |
| `bridge/workspace/symbols.ts` | VsCodeBridge.ts | New | `getRepoMap()`, `getWorkspaceSymbols()` |
| `bridge/workspace/filesystem.ts` | VsCodeBridge.ts | New | `writeFile()`, `deleteFile()`, `createFile()` |
| `bridge/window/editors.ts` | VsCodeBridge.ts | New | `getSelectionSnapshot()`, `getOpenTabs()` |
| `bridge/window/terminals.ts` | VsCodeBridge.ts | New | `runCommand()` |
| `bridge/window/ui.ts` | VsCodeBridge.ts | New | `showMessage()`, `showQuickPick()`, `requestInput()` |
| `bridge/window/decorations.ts` | VsCodeBridge.ts | New | `addEditorDecoration()` |
| `bridge/languages/references.ts` | VsCodeBridge.ts | New | `getReferences()` |
| `bridge/languages/definitions.ts` | VsCodeBridge.ts | New | `getDefinition()`, `getTypeDefinition()`, `getImplementation()` |
| `bridge/languages/completions.ts` | VsCodeBridge.ts | New | `getCompletions()` |
| `bridge/languages/hover.ts` | VsCodeBridge.ts | New | `getHover()` |
| `bridge/languages/signature.ts` | VsCodeBridge.ts | New | `getSignatureHelp()` |
| `bridge/languages/codeactions.ts` | VsCodeBridge.ts | New | `getCodeActions()`, `applyCodeAction()` |
| `bridge/commands/execute.ts` | VsCodeBridge.ts | New | `executeCommand()` |
| `bridge/commands/git.ts` | VsCodeBridge.ts | New | `gitAction()` |

**Exit Criteria**: `VsCodeBridge.ts` reduced to 50-line facade, all tests pass

---

### Phase 3: Extension Layer (Week 5)

| Task | Source | Target |
|------|--------|--------|
| Create `extension/commands.ts` | `extension.ts` | New |
| Create `extension/statusbar.ts` | `extension.ts` | New |
| Create `extension/lifecycle.ts` | `extension.ts` | New |
| Reduce `extension.ts` | Current | <50 lines |

**Exit Criteria**: Extension layer cleanly separated, no MCP logic

---

### Phase 4: MCP Layer + YAML Migration (Week 6-7)

| Task | Files | Notes |
|------|-------|-------|
| Create YAML for all 33 tools | `mcp/tools/definitions/*.yaml` | See Appendix A |
| Create handler modules | `mcp/tools/handlers/*.ts` | One per category |
| Run code generator | `npm run generate:tools` | Produces `index.ts` |
| Delete old `tools/index.ts` | Remove | Replaced by generated |
| Update imports | Throughout | Point to new structure |

**Exit Criteria**: All tools working, YAML is source of truth

---

### Phase 5: Services + Cleanup (Week 8)

| Task | Source | Target |
|------|--------|--------|
| Extract `DiffService` | `VsCodeBridge.ts` | `services/DiffService.ts` |
| Move `ContextPusher` | `src/context/` | `services/ContextPusher.ts` |
| Move `TerminalManager` | `src/terminal/` | `services/TerminalManager.ts` |
| Delete legacy files | `src/bridge/VsCodeBridge.ts` | Keep only facade |
| Update documentation | README.md | Reflect new structure |

**Exit Criteria**: Clean structure, all tests passing, docs updated

---

## Tool Inventory by Category

### Files (9 tools)

| Tool | Handler | Bridge Module |
|------|---------|---------------|
| `get_active_file` | `handlers/files.ts` | `bridge/window/editors.ts` |
| `get_selection` | `handlers/files.ts` | `bridge/window/editors.ts` |
| `get_open_tabs` | `handlers/files.ts` | `bridge/window/editors.ts` |
| `read_file` | `handlers/files.ts` | `bridge/workspace/documents.ts` |
| `write_file` | `handlers/files.ts` | `bridge/workspace/filesystem.ts` |
| `create_file` | `handlers/files.ts` | `bridge/workspace/filesystem.ts` |
| `delete_file` | `handlers/files.ts` | `bridge/workspace/filesystem.ts` |
| `open_file` | `handlers/files.ts` | `bridge/workspace/documents.ts` |
| `close_file` | `handlers/files.ts` | `bridge/workspace/documents.ts` |

### Editor (5 tools)

| Tool | Handler | Bridge Module |
|------|---------|---------------|
| `show_diff` | `handlers/editor.ts` | `services/DiffService.ts` |
| `show_message` | `handlers/editor.ts` | `bridge/window/ui.ts` |
| `show_quick_pick` | `handlers/editor.ts` | `bridge/window/ui.ts` |
| `request_input` | `handlers/editor.ts` | `bridge/window/ui.ts` |
| `add_editor_decoration` | `handlers/editor.ts` | `bridge/window/decorations.ts` |

### LSP (12 tools)

| Tool | Handler | Bridge Module |
|------|---------|---------------|
| `get_diagnostics` | `handlers/lsp.ts` | `bridge/workspace/diagnostics.ts` |
| `get_repo_map` | `handlers/lsp.ts` | `bridge/workspace/symbols.ts` |
| `find_references` | `handlers/lsp.ts` | `bridge/languages/references.ts` |
| `go_to_definition` | `handlers/lsp.ts` | `bridge/languages/definitions.ts` |
| `go_to_type_definition` | `handlers/lsp.ts` | `bridge/languages/definitions.ts` |
| `go_to_implementation` | `handlers/lsp.ts` | `bridge/languages/definitions.ts` |
| `get_signature_help` | `handlers/lsp.ts` | `bridge/languages/signature.ts` |
| `get_completions` | `handlers/lsp.ts` | `bridge/languages/completions.ts` |
| `get_hover` | `handlers/lsp.ts` | `bridge/languages/hover.ts` |
| `get_document_symbols` | `handlers/lsp.ts` | `bridge/workspace/symbols.ts` |
| `search_workspace_symbols` | `handlers/lsp.ts` | `bridge/workspace/symbols.ts` |
| `get_code_actions` | `handlers/lsp.ts` | `bridge/languages/codeactions.ts` |
| `apply_code_action` | `handlers/lsp.ts` | `bridge/languages/codeactions.ts` |
| `rename_symbol` | `handlers/lsp.ts` | `bridge/languages/references.ts` |

### Terminal (6 tools)

| Tool | Handler | Bridge Module |
|------|---------|---------------|
| `run_terminal_command` | `handlers/terminal.ts` | `bridge/window/terminals.ts` |
| `spawn_terminal` | `handlers/terminal.ts` | `services/TerminalManager.ts` |
| `list_terminals` | `handlers/terminal.ts` | `services/TerminalManager.ts` |
| `read_terminal` | `handlers/terminal.ts` | `services/TerminalManager.ts` |
| `write_terminal` | `handlers/terminal.ts` | `services/TerminalManager.ts` |
| `kill_terminal` | `handlers/terminal.ts` | `services/TerminalManager.ts` |

### Git (1 tool)

| Tool | Handler | Bridge Module |
|------|---------|---------------|
| `git_action` | `handlers/git.ts` | `bridge/commands/git.ts` |

**Total: 33 tools**

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Code generation bugs | High | Add validation, test generator output |
| YAML schema drift | Medium | Schema validation in generator |
| Import path confusion | Medium | Use TypeScript path aliases |
| Team learning curve | Low | Documentation, pair programming |
| Regression bugs | High | Comprehensive test suite before refactor |

---

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Largest file | 608 lines | <200 lines |
| Files >300 lines | 2 | 0 |
| Tool definition time | 30+ min | <10 min (YAML only) |
| New tool onboarding | Code search | Read YAML index |
| Test coverage | ~40% | >70% |
| Build time | ~5s | <10s (with generation) |

---

## Next Steps

1. **Review this plan** - Confirm structure matches your vision
2. **Create feature branch** - `refactor/layered-architecture`
3. **Start with Phase 1** - Foundation + code generation
4. **Iterate** - Adjust structure as needed during implementation
