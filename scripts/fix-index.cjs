const fs = require('fs');
const path = require('path');

const toolsFile = path.join('C:\\Users\\ErikBerg\\source\\vscode-mcp-bridge\\src\\tools\\index.ts');
let toolsStr = fs.readFileSync(toolsFile, 'utf8');

toolsStr = toolsStr.replace(/server\.tool\(/g, 'server.registerTool(');

const matches = [...toolsStr.matchAll(/async\s+\(([^)]*)\)\s*=>\s*\{([^}]*)return\s*\{\s*content\s*:\s*\[([^\]]*)\]\s*\}\s*\}/g)];
for (const match of matches) {
  const fullMatch = match[0];
  const args = match[1];
  const bodyBeforeReturn = match[2];
  const contentArray = match[3];
  if (!bodyBeforeReturn.includes('await ')) {
    toolsStr = toolsStr.replace(fullMatch, `(${args}) => {${bodyBeforeReturn}return Promise.resolve({ content: [${contentArray}] })}`);
  }
}

toolsStr = toolsStr.replace(/Array\<T\>/g, 'T[]');
toolsStr = toolsStr.replace(/Array\<unknown\>/g, 'unknown[]');

toolsStr = toolsStr.replace(/args\.allowedCommands \?\? \[\]/g, 'args.allowedCommands');
toolsStr = toolsStr.replace(/args\.includes \?\? \[\]/g, 'args.includes');
toolsStr = toolsStr.replace(/opts\.allowedCommands \?\? \[\]/g, 'opts.allowedCommands');
toolsStr = toolsStr.replace(/args\.items \?\? \[\]/g, 'args.items');

toolsStr = toolsStr.replace(/msg!/g, 'msg');
toolsStr = toolsStr.replace(/as Array<unknown>/g, 'as unknown[]');
toolsStr = toolsStr.replace(/as Array<string>/g, 'as string[]');

fs.writeFileSync(toolsFile, toolsStr);
