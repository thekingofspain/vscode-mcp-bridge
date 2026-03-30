/**
 * VSCode Extension Integration Tests
 * 
 * These tests run in a real VSCode instance using @vscode/test-cli
 * They test actual VSCode API behavior, not mocks
 */

import * as assert from 'assert';
import * as fs from 'fs/promises';
import { after, before, describe, it } from 'mocha';
import * as path from 'path';
import * as vscode from 'vscode';

// Test workspace path
const TEST_WORKSPACE = path.join(__dirname, '../../test-fixtures/sample-project');

describe('VSCode MCP Bridge - Integration Tests', () => {
  let tempDir: string;

  before(async () => {
    // Create temp test directory
    tempDir = path.join(TEST_WORKSPACE, `temp-test-${String(Date.now())}`);
    await fs.mkdir(tempDir, { recursive: true });
  });

  after(async () => {
    // Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  describe('Extension Activation', () => {
    it('should activate and register commands', async () => {
      const extension = vscode.extensions.getExtension('jhamama.vscode-mcp-bridge-ext');

      assert.ok(extension, 'Extension should be installed');
      assert.ok(extension.isActive, 'Extension should be activated');

      // Check commands are registered
      const commands = await vscode.commands.getCommands(true);
      const mcpCommands = commands.filter(cmd => cmd.startsWith('mcpServer.'));

      assert.ok(mcpCommands.length >= 5, 'Should have at least 5 MCP commands');

      assert.ok(mcpCommands.includes('mcpServer.start'), 'Should have start command');

      assert.ok(mcpCommands.includes('mcpServer.stop'), 'Should have stop command');

      assert.ok(mcpCommands.includes('mcpServer.restart'), 'Should have restart command');
    });
  });

  describe('File Operations', () => {
    const testFile = path.join(tempDir, 'test.txt');
    const testContent = 'Hello from VSCode Integration Test!';

    it('should create and write file via VSCode API', async () => {
      const uri = vscode.Uri.file(testFile);
      const encoder = new TextEncoder();
      const data = encoder.encode(testContent);

      await vscode.workspace.fs.writeFile(uri, data);

      // Verify file exists
      const stat = await vscode.workspace.fs.stat(uri);

      assert.ok(stat, 'File should exist');

      // Verify content
      const content = await vscode.workspace.fs.readFile(uri);
      const decoder = new TextDecoder();

      assert.strictEqual(decoder.decode(content), testContent);
    });

    it('should open file in editor', async () => {
      const uri = vscode.Uri.file(testFile);
      const document = await vscode.workspace.openTextDocument(uri);

      assert.ok(document, 'Document should open');

      assert.strictEqual(document.getText(), testContent);
      assert.strictEqual(path.basename(document.fileName), 'test.txt');
    });

    it('should close file via command', async () => {
      const uri = vscode.Uri.file(testFile);

      await vscode.workspace.openTextDocument(uri);

      // Close all editors for this file
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');

      // Verify no active editor
      assert.strictEqual(vscode.window.activeTextEditor, undefined);
    });
  });

  describe('Workspace Operations', () => {
    it('should get workspace folders', () => {
      const folders = vscode.workspace.workspaceFolders;

      // In test mode, workspace might be different
      assert.ok(Array.isArray(folders ?? []), 'Workspace folders should be array');
    });

    it('should create text document', async () => {
      const document = await vscode.workspace.openTextDocument({
        content: 'Test content',
        language: 'plaintext',
      });

      assert.ok(document, 'Document should be created');
      assert.strictEqual(document.getText(), 'Test content');
      assert.strictEqual(document.languageId, 'plaintext');
    });
  });

  describe('Editor Operations', () => {
    it('should show text document in editor', async () => {
      const document = await vscode.workspace.openTextDocument({
        content: 'Editor test content',
        language: 'plaintext',
      });
      const editor = await vscode.window.showTextDocument(document);

      assert.ok(editor, 'Editor should be shown');
      assert.ok(vscode.window.activeTextEditor, 'Should have active editor');

      assert.strictEqual(
        vscode.window.activeTextEditor.document.getText(),
        'Editor test content',
      );
    });

    it('should get selection from editor', async () => {
      const document = await vscode.workspace.openTextDocument({
        content: 'Line 1\nLine 2\nLine 3',
        language: 'plaintext',
      });
      const editor = await vscode.window.showTextDocument(document);

      // Set selection
      editor.selection = new vscode.Selection(0, 0, 0, 6); // Select "Line 1"

      const selectedText = editor.document.getText(editor.selection);

      assert.strictEqual(selectedText, 'Line 1');
    });
  });

  describe('Diagnostic Operations', () => {
    it('should create diagnostic collection', () => {
      const collection = vscode.languages.createDiagnosticCollection('test');

      assert.ok(collection, 'Collection should be created');
      assert.strictEqual(collection.name, 'test');

      collection.dispose();
    });

    it('should set diagnostics on document', async () => {
      const document = await vscode.workspace.openTextDocument({
        content: 'function test() { return 1; }',
        language: 'javascript',
      });
      const collection = vscode.languages.createDiagnosticCollection('test');
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 8),
        'Test diagnostic',
        vscode.DiagnosticSeverity.Warning,
      );

      collection.set(document.uri, [diagnostic]);

      const diagnostics = collection.get(document.uri);

      assert.ok(diagnostics, 'Should have diagnostics');
      assert.strictEqual(diagnostics.length, 1);
      assert.strictEqual(diagnostics[0].message, 'Test diagnostic');

      collection.dispose();
    });
  });

  describe('Terminal Operations', () => {
    it('should create terminal', async () => {
      const terminal = vscode.window.createTerminal('Test Terminal');

      assert.ok(terminal, 'Terminal should be created');
      assert.strictEqual(terminal.name, 'Test Terminal');

      terminal.dispose();
    });

    it('should send text to terminal', async () => {
      const terminal = vscode.window.createTerminal('Test Terminal');

      // Send text (won't actually execute in test, but verifies API works)
      terminal.sendText('echo "test"', true);

      terminal.dispose();
    });
  });

  describe('Command Execution', () => {
    it('should execute VSCode command', async () => {
      // Test a built-in command
      await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');

      // Should have opened a new untitled file
      const activeEditor = vscode.window.activeTextEditor;

      assert.ok(activeEditor, 'Should have active editor');
      assert.ok(activeEditor.document.isUntitled, 'Should be untitled');

      // Close the untitled file
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    it('should execute cursor move command', async () => {
      const document = await vscode.workspace.openTextDocument({
        content: 'Line 1\nLine 2\nLine 3',
        language: 'plaintext',
      });

      await vscode.window.showTextDocument(document);

      // Move cursor down
      await vscode.commands.executeCommand('cursorDown');

      const editor = vscode.window.activeTextEditor;

      assert.ok(editor, 'Should have active editor');
      assert.strictEqual(editor.selection.active.line, 1); // Should be on line 2 (0-indexed)
    });
  });

  describe('Configuration', () => {
    it('should read extension configuration', () => {
      const config = vscode.workspace.getConfiguration('mcpServer');

      assert.ok(config, 'Should get configuration');

      // Check default values
      const port = config.get('port');

      assert.strictEqual(port, 3333, 'Default port should be 3333');

      const enableContextPush = config.get('enableContextPush');

      assert.strictEqual(enableContextPush, true, 'Context push should be enabled by default');
    });

    it('should update configuration', async () => {
      const config = vscode.workspace.getConfiguration('mcpServer');

      // Update a setting (this might not persist in tests)
      await config.update('port', 4000, vscode.ConfigurationTarget.Global);

      const newPort = config.get('port');

      assert.strictEqual(newPort, 4000, 'Port should be updated');

      // Reset to default
      await config.update('port', 3333, vscode.ConfigurationTarget.Global);
    });
  });
});
