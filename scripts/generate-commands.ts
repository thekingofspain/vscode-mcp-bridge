// Code Generation Script: YAML to TypeScript + MCP Registration
// Run: node --loader ts-node/esm scripts/generate-commands.ts

import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'
import * as url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

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

      if (field.type === 'array') {
        schema = '  ' + name + ': z.array(z.unknown())'
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

    // Generate schema.ts with zod import
    const schema = generateZodSchema(def)
    const schemaContent = 'import { z } from \'zod\'\n\n' + schema + '\n'
    fs.writeFileSync(path.join(commandsDir, folder, 'schema.ts'), schemaContent)

    // Skip index.ts generation to avoid esbuild getter-only export issues
    // See: https://github.com/evanw/esbuild/issues/587

    // Add to registry - import directly from handler and schema
    const pascalName = pascalCase(def.tool)
    registryImports.push('import { execute as ' + pascalName + 'Execute } from \'../../commands/' + folder + '/handler.js\'')
    registryImports.push('import { ' + pascalName + 'InputSchema } from \'../../commands/' + folder + '/schema.js\'')
    registryCalls.push('    server.registerTool(\'' + def.tool + '\', {\n      description: \'' + def.description.replace(/'/g, "\\'") + '\',\n      inputSchema: ' + pascalName + 'InputSchema\n    }, ' + pascalName + 'Execute as never)\n  ')

    console.log('Generated ' + folder)
  }

  // Write registry
  const registryContent =
    '// AUTO-GENERATED - DO NOT EDIT\n' +
    '// Source: src/commands/*/definition.yaml\n' +
    '// Run: npm run generate:commands\n\n' +
    'import { McpServer } from \'@modelcontextprotocol/sdk/server/mcp.js\'\n' +
    'import { getAllowedCommands } from \'@config/Settings.js\'\n' +
    'import type { TerminalManager } from \'@services/TerminalManager.js\'\n\n' +
    registryImports.join('\n') + '\n\n' +
    'export function registerAllTools(\n' +
    '  server: McpServer,\n' +
    '  terminalManager: TerminalManager,\n' +
    '): void {\n' +
    registryCalls.join('') +
    '}\n'

  fs.writeFileSync(registryPath, registryContent)
  console.log('\nGenerated registry with ' + registryCalls.length + ' tools')
}

generateCommands().catch(console.error)
