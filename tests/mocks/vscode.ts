/**
 * Manual mocks for vscode module
 * Place this in __mocks__/vscode.ts
 */

// Mock VSCode Uri class
export class Uri {
  static file(path: string): Uri {
    const uri = new Uri();

    uri.fsPath = path;
    uri.path = path.replace(/\\/g, '/');
    return uri;
  }

  static parse(path: string): Uri {
    const uri = new Uri();

    uri.fsPath = path;
    uri.path = path;
    return uri;
  }

  fsPath = '';
  path = '';
  scheme = 'file';
  authority = '';
  query = '';
  fragment = '';

  toString(): string {
    return `file://${this.path}`;
  }
}

// Mock Range class
export class Range {
  constructor(
    public startLine: number,
    public startCharacter: number,
    public endLine: number,
    public endCharacter: number,
  ) { }
}

// Mock Position class
export class Position {
  constructor(
    public line: number,
    public character: number,
  ) { }
}

// Mock Selection class
export class Selection extends Range {
  constructor(
    anchorLine: number,
    anchorCharacter: number,
    activeLine: number,
    activeCharacter: number,
  ) {
    super(anchorLine, anchorCharacter, activeLine, activeCharacter);
  }
}

// Mock Diagnostic class
export class Diagnostic {
  constructor(
    public range: Range,
    public message: string,
    public severity: number = 0,
    public source?: string,
    public code?: string | number,
  ) { }
}

// Diagnostic severity enum
export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3,
}

// Mock ThemeColor class
export class ThemeColor {
  constructor(public id: string) { }
}

// Mock ViewColumn enum
export enum ViewColumn {
  Active = -1,
  Beside = -2,
  One = 1,
  Two = 2,
  Three = 3,
}

// Mock TextEditorCursorStyle
export enum TextEditorCursorStyle {
  Line = 1,
  Block = 2,
  Underline = 3,
  LineThin = 4,
  BlockOutline = 5,
  UnderlineThin = 6,
}

// Mock TextEditorLineNumbersStyle
export enum TextEditorLineNumbersStyle {
  Off = 0,
  On = 1,
  Relative = 2,
  Interval = 3,
}

// Mock CancellationTokenSource
export class CancellationTokenSource {
  token = {
    isCancellationRequested: false,
    onCancellationRequested: () => ({ dispose: () => { } }),
  };

  cancel(): void {
    this.token.isCancellationRequested = true;
  }

  dispose(): void {
    this.token.isCancellationRequested = true;
  }
}

// Mock ExtensionMode enum
export enum ExtensionMode {
  Production = 1,
  Development = 2,
  Test = 3,
}

// Mock commands
export const commands = {
  registerCommand: () => ({ dispose: () => { } }),
  executeCommand: () => Promise.resolve(undefined),
};

// Mock window
export const window = {
  activeTextEditor: undefined,
  visibleTextEditors: [],
  tabGroups: {
    all: [],
    activeTabGroup: null,
    onDidChangeTabs: () => ({ dispose: () => { } }),
    close: () => Promise.resolve(true),
  },
  onDidChangeActiveTextEditor: () => ({ dispose: () => { } }),
  onDidChangeVisibleTextEditors: () => ({ dispose: () => { } }),
  onDidChangeTextEditorSelection: () => ({ dispose: () => { } }),
  createOutputChannel: () => ({
    name: '',
    append: () => { },
    appendLine: () => { },
    clear: () => { },
    show: () => { },
    hide: () => { },
    dispose: () => { },
  }),
  createStatusBarItem: () => ({
    text: '',
    tooltip: undefined,
    command: undefined,
    color: undefined,
    backgroundColor: undefined,
    name: undefined,
    show: () => { },
    hide: () => { },
    dispose: () => { },
  }),
  showTextDocument: () => Promise.resolve(),
  showInformationMessage: () => Promise.resolve(undefined),
  showWarningMessage: () => Promise.resolve(undefined),
  showErrorMessage: () => Promise.resolve(undefined),
  showQuickPick: () => Promise.resolve(undefined),
  showInputBox: () => Promise.resolve(undefined),
  createTextEditorDecorationType: () => ({ key: 'decoration', dispose: () => { } }),
  withProgress: () => Promise.resolve(),
};

// Mock workspace
export const workspace = {
  workspaceFolders: null,
  workspaceFile: undefined,
  onDidChangeWorkspaceFolders: () => ({ dispose: () => { } }),
  onDidChangeTextDocument: () => ({ dispose: () => { } }),
  onDidOpenTextDocument: () => ({ dispose: () => { } }),
  onDidCloseTextDocument: () => ({ dispose: () => { } }),
  onDidSaveTextDocument: () => ({ dispose: () => { } }),
  openTextDocument: () => Promise.resolve({}),
  save: () => Promise.resolve(true),
  saveAs: () => Promise.resolve(true),
  applyEdit: () => Promise.resolve(true),
  createFileSystemWatcher: () => ({
    onDidCreate: () => ({ dispose: () => { } }),
    onDidChange: () => ({ dispose: () => { } }),
    onDidDelete: () => ({ dispose: () => { } }),
    dispose: () => { },
  }),
  asRelativePath: (path: string) => path,
  findFiles: () => Promise.resolve([]),
  getConfiguration: () => ({
    get: () => undefined,
    has: () => false,
    inspect: () => undefined,
    update: () => Promise.resolve(),
  }),
};

// Mock env
export const env = {
  clipboard: {
    writeText: () => Promise.resolve(),
    readText: () => Promise.resolve(''),
  },
  openExternal: () => Promise.resolve(true),
};

// Mock languages
export const languages = {
  createDiagnosticCollection: () => ({
    name: '',
    set: () => { },
    add: () => { },
    delete: () => { },
    clear: () => { },
    forEach: () => { },
    has: () => false,
    dispose: () => { },
  }),
  registerCodeActionsProvider: () => ({ dispose: () => { } }),
  registerCompletionItemProvider: () => ({ dispose: () => { } }),
  registerDefinitionProvider: () => ({ dispose: () => { } }),
  registerReferenceProvider: () => ({ dispose: () => { } }),
  registerHoverProvider: () => ({ dispose: () => { } }),
  registerDocumentSymbolProvider: () => ({ dispose: () => { } }),
};

// Mock ThemeIcon
export class ThemeIcon {
  constructor(public id: string, public color: any) { }
}

// Mock Disposable
export interface Disposable {
  dispose(): void;
}

// Default export
export default {
  Uri,
  Range,
  Position,
  Selection,
  Diagnostic,
  DiagnosticSeverity,
  ThemeColor,
  ThemeIcon,
  ViewColumn,
  TextEditorCursorStyle,
  TextEditorLineNumbersStyle,
  CancellationTokenSource,
  ExtensionMode,
  commands,
  window,
  workspace,
  env,
  languages,
};
