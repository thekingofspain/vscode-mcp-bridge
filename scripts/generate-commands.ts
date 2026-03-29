// Code Generation Script: YAML to TypeScript + MCP Registration
// Run: node --loader ts-node/esm scripts/generate-commands.ts

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
  handler: {
    module: string
    function: string
  }
}

interface InputField {
  type: string
  description: string
  required: boolean
  default?: unknown
  values?: string[]
  constraints?: { min?: number; max?: number }
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
    lines.push('export const ' + pascalCase(def.tool) + 'InputSchema = z.object({})')
  } else {
    lines.push('export const ' + pascalCase(def.tool) + 'InputSchema = z.object({')

    for (const [name, field] of inputEntries) {
      let schema = '  ' + name + ': z.' + field.type + '()'

      if (field.type === 'enum' && field.values) {
        schema = '  ' + name + ': z.enum([' + field.values.map(v => "'" + v + "'").join(', ') + '])'
      }

      if (field.constraints?.min !== undefined) {
        schema += '.min(' + field.constraints.min + ')'
      }

      if (field.constraints?.max !== undefined) {
        schema += '.max(' + field.constraints.max + ')'
      }

      if (field.required === false) {
        schema += '.optional()'
        if (field.default !== undefined) {
          schema += '.default(' + JSON.stringify(field.default) + ')'
        }
      }

      if (field.description) {
        schema += '.describe("' + field.description.replace(/"/g, '\\"') + '")'
      }

      lines.push(schema + ',')
    }

    lines.push('})')
  }

  return lines.join('\n')
}

async function generateCommands(): Promise<void> {
  const commandsDir = path.join(__dirname, '../src/commands')
  const registryPath = path.join(__dirname, '../src/mcp/tools/registry.ts')

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
      console.log('Skipping ' + folder + '/ - no definition.yaml')
      continue
    }

    const content = fs.readFileSync(defPath, 'utf-8')
    const def = yaml.load(content) as ToolDefinition

    // Generate schema.ts
    const schema = generateZodSchema(def)
    fs.writeFileSync(path.join(commandsDir, folder, 'schema.ts'), schema + '\n')

    // Generate index.ts
    const pascalName = pascalCase(def.tool)
    const index = '// Auto-generated from definition.yaml\n' +
      'export { execute } from \'./handler.js\'\n' +
      'export { ' + pascalName + 'InputSchema } from \'./schema.js\'\n' +
      'export { register' + pascalName + ' } from \'./handler.js\'\n'
    fs.writeFileSync(path.join(commandsDir, folder, 'index.ts'), index)

    // Add to registry
    registryImports.push('import { register' + pascalName + ' } from \'../../commands/' + folder + '/index.js\'')
    registryCalls.push('  register' + pascalName + '(server)')

    console.log('Generated ' + folder)
  }

  // Write registry
  const registryContent = '// AUTO-GENERATED - DO NOT EDIT\n' +
    '// Source: src/commands/*/definition.yaml\n' +
    '// Run: npm run generate:commands\n' +
    '// Generated: ' + new Date().toISOString() + '\n\n' +
    'import { McpServer } from \'@modelcontextprotocol/sdk/server/mcp.js\'\n\n' +
    registryImports.join('\n') + '\n\n' +
    'export function registerAllTools(server: McpServer): void {\n' +
    registryCalls.join('\n') + '\n' +
    '}\n'

  fs.writeFileSync(registryPath, registryContent)
  console.log('\nGenerated registry with ' + registryCalls.length + ' tools')
}

generateCommands().catch(console.error)
