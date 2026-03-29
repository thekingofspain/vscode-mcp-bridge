# Refactoring Progress

## ✅ Phase 1: Foundation (COMPLETE)

### Completed Tasks

1. **Created new directory structure**
   ```
   src/
   ├── vscode-api/              # VS Code API infrastructure layer
   │   ├── workspace/
   │   ├── window/
   │   ├── languages/
   │   └── commands/
   └── commands/                # MCP-exposed commands (one folder per tool)
       ├── get-active-file/
       ├── get-selection/
       ├── read-file/
       └── ... (37 folders total)
   ```

2. **Installed dependencies**
   - `js-yaml` + `@types/js-yaml` - YAML parsing
   - `ts-node` - TypeScript execution for scripts

3. **Created code generation script**
   - `scripts/generate-commands.ts` - Reads YAML, generates TypeScript

4. **Added npm script**
   - `npm run generate:commands` - Run code generation

5. **Created vscode-api infrastructure**
   - `src/vscode-api/workspace/documents.ts` - `getActiveFileSnapshot()`
   - `src/vscode-api/index.ts` - Public API exports

---

## ✅ Phase 2: Migrate All Commands (COMPLETE)

### Command Migration Status

| Category | Tool | Status | Notes |
|----------|------|--------|-------|
| **Files** | get_active_file | ✅ Done | |
| | get_selection | ✅ Done | |
| | get_open_tabs | ✅ Done | |
| | read_file | ✅ Done | |
| | write_file | ✅ Done | |
| | create_file | ✅ Done | |
| | delete_file | ✅ Done | |
| | open_file | ✅ Done | |
| | close_file | ✅ Done | |
| **Editor** | show_diff | ✅ Done | |
| | show_message | ✅ Done | |
| | show_quick_pick | ✅ Done | |
| | request_input | ✅ Done | |
| | add_editor_decoration | ✅ Done | |
| **LSP** | get_diagnostics | ✅ Done | |
| | get_repo_map | ✅ Done | |
| | find_references | ✅ Done | |
| | go_to_definition | ✅ Done | |
| | go_to_type_definition | ✅ Done | |
| | go_to_implementation | ✅ Done | |
| | get_signature_help | ✅ Done | |
| | get_completions | ✅ Done | |
| | get_hover | ✅ Done | |
| | get_document_symbols | ✅ Done | |
| | search_workspace_symbols | ✅ Done | |
| | get_code_actions | ✅ Done | |
| | apply_code_action | ✅ Done | |
| | rename_symbol | ✅ Done | |
| **Terminal** | run_terminal_command | ✅ Done | |
| | spawn_terminal | ✅ Done | |
| | list_terminals | ✅ Done | |
| | read_terminal | ✅ Done | |
| | write_terminal | ✅ Done | |
| | kill_terminal | ✅ Done | |
| **Git** | git_action | ✅ Done | |
| **Workspace** | get_workspace_info | ✅ Done | |
| | execute_vscode_command | ✅ Done | |

**Total: 37/37 commands migrated**

### Deliverables per Command

Each command module contains:
- `definition.yaml` - Source of truth (YAML schema)
- `handler.ts` - Business logic implementation
- `schema.ts` - Auto-generated Zod schema
- `index.ts` - Auto-generated exports

### Auto-Generated Registry

- `src/mcp/tools/registry.ts` - Auto-generated from all `definition.yaml` files
- Run: `npm run generate:commands` to regenerate

---

## 📋 Next Steps

### Remaining Work (Phase 3)

| Task | Status | Notes |
|------|--------|-------|
| Extract `extension/` layer | ❌ Pending | Split `extension.ts` into submodules |
| Create `extension/commands.ts` | ❌ Pending | VS Code command registrations |
| Create `extension/statusbar.ts` | ❌ Pending | Status bar UI management |
| Create `extension/lifecycle.ts` | ❌ Pending | Startup/shutdown orchestration |
| Extract `DiffService` | ❌ Pending | Currently in `show-diff/handler.ts` |
| Delete legacy files | ✅ Done | `src/bridge/` already removed |

---

## Architecture Reference

### Command Module Structure

```
src/commands/<tool-name>/
├── definition.yaml       # Source of truth
├── handler.ts            # Business logic (hand-written)
├── schema.ts             # Zod schemas (auto-generated)
└── index.ts              # Exports (auto-generated)
```

### YAML Definition Format

```yaml
tool: get_active_file
description: Get the currently active/open file in VS Code
category: editor
version: 1.0.0
stability: stable

input: {}

output:
  type: object
  properties:
    path: string
    content: string

handler:
  module: handler.ts
  function: execute

examples:
  - name: Get current file
    input: {}
```

### Handler Pattern

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getActiveFileSnapshot } from '../../vscode-api/workspace/documents.js'

export async function execute(): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const snapshot = getActiveFileSnapshot()
  if (!snapshot) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'No active file' }) }] }
  }
  return { content: [{ type: 'text', text: JSON.stringify(snapshot) }] }
}

export function registerGetActiveFile(server: McpServer): void {
  server.registerTool('get_active_file', {
    description: 'Get the currently active/open file in VS Code',
    inputSchema: {}
  }, execute)
}
```

### Dependency Flow

```
extension.ts
    ↓
mcp/server/HttpServer.ts
    ↓
mcp/tools/registry.ts (auto-generated)
    ↓
commands/get-active-file/handler.ts
    ↓
vscode-api/workspace/documents.ts
    ↓
vscode.window.activeTextEditor
```

---

## Testing Checklist

- [x] Run `npm run generate:commands` - generates without errors
- [x] Run `npm run typecheck` - passes
- [x] Run `npm run lint` - passes
- [x] Run `npm run build` - succeeds

---

## Notes

- Legacy `src/bridge/VsCodeBridge.ts` - **Deleted** (no longer needed)
- Legacy `src/tools/index.ts` - **Deleted** (replaced by `src/mcp/tools/registry.ts`)
- Each command module is self-contained with its own YAML definition
- The `vscode-api/` layer provides clean abstraction over VS Code APIs
- Remaining work: Extract extension layer from monolithic `extension.ts`
