# How to Test VS Code MCP Bridge Extension

This guide explains how to test the extension at different levels.

---

## Quick Start

```bash
# Run all automated tests (recommended before every commit)
npm run test

# Run linting
npm run lint
```

---

## Test Pyramid

```
                    ┌─────────────┐
                   /│  Manual     │
                  / │  Testing    │  ← Human testing with real MCP clients
                 /─────────────│
                │ │  E2E        │
                │ │  (Skipped)  │  ← Requires VS Code test runner
                │ └─────────────┘
                │ ┌─────────────┐
                │ │  Unit       │
                │ │  Tests      │  ← 253 automated tests
                │ └─────────────┘
```

---

## Level 1: Unit Tests (✅ Working)

**What:** Test individual functions with mocked VS Code API  
**Speed:** Fast (< 5 seconds)  
**Coverage:** 253 tests

### Run Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage report
npm run test:coverage

# Run in watch mode (re-runs on changes)
npm run test:watch

# Run specific test file
npx vitest run tests/unit/utils/logger.test.ts

# Run tests matching pattern
npx vitest run -t "should handle"
```

### What's Tested

| File | Tests | Description |
|------|-------|-------------|
| `utils/logger.test.ts` | 22 | Logging functionality |
| `utils/shell.test.ts` | 39 | Command execution & security |
| `utils/path.test.ts` | 27 | Path normalization |
| `utils/response.test.ts` | 28 | MCP response formatting |
| `utils/location.test.ts` | 9 | Location serialization |
| `utils/schemas.test.ts` | 29 | Zod schema validation |
| `commands/**/*.test.ts` | 64 | Command handlers & schemas |
| `mcp/tools/registry.test.ts` | 30 | Tool registration |

### Example Test Output

```
✓ tests/unit/utils/shell.test.ts (39 tests) 1565ms
  ✓ runCommand - security validation (25)
    ✓ should reject rm -rf command
    ✓ should reject pipe to bash
    ✓ should reject command substitution
  ✓ runCommand - execution (7)
    ✓ should return object with stdout, stderr, and exitCode

Test Files  12 passed (12)
Tests  253 passed (253)
```

---

## Level 2: E2E Tests (⚠️ Module Format Issue)

**What:** Test extension in real VS Code instance  
**Status:** Has module format compatibility issue  
**Workaround:** Use manual testing (Level 3)

### Current Issue

The e2e tests fail because of a module format mismatch:
- Extension is bundled as **CommonJS** (required by VS Code)
- Test runner expects **ES modules** (package.json has `"type": "module"`)

### To Fix (For Future)

Either:
1. **Rename extension output**: `out/extension.js` → `out/extension.cjs`
2. **Or change package.json**: Remove `"type": "module"` and update all imports
3. **Or configure test runner**: Use `.cjs` extension for test files

### Alternative: Manual E2E Testing ✅

For now, use **Level 3: Manual Testing** below - it works perfectly!

---

## Level 3: Manual Testing (✅ Recommended for E2E)

**What:** Test extension with real VS Code and MCP clients  
**When:** Before releases, after major changes

### Step 1: Launch Extension Development Host

1. **Open project in VS Code**
2. **Press F5** (or Run → Start Debugging)
3. **New VS Code window opens** (Extension Development Host)

### Step 2: Start MCP Server

In the new VS Code window:

1. **Open Command Palette:** `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. **Run:** `VS Code MCP Bridge: Start Server`
3. **Check Status Bar:** Should show "MCP Bridge: Running"
4. **View Logs:** Output panel → Select "MCP Bridge"

### Step 3: Test MCP Tools

#### Option A: Copy Connection URL

1. **Command Palette** → `VS Code MCP Bridge: Copy Connection URL`
2. **Paste into MCP client** (Claude Desktop, Cursor, etc.)

#### Option B: Test with Custom MCP Client

Create a test script:

```javascript
// test-mcp-client.js
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'test-client',
  version: '1.0.0',
});

async function testTools() {
  // Connect to MCP server
  await client.connect({
    url: 'http://127.0.0.1:3333',
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
  });

  // List available tools
  const tools = await client.listTools();
  console.log('Available tools:', tools.tools.map(t => t.name));

  // Test get_active_file
  const activeFile = await client.callTool({
    name: 'get_active_file',
    arguments: {},
  });
  console.log('Active file:', activeFile);

  // Test read_file
  const fileContent = await client.callTool({
    name: 'read_file',
    arguments: {
      filePath: 'c:/path/to/your/file.ts',
    },
  });
  console.log('File content:', fileContent);

  // Test run_terminal_command
  const terminalOutput = await client.callTool({
    name: 'run_terminal_command',
    arguments: {
      command: 'node --version',
    },
  });
  console.log('Terminal output:', terminalOutput);
}

testTools().catch(console.error);
```

