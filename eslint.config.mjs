import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // Require semicolons
      '@stylistic/semi': ['error', 'always'],
      // Add blank line before if statements
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'if' },
        // Add blank line after if statements (including single-line if with return)
        { blankLine: 'always', prev: 'if', next: '*' },
        // Add blank line after variable declarations (let, const, var)
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        // But allow consecutive variable declarations to stay together
        { blankLine: 'never', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      ],
      // Allow control characters in regex for ANSI escape sequence stripping (TerminalManager.ts)
      'no-control-regex': 'off',
      // Enforce consistent type imports (TypeScript 5.7 best practice)
      // Prefer type imports for type-only usage
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],
      // Enforce consistent type exports
      '@typescript-eslint/consistent-type-exports': [
        'error',
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      'out/',
      'node_modules/',
      'esbuild.config.js',
      'eslint.config.mjs',
      'prettier.config.js',
      'scripts/**',
      'types/',
      // Auto-generated files
      'src/commands/*/schema.ts',
      'src/commands/*/index.ts',
      'src/mcp/tools/registry.ts',
    ]
  }
);
