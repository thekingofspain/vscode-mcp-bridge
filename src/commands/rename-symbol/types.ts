import type { FilePosition } from '@type-defs/index.js';

export interface RenameSymbolArgs extends FilePosition {
  newName: string;
}
