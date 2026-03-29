import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
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
    },
  },
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ["out/", "node_modules/", "esbuild.config.js", "eslint.config.mjs", "scripts/**", "types/"]
  }
);
