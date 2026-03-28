/**
 * Code Generation Script: YAML → TypeScript + MCP Registration
 * 
 * Reads: src/commands/*/definition.yaml
 * Writes: 
 *   - src/commands/*/schema.ts (Zod schemas)
 *   - src/commands/*/index.ts (exports)
 *   - src/mcp/tools/registry.ts (tool registration)
 * 
 * Run: npm run generate:commands
 */

import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

interface ToolDefinition {
  tool: string
  description: string
  category: string
  version: string
  stability: 'stable' | 'experimental' | 'deprecated'
  input: Record<string, InputField>
  output?: OutputDefinition
  handler: {
    module: string
    function: string
  }
  dependencies?: string[]
  examples?: Example[]
}

interface InputField {
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object'
  description: string
  required: boolean
  default?: unknown
  values?: string[]
  constraints?: { min?: number; max?: number }
  examples?: unknown[]
}

interface OutputDefinition {
  type: string
  properties: Record<string, string>
}

interface Example {
  name: string
  input: Record<string, unknown>
  output?: Record<string, unknown>
}

function pascalCase(str: string): string {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, c => c.toUpperCase())
}

function generateZodSchema(def: ToolDefinition): string {
  const lines: string[] = []
  const inputEntries = Object.entries(def.input)
  
  if (inputEntries.length === 0) {
    lines.push(`export const ${pascalCase(def.tool)}InputSchema = z.object({})`)
  } else {
    lines.push(`export const ${pascalCase(def.tool)}InputSchema = z.object({`)
    
    for (const [name, field] of inputEntries) {
      let schema = `  ${name}: z.${field.type}()`
      
      if (field.type === 'enum' && field.values) {
        schema = `  ${name}: z.enum([${field.values.map(v => `'${v}'`).join(', ')}])`
      }
      
      if (field.constraints?.min !== undefined) {
        schema += `.min(${field.constraints.min})`
      }
      
      if (field.constraints?.max !== undefined) {
        schema += `.max(${field.constraints.max})`
      }
      
      if (field.required === false) {
        schema += '.optional()'
        if (field.default !== undefined) {
          schema += `.default(${JSON.stringify(field.default)})`
        }
      }
      
      if (field.description) {
        schema += `.describe('${field.description.replace(/'/g, "\\'")}')`
      }
      
      lines.push(schema + ',')
    }
    
    lines.push('})')
  }
  
  return lines.join('\n')
}

function generateIndex(def: ToolDefinition): string {
  const pascalName = pascalCase(def.tool)
  
  return `// Auto-generated from definition.yaml
export { execute } from './handler.js'
export { ${pascalName}InputSchema } from './schema.js'
`
}

function generateRegistryEntry(def: ToolDefinition, folder: string): string {
  const pascalName = pascalCase(def.tool)
  
  return `
import { register${pascalName} } from '../../commands/${folder}/index.js'

export function register${pascalName}Tool(server: McpServer): void {
  register${pascalName}(server)
}`
}

function generateCommandRegistration(def: ToolDefinition, folder: string): string {
  const pascalName = pascalCase(def.tool)
  const inputSchema = `${pascalName}InputSchema`
  
  return `
export function register${pascalName}(server: McpServer): void {
  server.registerTool('${def.tool}', {
    description: '${def.description.replace(/'/g, "\\'")}',
    inputSchema: ${inputSchema}
  }, execute)
}`
}

async function generateCommands(): Promise<void> {
  const commandsDir = path.join(__dirname, '../src/commands')
  const registryPath = path.join(__dirname, '../src/mcp/tools/registry.ts')
  
  // Find all command folders
  const commandFolders = fs.readdirSync(commandsDir)
    .filter(f => {
      const fullPath = path.join(commandsDir, f)
      return fs.statSync(fullPath).isDirectory()
    })
    .sort()
  
  const registryImports: string[] = []
  const registryCalls: string[] = []
  
  for (const folder of commandFolders) {
    const defPath = path.join(commandsDir, folder, 'definition.yaml')
    
    if (!fs.existsSync(defPath)) {
      console.log(`⚠️  Skipping ${folder}/ - no definition.yaml`)
      continue
    }
    
    const content = fs.readFileSync(defPath, 'utf-8')
    const def = yaml.load(content) as ToolDefinition
    
    // Generate schema.ts
    const schema = generateZodSchema(def)
    fs.writeFileSync(path.join(commandsDir, folder, 'schema.ts'), schema + '\n')
    
    // Generate index.ts
    const index = generateIndex(def)
    fs.writeFileSync(path.join(commandsDir, folder, 'index.ts'), index)
    
    // Generate command registration in commands folder
    const commandReg = generateCommandRegistration(def, folder)
    const existingIndex = fs.readFileSync(path.join(commandsDir, folder, 'index.ts'), 'utf-8')
    if (!existingIndex.includes(commandReg)) {
      fs.appendFileSync(path.join(commandsDir, folder, 'index.ts'), '\n' + commandReg + '\n')
    }
    
    // Add to registry
    registryImports.push(`import { register${pascalCase(folder)} } from '../../commands/${folder}/index.js'`)
    registryCalls.push(`  register${pascalCase(folder)}(server)`)
    
    console.log(`✅ Generated ${folder}`)
  }
  
  // Write registry
  const registryContent = `// ⚠️ AUTO-GENERATED - DO NOT EDIT
// Source: src/commands/*/definition.yaml
// Run: npm run generate:commands
// Generated: ${new Date().toISOString()}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

${registryImports.join('\n')}

export function registerAllTools(server: McpServer): void {
${registryCalls.join('\n')}
}
`
  
  fs.writeFileSync(registryPath, registryContent)
  console.log(`\n✅ Generated registry with ${registryCalls.length} tools`)
}

generateCommands().catch(console.error)
