# VSCode MCP Bridge - Testing Guide

## Overview

This project uses a **hybrid testing approach** with both **unit tests** (mocked) and **integration/E2E tests** (real VSCode):

```
┌─────────────────────────────────────────────────────────┐
│                    Testing Pyramid                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    ┌───────────┐                        │
│                   │   E2E     │  (10%) - Real VSCode   │
│                  │  Tests    │                          │
│                 │───────────│                           │
│                │ Integration │  (20%) - Real API        │
│               │   Tests    │                            │
│              │─────────────│                            │
│             │   Unit      │  (70%) - Mocked            │
│            │   Tests     │                              │
│           └───────────────┘                             │
└─────────────────────────────────────────────────────────┘
```

## Why Both Approaches?

### Unit Tests with Mocks ✅

**Location**: `src/**/__tests__/**/*.test.ts`

**Why Mock?**
- **Speed**: 300+ tests run in <3 seconds
- **Isolation**: Test logic without VSCode overhead
- **TDD Workflow**: Fast feedback during development
- **Edge Cases**: Easy to test error conditions
- **CI/CD**: Run on every commit without VSCode setup

**Example**:
```typescript
import { execute } from '../handler';
import * as documents from '../../../vscode-api/workspace/documents';

vi.mock('../../../vscode-api/workspace/documents', () => ({
  readFile: vi.fn(),
}));

it('should read file and return content', async () => {
  vi.mocked(documents.readFile).mockResolvedValue({
    content: 'test',
    exists: true,
  });

  const result = await execute({ filePath: '/test.txt' });
  expect(result.content[0].text).toBe('"test"');
});
```

**When to Use**:
- Testing business logic
- Schema validation
- Error handling
- Response formatting
- During TDD (Red-Green-Refactor)

---

### Integration/E2E Tests with Real VSCode ✅

**Location**: `tests/e2e/**/*.test.ts`

**Why Real VSCode?**
- **Actual API**: Test against real VSCode implementation
- **Extension Lifecycle**: Verify activation/deactivation
- **File System**: Real file operations via VSCode
- **UI Elements**: Status bar, commands, menus
- **Configuration**: Real settings access

**Example**:
```typescript
import * as vscode from 'vscode';
import { describe, it, assert } from 'vscode-test';

it('should open file in editor', async () => {
  const uri = vscode.Uri.file('/path/to/file.txt');
  const document = await vscode.workspace.openTextDocument(uri);
  
  assert.ok(document, 'Document should open');
  assert.strictEqual(document.getText(), 'expected content');
});
```

**When to Use**:
- Extension activation
- VSCode command execution
- File operations
- Editor interactions
- Before releases

---

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only (Mocked)
```bash
npm run test:unit
# or
npx vitest run src/
```

### E2E Tests (Real VSCode)
```bash
npm run test:e2e
# or
npx vscode-test
```

### Watch Mode (TDD)
```bash
npx vitest
```

### With Coverage
```bash
npm run test:coverage
```

### Specific Test File
```bash
npx vitest run src/utils/__tests__/response.test.ts
```

### Specific Test Pattern
```bash
npx vitest run -t "should convert string"
```

---

## Test File Structure

```
vscode-mcp-bridge/
├── src/
│   ├── commands/
│   │   ├── read-file/
│   │   │   ├── __tests__/
│   │   │   │   ├── handler.test.ts    # Unit test (mocked)
│   │   │   │   └── schema.test.ts     # Unit test (mocked)
│   │   │   ├── handler.ts
│   │   │   └── schema.ts
│   │   └── ...
│   ├── utils/
│   │   └── __tests__/
│   │       ├── response.test.ts       # Unit test (mocked)
│   │       ├── path.test.ts           # Unit test (mocked)
│   │       └── logger.test.ts         # Unit test (mocked)
│   └── ...
├── tests/
│   ├── e2e/
│   │   └── extension.e2e.test.ts      # E2E test (real VSCode)
│   ├── integration/
│   │   └── commands.integration.ts    # Integration test
│   └── setup.ts
├── test-fixtures/
│   └── sample-project/                # Test data
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── vitest.config.ts                   # Unit test config
├── vitest.e2e.config.ts               # E2E test config
└── .vscode-test.json                  # VSCode test config
```

