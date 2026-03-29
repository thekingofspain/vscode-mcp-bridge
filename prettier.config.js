/** @type {import("prettier").Config} */
export default {
  // Standard prettier options
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  // Prettier plugin for sorting imports
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  // Import order: external → @ symbol → dots (relative)
  importOrder: [
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '^@.*$',
    '^[./]'
  ],
  importOrderParserPlugins: ['typescript', 'jsx'],
  importOrderTypeScriptVersion: '5.0.0',
};
