#!/usr/bin/env node

/**
 * Generate TypeScript module from instructions.yaml
 * Run before build to embed MCP server instructions
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const yamlPath = path.join(rootDir, 'src', 'mcp', 'server', 'instructions.yaml');
const outputPath = path.join(rootDir, 'src', 'mcp', 'server', 'instructions.ts');

try {
  const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
  const doc = yaml.load(yamlContent);

  if (!doc || typeof doc !== 'object') {
    throw new Error('Invalid YAML structure');
  }

  const { version, server_name, instructions } = doc;

  const tsContent = `// AUTO-GENERATED - DO NOT EDIT
// Source: instructions.yaml
// Run: npm run generate:instructions

export const MCP_SERVER_VERSION = '${version}';
export const MCP_SERVER_NAME = '${server_name}';

export const MCP_SERVER_INSTRUCTIONS = \`${instructions}\`;
`;

  fs.writeFileSync(outputPath, tsContent);
  console.log(`✅ Generated instructions.ts from instructions.yaml`);
} catch (error) {
  console.error('❌ Failed to generate instructions:', error);
  process.exit(1);
}