---

## Test Categories

### 1. Unit Tests (src/**/__tests__/)

| Category | Files | Tests | Purpose |
|----------|-------|-------|---------|
| Types | 1 | 34 | Test type definitions |
| Utils | 4 | 92 | Test utility functions |
| Commands | 6 | 191 | Test command handlers |
| MCP | 1 | 30 | Test tool registry |
| **Total** | **12** | **347** | **Fast, isolated tests** |

### 2. E2E Tests (tests/e2e/)

| Category | Files | Tests | Purpose |
|----------|-------|-------|---------|
| Extension | 1 | 15+ | Test activation, commands |
| File Ops | - | - | Test file operations |
| Editor | - | - | Test editor interactions |
| **Total** | **1+** | **15+** | **Real VSCode tests** |

---

## Mocking Strategy

### What We Mock
- `vscode` module (entire API)
- File system operations
- VSCode commands
- Window/workspace APIs

### What We DON'T Mock
- Business logic
- Schema validation (Zod)
- Response formatting
- Error handling logic

### Mock Location
```typescript
// __mocks__/vscode.ts
export const window = {
  activeTextEditor: undefined,
  showTextDocument: vi.fn(),
  createStatusBarItem: vi.fn(),
  // ... more mocks
};

export const workspace = {
  workspaceFolders: null,
  openTextDocument: vi.fn(),
  // ... more mocks
};
```

---

## Writing Tests

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execute } from '../handler';
import * as api from '../../../vscode-api/module';

// Mock dependencies
vi.mock('../../../vscode-api/module', () => ({
  functionName: vi.fn(),
}));

describe('handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    vi.mocked(api.functionName).mockResolvedValue('result');

    // Act
    const result = await execute({ param: 'value' });

    // Assert
    expect(result).toHaveProperty('content');
  });
});
```

### E2E Test Template

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';
import { describe, it, before, after } from 'mocha';

describe('E2E Test', () => {
  before(async () => {
    // Setup before tests
  });

  after(async () => {
    // Cleanup after tests
  });

  it('should work with real VSCode', async () => {
    const document = await vscode.workspace.openTextDocument({
      content: 'test',
    });
    
    assert.ok(document);
    assert.strictEqual(document.getText(), 'test');
  });
});
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
      
      - name: Install dependencies
        run: npm ci
      
      # Unit tests (fast)
      - name: Run unit tests
        run: npm run test:unit
      
      # E2E tests (requires display)
      - name: Run E2E tests
        uses: coactions/setup-xvfb@v1
        with:
          run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

---

## Debugging Tests

### VSCode Launch Configurations

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "name": "Debug Unit Tests",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeArgs": ["--loader", "ts-node/esm"],
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${file}"],
      "console": "integratedTerminal"
    },
    {
      "type": "extensionHost",
      "name": "Debug E2E Tests",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/tests/e2e"
      ]
    }
  ]
}
```

---

## Best Practices

### DO ✅
- Write unit tests first (TDD)
- Add E2E tests for critical paths
- Mock external dependencies in unit tests
- Use real VSCode API in E2E tests
- Keep unit tests fast (<100ms each)
- Name tests descriptively
- Test error paths

### DON'T ❌
- Don't mock what you don't own (in E2E)
- Don't write tests that depend on each other
- Don't skip E2E tests before releases
- Don't test implementation details
- Don't ignore failing tests

---

## Troubleshooting

### "Cannot find module 'vscode'"
```bash
npm install --save-dev @types/vscode
```

### E2E tests fail to start
```bash
# Ensure VSCode is installed
# Check .vscode-test.json configuration
# Run with verbose logging:
npm run test:e2e -- --verbose
```

### Unit tests too slow
```bash
# Check for actual file I/O
# Ensure mocks are properly set up
# Run with --reporter=verbose to identify slow tests
npx vitest --reporter=verbose
```

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [VSCode Testing API](https://code.visualstudio.com/api/extension-guides/testing)
- [@vscode/test-cli](https://github.com/microsoft/vscode-test)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Test Implementation Summary](./TEST_IMPLEMENTATION_SUMMARY.md)
