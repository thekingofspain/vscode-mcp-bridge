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
       └── ... (40 folders total)
   ```

2. **Installed dependencies**
   - `js-yaml` + `@types/js-yaml` - YAML parsing
   - `ts-node` - TypeScript execution for scripts

3. **Created code generation script**
   - `scripts/generate-commands.ts` - Reads YAML, generates TypeScript

4. **Added npm script**
   - `npm run generate:commands` - Run code generation

5. **Created first command module (template)**
   - `src/commands/get-active-file/definition.yaml`
   - `src/commands/get-active-file/handler.ts`
   - `src/commands/get-active-file/schema.ts` (auto-generated)
   - `src/commands/get-active-file/index.ts` (auto-generated)

6. **Created vscode-api infrastructure**
   - `src/vscode-api/workspace/documents.ts` - `getActiveFileSnapshot()`
   - `src/vscode-api/index.ts` - Public API exports

---

## 🔄 Phase 2: Migrate All Commands (IN PROGRESS)

### Command Migration Status

| Category | Tool | Status | Notes |
|----------|------|--------|-------|
| **Files** | get_active_file | ✅ Done | Template module |
| | get_selection | ⏳ Pending | |
| | get_open_tabs | ⏳ Pending | |
| | read_file | ⏳ Pending | |
| | write_file | ⏳ Pending | |
| | create_file | ⏳ Pending | |
| | delete_file | ⏳ Pending | |
| | open_file | ⏳ Pending | |
| | close_file | ⏳ Pending | |
| **Editor** | show_diff | ⏳ Pending | |
| | show_message | ⏳ Pending | |
| | show_quick_pick | ⏳ Pending | |
| | request_input | ⏳ Pending | |
| | add_editor_decoration | ⏳ Pending | |
| **LSP** | get_diagnostics | ⏳ Pending | |
| | get_repo_map | ⏳ Pending | |
| | find_references | ⏳ Pending | |
| | go_to_definition | ⏳ Pending | |
| | go_to_type_definition | ⏳ Pending | |
| | go_to_implementation | ⏳ Pending | |
| | get_signature_help | ⏳ Pending | |
| | get_completions | ⏳ Pending | |
| | get_hover | ⏳ Pending | |
| | get_document_symbols | ⏳ Pending | |
| | search_workspace_symbols | ⏳ Pending | |
| | get_code_actions | ⏳ Pending | |
| | apply_code_action | ⏳ Pending | |
| | rename_symbol | ⏳ Pending | |
| **Terminal** | run_terminal_command | ⏳ Pending | |
| | spawn_terminal | ⏳ Pending | |
| | list_terminals | ⏳ Pending | |
| | read_terminal | ⏳ Pending | |
| | write_terminal | ⏳ Pending | |
| | kill_terminal | ⏳ Pending | |
| **Git** | git_action | ⏳ Pending | |
| **Workspace** | get_workspace_info | ⏳ Pending | |
| | execute_vscode_command | ⏳ Pending | |

**Total: 1/33 commands migrated**

---

## 📋 Next Steps

### Immediate (Phase 2a)
1. Migrate `get_selection` command
2. Migrate `get_open_tabs` command
3. Create `vscode-api/window/editors.ts`
4. Test code generation: `npm run generate:commands`

### Short-term (Phase 2b)
1. Migrate all file operations (read, write, create, delete, open, close)
2. Create `vscode-api/workspace/filesystem.ts`
3. Create `vscode-api/workspace/documents.ts` (expand with open/close)

### Medium-term (Phase 3)
1. Extract `extension/` layer from current `extension.ts`
2. Create `extension/commands.ts`
3. Create `extension/statusbar.ts`

### Long-term (Phase 4-5)
1. Migrate all LSP tools
2. Migrate all terminal tools
3. Extract services (ContextPusher, TerminalManager, DiffService)
4. Delete legacy `src/bridge/`, `src/tools/index.ts`

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

- [ ] Run `npm run generate:commands` - should generate without errors
- [ ] Run `npm run typecheck` - should pass
- [ ] Run `npm run lint` - should pass
- [ ] Run `npm run build` - should succeed
- [ ] Test extension - `get_active_file` tool should work

---

## Notes

- Keep legacy `src/bridge/VsCodeBridge.ts` until all commands are migrated
- Keep legacy `src/tools/index.ts` until registry is complete
- Update REFACTORING_PLAN.md as migration progresses
- Each command should be tested before moving to the next
