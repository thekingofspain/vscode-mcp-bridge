import { Project } from 'ts-morph';
import * as path from 'path';

// Path alias mappings (alias -> source directory relative to baseUrl)
const PATH_ALIASES: Record<string, string> = {
  '@commands': 'commands',
  '@config': 'config',
  '@extension': 'extension',
  '@mcp': 'mcp',
  '@services': 'services',
  '@type-defs': 'types',
  '@utils': 'utils',
  '@vscode-api': 'vscode-api',
};

// Reverse mapping: source directory -> alias
const DIR_TO_ALIAS: Record<string, string> = Object.entries(PATH_ALIASES).reduce(
  (acc, [alias, dir]) => {
    acc[dir] = alias;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Converts a relative import path to a path alias if applicable.
 * @param relativePath - The relative import path (e.g., '../services/ContextPusher.js')
 * @param sourceFilePath - The path of the file containing the import
 * @param srcDir - The absolute path to the src directory
 * @returns The converted path with alias, or the original path if no alias applies
 */
function convertToAlias(
  relativePath: string,
  sourceFilePath: string,
  srcDir: string
): string {
  // Only process relative paths
  if (!relativePath.startsWith('./') && !relativePath.startsWith('../')) {
    return relativePath;
  }

  // Resolve the absolute path of the import target
  const sourceDir = path.dirname(sourceFilePath);
  const resolvedPath = path.resolve(sourceDir, relativePath);
  
  // Get the path relative to src directory
  const relativeToSrc = path.relative(srcDir, resolvedPath);
  
  // Check if the resolved path is within src directory
  if (relativeToSrc.startsWith('..') || path.isAbsolute(relativeToSrc)) {
    // Path goes outside src directory, keep as relative
    return relativePath;
  }

  // Extract the directory and file parts
  const dirPart = path.dirname(relativeToSrc);
  const filePart = path.basename(relativeToSrc);
  
  // Find matching alias for the directory
  for (const [dir, alias] of Object.entries(DIR_TO_ALIAS)) {
    if (dirPart === dir || dirPart.startsWith(dir + path.sep)) {
      // Reconstruct the path with alias
      const remainingPath = dirPart === dir ? '' : dirPart.substring(dir.length + 1);
      const newPath = remainingPath 
        ? path.join(alias, remainingPath, filePart)
        : path.join(alias, filePart);
      
      // Use forward slashes and keep .js extension
      return newPath.split(path.sep).join('/');
    }
  }

  // No alias found, keep original
  return relativePath;
}

/**
 * Main function to update imports in the src directory
 */
async function updateImports(): Promise<void> {
  const srcDir = path.resolve(__dirname, '..', 'src');
  
  console.log(`Scanning TypeScript files in: ${srcDir}`);
  
  // Create a ts-morph project
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, '..', 'tsconfig.json'),
  });

  // Get all TypeScript files in src directory (excluding scripts)
  const sourceFiles = project.getSourceFiles();
  
  console.log(`Found ${sourceFiles.length} TypeScript file(s)`);
  
  let totalUpdates = 0;
  
  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    let fileChanged = false;
    
    // Get all import declarations
    const importDeclarations = sourceFile.getImportDeclarations();
    
    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      const newModuleSpecifier = convertToAlias(moduleSpecifier, filePath, srcDir);
      
      if (newModuleSpecifier !== moduleSpecifier) {
        console.log(`  ${filePath}:`);
        console.log(`    FROM: ${moduleSpecifier}`);
        console.log(`    TO:   ${newModuleSpecifier}`);
        
        importDecl.setModuleSpecifier(newModuleSpecifier);
        fileChanged = true;
        totalUpdates++;
      }
    }
    
    // Save the file if it was changed
    if (fileChanged) {
      await sourceFile.save();
      console.log(`  Saved: ${filePath}`);
    }
  }
  
  console.log(`\nComplete! Updated ${totalUpdates} import statement(s)`);
}

// Run the script
updateImports().catch((error) => {
  console.error('Error updating imports:', error);
  process.exit(1);
});
