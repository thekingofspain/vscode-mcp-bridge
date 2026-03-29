const fs = require('fs')
const path = require('path')

const commandsDir = path.join(__dirname, '../src/commands')

function addZImport(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  if (!content.startsWith('import { z }')) {
    content = 'import { z } from \'zod\'\n\n' + content
    fs.writeFileSync(filePath, content)
    console.log('Fixed:', filePath)
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      walkDir(filePath)
    } else if (file === 'schema.ts') {
      addZImport(filePath)
    }
  }
}

walkDir(commandsDir)
console.log('Done!')
