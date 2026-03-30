# Test Bed Configuration Summary

## ✅ Path Aliases Configured

All test files now use path aliases matching the source code structure.

### Alias Mapping

```
@commands/*      → src/commands/*
@config/*        → src/config/*
@extension/*     → src/extension/*
@mcp/*           → src/mcp/*
@services/*      → src/services/*
@type-defs/*     → src/types/*
@utils/*         → src/utils/*
@vscode-api/*    → src/vscode-api/*
@generated/*     → .generated/*
```

### Example Imports

**Before (relative paths)**:
```typescript
import { execute } from '../handler.js';
import { readFile } from '../../../vscode-api/workspace/documents.js';
```

**After (path aliases)**:
```typescript
import { execute } from '@commands/read-file/handler.js';
import { readFile } from '@vscode-api/workspace/documents.js';
```

---

## Test Execution Locations

### Unit Tests (Vitest + Node.js)
- **Location**: `src/**/__tests__/**/*.test.ts`
- **Runner**: Vitest in Node.js environment
- **VSCode API**: Mocked via `__mocks__/vscode.ts`
- **Speed**: ~3 seconds for 300+ tests
- **Command**: `npm test` or `npx vitest run`

### E2E Tests (@vscode/test-cli)
- **Location**: `tests/e2e/**/*.test.ts`
- **Runner**: Real VSCode instance
- **VSCode API**: Real implementation
- **Speed**: ~30 seconds
- **Command**: `npm run test:e2e`

### Test Fixtures
- **Location**: `test-fixtures/sample-project/`
- **Purpose**: Sample code for testing LSP features
- **Used by**: E2E tests and integration tests

---

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript path aliases |
| `vitest.config.ts` | Vitest config with same aliases |
| `vitest.e2e.config.ts` | E2E test configuration |
| `.vscode-test.json` | VSCode test runner config |
| `__mocks__/vscode.ts` | VSCode API mocks for unit tests |

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

### Test by Pattern
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

### E2E Tests
```bash
npm run test:e2e
```

---

## Test Results

### Current Status
```
✅ Test Files:  5 passed (utils, smoke tests)
⚠️  Test Files:  6 failed (need handler fixes)

✅ Tests:      231 passed (73%)
❌ Tests:        54 failed (27%)
📊 Total:       315 tests
⏱️  Duration:   ~4 seconds
```

### Passing Test Files
- ✅ `src/utils/__tests__/response.test.ts` (28 tests)
- ✅ `src/utils/__tests__/path.test.ts` (27 tests)
- ✅ `src/utils/__tests__/logger.test.ts` (34 tests)
- ✅ `src/utils/__tests__/smoke.test.ts` (3 tests)
- ✅ `src/commands/write-file/__tests__/handler.test.ts` (23 tests)

### Files Needing Fixes
- `src/commands/read-file/__tests__/handler.test.ts` - VSCode mock issues
- `src/commands/execute-vscode-command/__tests__/handler.test.ts` - Handler signature mismatch
- Schema tests - Zod v4 API changes

---

## Directory Structure

```
vscode-mcp-bridge/
│
├── src/                          # Source code (baseUrl for path aliases)
│   ├── commands/                 # @commands/*
│   │   └── read-file/
│   │       ├── __tests__/        # Tests use: @commands/read-file/...
│   │       ├── handler.ts
│   │       └── schema.ts
│   ├── utils/                    # @utils/*
│   │   └── __tests__/            # Tests use: @utils/...
│   └── ...
│
├── tests/
│   ├── e2e/                      # E2E tests with real VSCode
│   │   └── extension.e2e.test.ts
│   └── setup.ts
│
├── test-fixtures/
│   └── sample-project/           # Sample project for testing
│
├── __mocks__/
│   └── vscode.ts                 # VSCode API mocks
│
├── tsconfig.json                 # Path aliases defined here
├── vitest.config.ts              # Same aliases for Vitest
└── PATH_ALIASES.md              # This documentation
```

---

## How Path Resolution Works

### 1. TypeScript Compilation
```typescript
// Source: src/commands/read-file/handler.ts
import { readFile } from '@vscode-api/workspace/documents.js';
```
↓ TypeScript compiler resolves using tsconfig.json
```javascript
// Output: out/commands/read-file/handler.js
const documents_1 = require("../../vscode-api/workspace/documents");
```

### 2. Vitest Test Execution
```typescript
// Test: src/commands/read-file/__tests__/handler.test.ts
import { execute } from '@commands/read-file/handler.js';
```
↓ Vitest resolves using vitest.config.ts
```
Resolves to: src/commands/read-file/handler.js
Transforms TypeScript on-the-fly
Runs in Node.js environment
```

---

## Troubleshooting

### "Cannot find module" Error
```
Error: Cannot find module '@commands/read-file/handler'
```

**Solution**: Check that `vitest.config.ts` has the alias in `resolve.alias`

### Import Works in Source But Not Tests
**Cause**: Vitest config missing path aliases

**Solution**: Ensure `vitest.config.ts` mirrors `tsconfig.json` paths

### VSCode Module Not Found
```
Error: Cannot find module 'vscode'
```

**Solution**: The alias `'vscode': resolve(__dirname, './__mocks__/vscode.ts')` handles this

---

## Next Steps

1. ✅ Path aliases configured in all test files
2. ✅ Vitest config updated with aliases
3. ✅ Documentation created (PATH_ALIASES.md)
4. ⏳ Fix remaining test failures (handler signatures, Zod v4)
5. ⏳ Add more E2E tests with real VSCode

---

## References

- [PATH_ALIASES.md](./PATH_ALIASES.md) - Detailed path alias documentation
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Complete testing guide
- [TEST_IMPLEMENTATION_SUMMARY.md](./TEST_IMPLEMENTATION_SUMMARY.md) - Test implementation summary
- [Vitest Configuration](https://vitest.dev/config/)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
