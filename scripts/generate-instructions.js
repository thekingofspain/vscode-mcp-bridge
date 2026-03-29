#!/usr/bin/env node

/**
 * Generate TypeScript module from instructions.md
 * Run before build to embed MCP server instructions
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const mdPath = path.join(rootDir, 'docs', 'instructions.md');
const outputPath = path.join(rootDir, '.generated', 'instructions.ts');

try {
  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  
  // Parse YAML frontmatter
  const frontmatterMatch = mdContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    throw new Error('Invalid markdown format - missing YAML frontmatter');
  }

  const [, frontmatterRaw, content] = frontmatterMatch;
  
  // Parse frontmatter manually (simple key: value pairs)
  const frontmatter = {};
  for (const line of frontmatterRaw.split('\n')) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      frontmatter[key.trim()] = value;
    }
  }

  const { version, server_name } = frontmatter;
  const instructions = content.trim();

  if (!version || !instructions) {
    throw new Error('Missing required frontmatter fields (version) or content');
  }

  // Ensure .generated directory exists
  const generatedDir = path.join(rootDir, '.generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  const tsContent = `// AUTO-GENERATED - DO NOT EDIT
// Source: docs/instructions.md
// Run: npm run generate:instructions

export const MCP_SERVER_VERSION = '${version}';
export const MCP_SERVER_NAME = '${server_name}';

export const MCP_SERVER_INSTRUCTIONS = \`${instructions}\`;
`;

  fs.writeFileSync(outputPath, tsContent);
  console.log(`✅ Generated instructions.ts from docs/instructions.md`);
} catch (error) {
  console.error('❌ Failed to generate instructions:', error);
  process.exit(1);
}
