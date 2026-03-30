/**
 * Script to update registry.ts imports to avoid esbuild getter-only export issue
 * Run: node scripts/fix-registry-imports.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryPath = join(__dirname, '..', 'src', 'mcp', 'tools', 'registry.ts');

let content = readFileSync(registryPath, 'utf-8');

// Replace combined imports with separate handler/schema imports
content = content.replace(
  /import \{ execute as (\w+)Execute, (\w+)InputSchema \} from '\.\.\/\.\.\/commands\/([^/]+)\/index\.js'/g,
  `import { execute as $1Execute } from '../../commands/$3/handler.js'
import { $2InputSchema } from '../../commands/$3/schema.js'`
);

// Replace single execute imports
content = content.replace(
  /import \{ execute as (\w+)Execute \} from '\.\.\/\.\.\/commands\/([^/]+)\/index\.js'/g,
  `import { execute as $1Execute } from '../../commands/$2/handler.js'`
);

// Replace single schema imports  
content = content.replace(
  /import \{ (\w+)InputSchema \} from '\.\.\/\.\.\/commands\/([^/]+)\/index\.js'/g,
  `import { $1InputSchema } from '../../commands/$2/schema.js'`
);

writeFileSync(registryPath, content);
console.log('✅ Fixed registry.ts imports');