### Step 4: Verify Each Tool Category

#### File Operations
- ✅ `read_file` - Read file content
- ✅ `write_file` - Write content to file
- ✅ `open_file` - Open file in editor
- ✅ `close_file` - Close active file
- ✅ `create_file` - Create new file
- ✅ `delete_file` - Delete file

#### LSP Features
- ✅ `get_diagnostics` - Get error/warning list
- ✅ `find_references` - Find symbol references
- ✅ `get_completions` - Get IntelliSense completions
- ✅ `get_hover` - Get hover information
- ✅ `go_to_definition` - Navigate to definition
- ✅ `get_code_actions` - Get quick fixes

#### Terminal
- ✅ `run_terminal_command` - Execute command
- ✅ `spawn_terminal` - Create new terminal
- ✅ `kill_terminal` - Close terminal
- ✅ `read_terminal` - Read terminal output
- ✅ `write_terminal` - Send text to terminal

#### Editor
- ✅ `get_active_file` - Get current file
- ✅ `get_selection` - Get selected text
- ✅ `get_open_tabs` - List open tabs
- ✅ `show_diff` - Show diff viewer

#### UI
- ✅ `show_message` - Show notification
- ✅ `show_quick_pick` - Show selection dropdown
- ✅ `request_input` - Show input box

---

## Debugging Tests

### Debug Unit Tests

1. **Add breakpoint** in test file:
   ```typescript
   it('should do something', () => {
     debugger; // ← Breakpoint here
     const result = myFunction();
     expect(result).toBe('expected');
   });
   ```

2. **Run with debugger:**
   - VS Code → Run and Debug → Select "Debug Unit Tests"
   - Or add to `.vscode/launch.json`:
     ```json
     {
       "name": "Debug Current Test",
       "type": "node",
       "request": "launch",
       "cwd": "${workspaceFolder}",
       "runtimeExecutable": "npx",
       "runtimeArgs": ["vitest", "run", "${relativeFile}"],
       "console": "integratedTerminal"
     }
     ```

### Debug Extension (Manual Testing)

1. **Set breakpoints** in extension code
2. **Press F5** to launch Extension Development Host
3. **Interact with extension** in new window
4. **Breakpoints hit** in original window

---

## Troubleshooting

### Tests Fail with "Cannot find module"

```bash
# Rebuild extension
npm run build

# Clear cache
rm -rf node_modules out dist
npm install
```

### E2E Tests Timeout

The E2E tests are skipped. Use manual testing instead.

### MCP Server Won't Start

1. **Check port:** Settings → `mcpServer.port` (default: 3333)
2. **Check token:** Settings → `mcpServer.authToken`
3. **Check logs:** Output → "MCP Bridge" channel
4. **Restart:** Command Palette → `VS Code MCP Bridge: Restart Server`

### MCP Client Can't Connect

1. **Verify URL:** `http://127.0.0.1:3333`
2. **Verify token:** Match token in VS Code settings
3. **Check firewall:** Port 3333 should be open
4. **Test with curl:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:3333
   ```

---

## Test Coverage Report

```bash
# Generate HTML coverage report
npm run test:coverage

# Open in browser
open coverage/index.html  # Mac
start coverage/index.html # Windows
```

### Coverage Goals

| Metric | Goal | Current |
|--------|------|---------|
| Lines | 80% | ✅ Check report |
| Functions | 85% | ✅ Check report |
| Branches | 75% | ✅ Check report |

---

## Continuous Integration

Tests run automatically on:
- Every pull request
- Every push to main branch
- Before releases

### CI Configuration

See `.github/workflows/test.yml` for CI setup.

---

## Summary

| Test Type | Command | When to Run |
|-----------|---------|-------------|
| **Unit Tests** | `npm run test` | Before every commit |
| **Lint** | `npm run lint` | Before every commit |
| **Manual E2E** | Press F5 | Before releases |
| **Coverage** | `npm run test:coverage` | For coverage reports |

**Recommended workflow:**
1. Write code
2. Run `npm run test` (fast feedback)
3. Run `npm run lint` (code quality)
4. Test manually with F5 (before push)
5. Commit and push
