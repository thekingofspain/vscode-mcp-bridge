const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const path = require('path');

const project = new Project();
const sourceFile = project.addSourceFileAtPath(path.join(__dirname, '../src/tools/index.ts'));

// 1. Refactor server.tool -> server.registerTool
const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).reverse();
calls.forEach(call => {
  const expr = call.getExpression();
  if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
    const propAccess = expr;
    if (propAccess.getExpression().getText() === 'server' && propAccess.getName() === 'tool') {
      const args = call.getArguments();
      
      let nameArg, descArg, schemaArg, handlerArg;
      
      if (args.length === 4) {
        nameArg = args[0].getText();
        descArg = args[1].getText();
        schemaArg = args[2].getText();
        handlerArg = args[3].getText();
      } else if (args.length === 3) {
        nameArg = args[0].getText();
        descArg = args[1].getText();
        schemaArg = '{}';
        handlerArg = args[2].getText();
      } else {
        return;
      }
      
      propAccess.getNameNode().replaceWithText('registerTool');
      
      const newArgs = [
        nameArg,
        `{\n      description: ${descArg},\n      inputSchema: ${schemaArg}\n    }`,
        handlerArg
      ];
      
      // Remove all args and add the new 3 args
      for (let i = args.length - 1; i >= 0; i--) {
        call.removeArgument(i);
      }
      call.addArguments(newArgs);
    }
  }
});

// (Async modifier removal skipped for regex phase instead)

sourceFile.saveSync();

// 3. Simple text replacements for smaller lint issues
const toolsFile = path.join(__dirname, '../src/tools/index.ts');
let toolsStr = fs.readFileSync(toolsFile, 'utf8');

toolsStr = toolsStr.replace(/Array\<T\>/g, 'T[]');
toolsStr = toolsStr.replace(/Array\<unknown\>/g, 'unknown[]');
toolsStr = toolsStr.replace(/Array\<string\>/g, 'string[]');

toolsStr = toolsStr.replace(/args\.allowedCommands \?\? \[\]/g, 'args.allowedCommands');
toolsStr = toolsStr.replace(/args\.includes \?\? \[\]/g, 'args.includes');
toolsStr = toolsStr.replace(/opts\.allowedCommands \?\? \[\]/g, 'opts.allowedCommands');
toolsStr = toolsStr.replace(/args\.items \?\? \[\]/g, 'args.items');

toolsStr = toolsStr.replace(/msg!/g, 'msg');
toolsStr = toolsStr.replace(/as Array<unknown>/g, 'as unknown[]');
toolsStr = toolsStr.replace(/as Array<string>/g, 'as string[]');

fs.writeFileSync(toolsFile, toolsStr);

console.log('AST transformations and lint fixes completed successfully.');
