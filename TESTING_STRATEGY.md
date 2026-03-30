# VSCode MCP Bridge - Comprehensive Testing Strategy

## Executive Summary

This document outlines a complete Test-Driven Development (TDD) strategy for the VSCode MCP Bridge extension, covering unit tests, integration tests, and end-to-end tests for all MCP tools and VSCode commands.

---

## Table of Contents

1. [Testing Philosophy & TDD Approach](#testing-philosophy--tdd-approach)
2. [Testing Pyramid](#testing-pyramid)
3. [Test Framework Selection](#test-framework-selection)
4. [Test Categories](#test-categories)
5. [Command Testing Matrix](#command-testing-matrix)
6. [Test File Structure](#test-file-structure)
7. [Mocking Strategy](#mocking-strategy)
8. [Test Data & Fixtures](#test-data--fixtures)
9. [CI/CD Integration](#cicd-integration)
10. [Coverage Goals](#coverage-goals)

---

## Testing Philosophy & TDD Approach

### Red-Green-Refactor Cycle

Following TDD best practices, all new features and bug fixes follow the **Red-Green-Refactor** cycle:

1. **RED**: Write a failing test that defines the expected behavior
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Improve code quality while keeping tests green

### Test-First Principles

- **Write tests before implementation** for all new MCP tools
- **Tests as documentation** - each test describes expected behavior
- **Isolated tests** - no test depends on another
- **Deterministic tests** - no flaky tests, use proper mocking

---

## Testing Pyramid

```
                    ┌─────────────┐
                   │   E2E Tests  │  (10%)
                  │ Integration Tests │ (20%)
                 │     Unit Tests      │ (70%)
                └───────────────────────┘
```

### Unit Tests (70%)
- Test individual functions in isolation
- Mock all external dependencies (VSCode API, file system)
- Fast execution (<100ms per test)
- Examples: schema validation, utility functions, handler logic

### Integration Tests (20%)
- Test interactions between components
- Mock VSCode API but test real component interactions
- Examples: MCP tool registration, command handler integration

### E2E Tests (10%)
- Run in real VSCode instance
- Test actual VSCode API calls
- Slower but highest confidence
- Examples: extension activation, real file operations

---

## Test Framework Selection

### Primary Framework: **Vitest**

**Rationale:**
- Native ES modules support (required for this project)
- TypeScript support out-of-the-box
- Jest-compatible API (easy migration)
- Fast parallel execution
- Built-in coverage reporting
- Watch mode for TDD workflow

### VSCode Testing: **@vscode/test-cli**

For tests requiring real VSCode API:
- `@vscode/test-cli` for running tests in VSCode instance
- `@vscode/test-electron` for downloading VSCode

### Assertion Library: **Node:assert** (built-in)

Using Node's built-in `assert` module with Vitest for simplicity.

---

## Test Categories

### 1. Type Tests

Test type definitions and constants:

```typescript
// Test file: src/types/__tests__/common.test.ts
import { describe, it, expect } from 'vitest';
import { DIAGNOSTIC_SEVERITY, MESSAGE_SEVERITY } from '../common';

describe('DIAGNOSTIC_SEVERITY', () => {
  it('should have correct severity levels', () => {
    expect(DIAGNOSTIC_SEVERITY.error).toBe(0);
    expect(DIAGNOSTIC_SEVERITY.warning).toBe(1);
  });
});
```

### 2. Schema Validation Tests

Test Zod schemas for all MCP tools:

```typescript
// Test file: src/commands/read-file/__tests__/schema.test.ts
import { ReadFileInputSchema } from '../schema';

describe('ReadFileInputSchema', () => {
  it('should accept valid file path', () => {
    const result = ReadFileInputSchema.safeParse({
      filePath: '/path/to/file.ts',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid path', () => {
    const result = ReadFileInputSchema.safeParse({
      filePath: 123, // Invalid type
    });
    expect(result.success).toBe(false);
  });
});
```

### 3. Handler Tests

Test command handler logic with mocked dependencies:

```typescript
// Test file: src/commands/read-file/__tests__/handler.test.ts
import { execute } from '../handler';
import * as vscodeApi from '@vscode-api/workspace/documents';

vi.mock('@vscode-api/workspace/documents', () => ({
  readFile: vi.fn(),
}));

describe('read_file handler', () => {
  it('should return file content', async () => {
    vi.mocked(readFile).mockResolvedValue({
      content: 'test content',
      exists: true,
    });

    const result = await execute({ filePath: '/test/file.ts' });
    expect(result.content[0].text).toBe('test content');
  });
});
```

### 4. VSCode API Wrapper Tests

Test the abstraction layer over VSCode API:

```typescript
// Test file: src/vscode-api/workspace/__tests__/documents.test.ts
import * as vscode from 'vscode';
import { readFile, openFile } from '../documents';

// Uses @vscode/test-electron for real VSCode instance
```

### 5. MCP Tool Registry Tests

Test tool registration and invocation:

```typescript
// Test file: src/mcp/tools/__tests__/registry.test.ts
import { registerAllTools } from '../registry';

describe('MCP Tool Registry', () => {
  it('should register all tools', () => {
    const mockServer = createMockMcpServer();
    registerAllTools(mockServer, mockTerminalManager);
    expect(mockServer.registerTool).toHaveBeenCalledTimes(42); // All tools
  });
});
```

### 6. Extension Lifecycle Tests

Test activation and deactivation:

```typescript
// Test file: src/extension/__tests__/extension.test.ts
import { activate, deactivate } from '../extension';

describe('Extension Lifecycle', () => {
  it('should activate and register commands', async () => {
    const context = createMockExtensionContext();
    await activate(context);
    // Verify commands registered
  });

  it('should clean up on deactivate', async () => {
    await deactivate();
    // Verify resources released
  });
});
```

---

## Command Testing Matrix

### All MCP Tools (42 tools) - Each Requires:

| Tool Name | Schema Test | Handler Test | Integration Test | E2E Test |
|-----------|-------------|--------------|------------------|----------|
| `add_editor_decoration` | ✅ | ✅ | ✅ | ✅ |
| `apply_code_action` | ✅ | ✅ | ✅ | ✅ |
| `close_file` | ✅ | ✅ | ✅ | ✅ |
| `create_file` | ✅ | ✅ | ✅ | ✅ |
| `delete_file` | ✅ | ✅ | ✅ | ✅ |
| `execute_vscode_command` | ✅ | ✅ | ✅ | ✅ |
| `find_references` | ✅ | ✅ | ✅ | ✅ |
| `get_active_file` | ✅ | ✅ | ✅ | ✅ |
| `get_code_actions` | ✅ | ✅ | ✅ | ✅ |
| `get_completions` | ✅ | ✅ | ✅ | ✅ |
| `get_diagnostics` | ✅ | ✅ | ✅ | ✅ |
| `get_document_symbols` | ✅ | ✅ | ✅ | ✅ |
| `get_hover` | ✅ | ✅ | ✅ | ✅ |
| `get_open_tabs` | ✅ | ✅ | ✅ | ✅ |
| `get_repo_map` | ✅ | ✅ | ✅ | ✅ |
| `get_selection` | ✅ | ✅ | ✅ | ✅ |
| `get_signature_help` | ✅ | ✅ | ✅ | ✅ |
| `get_workspace_info` | ✅ | ✅ | ✅ | ✅ |
| `git_action` | ✅ | ✅ | ✅ | ✅ |
| `go_to_definition` | ✅ | ✅ | ✅ | ✅ |
| `go_to_implementation` | ✅ | ✅ | ✅ | ✅ |
| `go_to_type_definition` | ✅ | ✅ | ✅ | ✅ |
| `kill_terminal` | ✅ | ✅ | ✅ | ✅ |
| `list_terminals` | ✅ | ✅ | ✅ | ✅ |
| `open_file` | ✅ | ✅ | ✅ | ✅ |
| `read_file` | ✅ | ✅ | ✅ | ✅ |
| `read_terminal` | ✅ | ✅ | ✅ | ✅ |
| `rename_symbol` | ✅ | ✅ | ✅ | ✅ |
| `request_input` | ✅ | ✅ | ✅ | ✅ |
| `run_terminal_command` | ✅ | ✅ | ✅ | ✅ |
| `search_workspace_symbols` | ✅ | ✅ | ✅ | ✅ |
| `show_diff` | ✅ | ✅ | ✅ | ✅ |
| `show_message` | ✅ | ✅ | ✅ | ✅ |
| `show_quick_pick` | ✅ | ✅ | ✅ | ✅ |
| `spawn_terminal` | ✅ | ✅ | ✅ | ✅ |
| `write_file` | ✅ | ✅ | ✅ | ✅ |
| `write_terminal` | ✅ | ✅ | ✅ | ✅ |

### VSCode Commands (5 commands):

| Command | Test Type | Description |
|---------|-----------|-------------|
| `mcpServer.start` | Integration | Verify server starts on configured port |
| `mcpServer.stop` | Integration | Verify server stops cleanly |
| `mcpServer.restart` | Integration | Verify stop + start sequence |
| `mcpServer.copyConnectionUrl` | Unit | Verify URL format and clipboard |
| `mcpServer.showStatus` | Unit | Verify status display logic |

---

## Test File Structure

```
src/
├── types/
│   └── __tests__/
│       └── common.test.ts
├── commands/
│   ├── read-file/
│   │   ├── __tests__/
│   │   │   ├── schema.test.ts
│   │   │   ├── handler.test.ts
│   │   │   └── handler.e2e.test.ts
│   │   ├── schema.ts
│   │   ├── handler.ts
│   │   └── index.ts
│   └── [other-commands]/...
├── utils/
│   └── __tests__/
│       ├── path.test.ts
│       ├── response.test.ts
│       └── logger.test.ts
├── vscode-api/
│   └── __tests__/
│       ├── documents.test.ts
│       └── window.test.ts
├── mcp/
│   └── tools/
│       └── __tests__/
│           └── registry.test.ts
├── extension/
│   └── __tests__/
│       └── extension.test.ts
└── services/
    └── __tests__/
        ├── TerminalManager.test.ts
        └── ContextPusher.test.ts

test-fixtures/
├── sample-project/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── fixtures.ts

tests/
├── e2e/
│   ├── extension.e2e.test.ts
│   └── tools.e2e.test.ts
└── integration/
    └── commands.integration.test.ts
```

---

## Mocking Strategy

### VSCode API Mocking

```typescript
// __mocks__/vscode.ts
import { EventEmitter } from 'events';

export const window = {
  activeTextEditor: null,
  visibleTextEditors: [],
  onDidChangeActiveTextEditor: vi.fn(),
  createOutputChannel: vi.fn(() => ({
    appendLine: vi.fn(),
    dispose: vi.fn(),
  })),
  createStatusBarItem: vi.fn(() => ({
    show: vi.fn(),
    hide: vi.fn(),
    dispose: vi.fn(),
  })),
};

export const workspace = {
  workspaceFolders: null,
  workspaceFile: null,
  openTextDocument: vi.fn(),
  onDidChangeTextDocument: vi.fn(),
};

export const commands = {
  registerCommand: vi.fn(),
  executeCommand: vi.fn(),
};
```

### MCP Server Mocking

```typescript
function createMockMcpServer() {
  return {
    registerTool: vi.fn(),
    tool: vi.fn(),
    resource: vi.fn(),
  };
}
```

### File System Mocking

```typescript
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    unlink: vi.fn(),
  },
}));
```

---

## Test Data & Fixtures

### Sample Project Structure

```
test-fixtures/sample-project/
├── src/
│   ├── index.ts          # Main entry point
│   ├── utils.ts          # Helper functions
│   └── types.ts          # Type definitions
├── tests/
│   └── index.test.ts
├── package.json
└── tsconfig.json
```

### Fixture Helpers

```typescript
// test-fixtures/fixtures.ts
import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';

export async function createTempProject(): Promise<string> {
  const tempDir = join(__dirname, 'temp', crypto.randomUUID());
  await mkdir(tempDir, { recursive: true });
  // Copy sample project structure
  return tempDir;
}

export async function cleanupTempProject(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run typecheck
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        uses: coactions/setup-xvfb@v1
        with:
          run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

### NPM Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --dir src",
    "test:integration": "vitest run --dir tests/integration",
    "test:e2e": "vscode-test",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## Coverage Goals

### Minimum Thresholds

| Metric | Goal | Critical Files |
|--------|------|----------------|
| Lines | 80% | All handlers |
| Functions | 85% | All utilities |
| Branches | 75% | Schema validation |
| Statements | 80% | All services |

### Critical Path Coverage (100% Required)

- All MCP tool handlers
- Schema validation
- Extension activation/deactivation
- Error handling paths
- Security-critical code (auth, file access)

### Coverage Reports

```bash
# Generate HTML coverage report
npm run test:coverage

# View in browser
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

---

## TDD Workflow Example

### Step 1: Write Failing Test

```typescript
// src/commands/read-file/__tests__/handler.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execute } from '../handler';
import { readFile } from '@vscode-api/workspace/documents';

vi.mock('@vscode-api/workspace/documents');

describe('read_file handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read file and return content as MCP response', async () => {
    // Arrange
    vi.mocked(readFile).mockResolvedValue({
      content: 'Hello World',
      exists: true,
    });

    // Act
    const result = await execute({ filePath: '/test/file.txt' });

    // Assert
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toEqual({
      type: 'text',
      text: 'Hello World',
    });
  });

  it('should handle file not found error', async () => {
    // Arrange
    vi.mocked(readFile).mockResolvedValue({
      content: '',
      exists: false,
      error: 'File not found',
    });

    // Act & Assert
    await expect(execute({ filePath: '/nonexistent.txt' }))
      .rejects.toThrow('File not found');
  });
});
```

### Step 2: Run Test (RED)

```bash
npm run test:watch
# Test fails - handler not implemented
```

### Step 3: Implement Handler (GREEN)

```typescript
// src/commands/read-file/handler.ts
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FileReadArgs } from '@type-defs/index.js';
import { toMcpResponse } from '@utils/response.js';
import { readFile } from '@vscode-api/workspace/documents.js';

export async function execute(
  args: FileReadArgs,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const result = await readFile(args.filePath, args.startLine, args.endLine);

  if (!result.exists) {
    throw new Error(result.error ?? 'File not found');
  }

  return toMcpResponse(result.content);
}
```

### Step 4: Run Test (GREEN)

```bash
# Tests pass!
✓ read_file handler (2)
  ✓ should read file and return content as MCP response
  ✓ should handle file not found error
```

### Step 5: Refactor

- Check for code duplication
- Improve error messages
- Add type safety
- Ensure tests still pass

---

## Testing Best Practices

### DO ✅

- Write tests first (TDD)
- Use descriptive test names: `should_do_something_when_condition`
- Keep tests isolated and independent
- Mock external dependencies
- Test error paths, not just happy paths
- Use fixtures for repeatable test data
- Run tests frequently (watch mode)

### DON'T ❌

- Don't test implementation details
- Don't write tests that depend on each other
- Don't mock what you don't own (VSCode API wrappers OK)
- Don't skip error case testing
- Don't write flaky tests (no random data, no timing dependencies)
- Don't test private methods directly

---

## Debugging Tests

### VSCode Launch Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Unit Tests",
      "skipFiles": ["<node_internals>/**"],
      "runtimeArgs": ["--loader", "ts-node/esm"],
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${file}"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "env": {
        "NODE_OPTIONS": "--loader ts-node/esm"
      }
    },
    {
      "type": "extensionHost",
      "request": "launch",
      "name": "Debug E2E Tests",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/tests/e2e"
      ]
    }
  ]
}
```

---

## Maintenance

### Test Health Checks

- **Weekly**: Review flaky tests
- **Per PR**: Ensure coverage doesn't drop
- **Monthly**: Refactor test duplication
- **Quarterly**: Update test dependencies

### Test Documentation

Each test file should have:
1. Clear description of what's being tested
2. Comments for complex test scenarios
3. Links to related issues/PRs

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [VSCode Testing API](https://code.visualstudio.com/api/extension-guides/testing)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- [TDD Best Practices 2025](https://www.encodedots.com/blog/test-driven-development-guide)
- [Testing VSCode Extensions](https://devblogs.microsoft.com/ise/testing-vscode-extensions-with-typescript/)

---

## Next Steps

1. ✅ Set up Vitest configuration
2. ✅ Install testing dependencies
3. ✅ Write tests for `common.ts` types
4. ✅ Write tests for utility functions
5. ✅ Write tests for all command handlers
6. ✅ Write integration tests
7. ✅ Write E2E tests
8. ✅ Configure CI/CD pipeline
9. ✅ Set up coverage reporting
