# Path Aliases & Test Bed Configuration

## Overview

This document explains the path alias configuration for the VSCode MCP Bridge extension and where tests run from.

---

## Path Aliases

### TypeScript Configuration (`tsconfig.json`)

Path aliases are defined in `tsconfig.json` with `baseUrl: "src"`:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@commands/*": ["commands/*"],
      "@config/*": ["config/*"],
      "@extension/*": ["extension/*"],
      "@mcp/*": ["mcp/*"],
      "@services/*": ["services/*"],
      "@type-defs/*": ["types/*"],
      "@utils/*": ["utils/*"],
      "@vscode-api/*": ["vscode-api/*"],
      "@generated/*": ["../.generated/*"]
    }
  }
}
```

### Vitest Configuration (`vitest.config.ts`)

Same aliases are configured for Vitest test runner:

```typescript
resolve: {
  alias: {
    '@commands': resolve(__dirname, './src/commands'),
    '@config': resolve(__dirname, './src/config'),
    '@extension': resolve(__dirname, './src/extension'),
    '@mcp': resolve(__dirname, './src/mcp'),
    '@services': resolve(__dirname, './src/services'),
    '@type-defs': resolve(__dirname, './src/types'),
    '@utils': resolve(__dirname, './src/utils'),
    '@vscode-api': resolve(__dirname, './src/vscode-api'),
    '@generated': resolve(__dirname, './.generated'),
    'vscode': resolve(__dirname, './__mocks__/vscode.ts'),
  },
}
```

---

## Alias Reference

| Alias | Resolves To | Example Usage |
|-------|-------------|---------------|
| `@commands/*` | `src/commands/*` | `import { execute } from '@commands/read-file/handler.js'` |
| `@config/*` | `src/config/*` | `import { getSettings } from '@config/Settings.js'` |
| `@extension/*` | `src/extension/*` | `import { activate } from '@extension/extension.js'` |
| `@mcp/*` | `src/mcp/*` | `import { registerAllTools } from '@mcp/tools/registry.js'` |
| `@services/*` | `src/services/*` | `import { TerminalManager } from '@services/TerminalManager.js'` |
| `@type-defs/*` | `src/types/*` | `import { DiagnosticSeverity } from '@type-defs/common.js'` |
| `@utils/*` | `src/utils/*` | `import { toMcpResponse } from '@utils/response.js'` |
| `@vscode-api/*` | `src/vscode-api/*` | `import { readFile } from '@vscode-api/workspace/documents.js'` |
| `@generated/*` | `.generated/*` | `import { config } from '@generated/config.js'` |

---

## Test Bed Locations

### Unit Tests
**Location**: `src/**/__tests__/**/*.test.ts`

**Runner**: Vitest (Node.js environment)

**Examples**:
- `src/utils/__tests__/response.test.ts`
- `src/commands/read-file/__tests__/handler.test.ts`
- `src/mcp/tools/__tests__/registry.test.ts`

**Run Command**:
```bash
npm test
# or
npx vitest run
```

### E2E Tests
**Location**: `tests/e2e/**/*.test.ts`

**Runner**: @vscode/test-cli (Real VSCode instance)

**Examples**:
- `tests/e2e/extension.e2e.test.ts`

**Run Command**:
```bash
npm run test:e2e
```

### Test Fixtures
**Location**: `test-fixtures/`

Sample projects and files used for testing:
- `test-fixtures/sample-project/` - Sample TypeScript project for testing LSP features

---

## File Resolution Flow

### Source Code Import
```typescript
// Source: src/commands/read-file/handler.ts
import { readFile } from '@vscode-api/workspace/documents.js';
```

**Resolution**:
1. TypeScript looks up `@vscode-api/*` in `tsconfig.json`
2. Resolves to `src/vscode-api/workspace/documents.js`
3. Compiled output uses relative path in `out/` directory

### Test Code Import
```typescript
// Test: src/commands/read-file/__tests__/handler.test.ts
import { execute } from '@commands/read-file/handler.js';
```

**Resolution**:
1. Vitest looks up `@commands/*` in `vitest.config.ts`
2. Resolves to `src/commands/read-file/handler.js`
3. Vitest transforms and runs the TypeScript directly

---

## Directory Structure

```
vscode-mcp-bridge/
├── src/                          # Source code (baseUrl)
│   ├── commands/                 # @commands/*
│   │   ├── read-file/
│   │   │   ├── __tests__/        # Unit tests
│   │   │   │   ├── handler.test.ts
│   │   │   │   └── schema.test.ts
│   │   │   ├── handler.ts
│   │   │   └── schema.ts
│   │   └── ...
│   ├── config/                   # @config/*
│   ├── extension/                # @extension/*
│   ├── mcp/                      # @mcp/*
│   │   └── tools/
│   │       └── __tests__/
│   │           └── registry.test.ts
│   ├── services/                 # @services/*
│   ├── types/                    # @type-defs/*
│   ├── utils/                    # @utils/*
│   │   └── __tests__/
│   │       ├── response.test.ts
│   │       ├── path.test.ts
│   │       └── logger.test.ts
│   └── vscode-api/               # @vscode-api/*
│       ├── workspace/
│       └── window/
│
├── tests/                        # E2E tests
│   ├── e2e/
│   │   └── extension.e2e.test.ts
│   └── setup.ts
│
├── test-fixtures/                # Test data
│   └── sample-project/
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── __mocks__/                    # Manual mocks
│   └── vscode.ts
│
├── .generated/                   # Generated code (@generated/*)
│
├── out/                          # Compiled output
│   ├── commands/
│   ├── utils/
│   └── ...
│
├── tsconfig.json                 # TypeScript config (path aliases)
├── vitest.config.ts              # Vitest config (path aliases)
└── vitest.e2e.config.ts          # E2E Vitest config
```

---

## Running Tests

### All Unit Tests
```bash
npm test
```

### Specific Test File
```bash
npx vitest run src/utils/__tests__/response.test.ts
```

### Test with Path Alias
```bash
npx vitest run -t "should convert string"
```

### Watch Mode (TDD)
```bash
npx vitest
```

### Coverage Report
```bash
npm run test:coverage
```

---

## VSCode Integration

### Debug Configuration (`.vscode/launch.json`)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "name": "Debug Unit Tests",
      "request": "launch",
      "cwd": "${workspaceFolder}",
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

## Build Output

After compilation (`npm run build`):

```
out/
├── commands/
│   ├── read-file/
│   │   ├── handler.js
│   │   ├── handler.js.map
│   │   └── ...
│   └── ...
├── utils/
│   ├── response.js
│   ├── response.js.map
│   └── ...
└── extension.js
```

**Note**: Tests are NOT compiled to `out/` - they run directly from source via Vitest.

---

## Common Issues

### "Cannot find module" Error

**Cause**: Path alias not resolved

**Fix**: Ensure vitest.config.ts has the alias in `resolve.alias`

### Import Path Mismatch

**Problem**: Using relative paths in tests but aliases in source

**Solution**: Always use path aliases in both source and tests:
```typescript
// ✅ Good
import { execute } from '@commands/read-file/handler.js';

// ❌ Avoid (works but inconsistent)
import { execute } from '../handler.js';
```

### VSCode Mock Not Found

**Problem**: Tests fail with "Cannot find module 'vscode'"

**Solution**: The alias `'vscode': resolve(__dirname, './__mocks__/vscode.ts')` in vitest.config.ts handles this.

---

## References

- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Vitest Configuration](https://vitest.dev/config/)
- [VSCode Extension Testing](https://code.visualstudio.com/api/extension-guides/testing)
