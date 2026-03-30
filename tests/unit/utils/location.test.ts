/**
 * Tests for location utility functions
 *
 * Tests serialization of VSCode Location and LocationLink objects.
 */

import { serializeLocation, serializeLocations } from '@utils/location.js';
import type * as vscode from 'vscode';
import { describe, expect, it } from 'vitest';

describe('serializeLocation', () => {
  describe('vscode.Location', () => {
    it('should serialize a Location with uri and range', () => {
      const mockLocation: vscode.Location = {
        uri: {
          fsPath: '/path/to/file.ts',
          path: '/path/to/file.ts',
          scheme: 'file',
          authority: '',
          query: '',
          fragment: '',
          toString: () => 'file:///path/to/file.ts',
        } as vscode.Uri,
        range: {
          start: { line: 5, character: 10 },
          end: { line: 5, character: 20 },
        } as vscode.Range,
      };
      const result = serializeLocation(mockLocation);

      expect(result).toEqual({
        filePath: '/path/to/file.ts',
        startLine: 5,
        startChar: 10,
        endLine: 5,
        endChar: 20,
      });
    });

    it('should serialize a Location at start of file', () => {
      const mockLocation: vscode.Location = {
        uri: { fsPath: '/src/index.ts' } as vscode.Uri,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        } as vscode.Range,
      };
      const result = serializeLocation(mockLocation);

      expect(result).toEqual({
        filePath: '/src/index.ts',
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
      });
    });

    it('should serialize a Location spanning multiple lines', () => {
      const mockLocation: vscode.Location = {
        uri: { fsPath: '/src/module.ts' } as vscode.Uri,
        range: {
          start: { line: 10, character: 5 },
          end: { line: 20, character: 15 },
        } as vscode.Range,
      };
      const result = serializeLocation(mockLocation);

      expect(result).toEqual({
        filePath: '/src/module.ts',
        startLine: 10,
        startChar: 5,
        endLine: 20,
        endChar: 15,
      });
    });
  });

  describe('vscode.LocationLink', () => {
    it('should serialize a LocationLink with targetUri and targetRange', () => {
      const mockLink: vscode.LocationLink = {
        targetUri: { fsPath: '/path/to/definition.ts' } as vscode.Uri,
        targetRange: {
          start: { line: 3, character: 0 },
          end: { line: 3, character: 30 },
        } as vscode.Range,
        targetSelectionRange: {
          start: { line: 3, character: 16 },
          end: { line: 3, character: 25 },
        } as vscode.Range,
        originSelectionRange: undefined,
      };
      const result = serializeLocation(mockLink);

      expect(result).toEqual({
        filePath: '/path/to/definition.ts',
        startLine: 3,
        startChar: 0,
        endLine: 3,
        endChar: 30,
      });
    });

    it('should serialize a LocationLink for interface definition', () => {
      const mockLink: vscode.LocationLink = {
        targetUri: { fsPath: '/types/index.ts' } as vscode.Uri,
        targetRange: {
          start: { line: 0, character: 0 },
          end: { line: 10, character: 1 },
        } as vscode.Range,
        targetSelectionRange: {
          start: { line: 0, character: 17 },
          end: { line: 0, character: 23 },
        } as vscode.Range,
      };
      const result = serializeLocation(mockLink);

      expect(result).toEqual({
        filePath: '/types/index.ts',
        startLine: 0,
        startChar: 0,
        endLine: 10,
        endChar: 1,
      });
    });
  });
});

describe('serializeLocations', () => {
  it('should serialize an empty array of locations', () => {
    const result = serializeLocations([]);

    expect(result).toEqual([]);
  });

  it('should serialize an array with single location', () => {
    const locations: vscode.Location[] = [
      {
        uri: { fsPath: '/src/file.ts' } as vscode.Uri,
        range: {
          start: { line: 5, character: 0 },
          end: { line: 5, character: 10 },
        } as vscode.Range,
      },
    ];
    const result = serializeLocations(locations);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      filePath: '/src/file.ts',
      startLine: 5,
      startChar: 0,
      endLine: 5,
      endChar: 10,
    });
  });

  it('should serialize an array with multiple locations', () => {
    const locations: vscode.Location[] = [
      {
        uri: { fsPath: '/src/file1.ts' } as vscode.Uri,
        range: {
          start: { line: 1, character: 0 },
          end: { line: 1, character: 5 },
        } as vscode.Range,
      },
      {
        uri: { fsPath: '/src/file2.ts' } as vscode.Uri,
        range: {
          start: { line: 2, character: 0 },
          end: { line: 2, character: 10 },
        } as vscode.Range,
      },
      {
        uri: { fsPath: '/src/file3.ts' } as vscode.Uri,
        range: {
          start: { line: 3, character: 0 },
          end: { line: 3, character: 15 },
        } as vscode.Range,
      },
    ];
    const result = serializeLocations(locations);

    expect(result).toHaveLength(3);
    expect(result[0].filePath).toBe('/src/file1.ts');
    expect(result[1].filePath).toBe('/src/file2.ts');
    expect(result[2].filePath).toBe('/src/file3.ts');
  });

  it('should serialize mixed Location and LocationLink array', () => {
    const locations: (vscode.Location | vscode.LocationLink)[] = [
      {
        uri: { fsPath: '/src/location.ts' } as vscode.Uri,
        range: {
          start: { line: 1, character: 0 },
          end: { line: 1, character: 5 },
        } as vscode.Range,
      },
      {
        targetUri: { fsPath: '/src/link.ts' } as vscode.Uri,
        targetRange: {
          start: { line: 2, character: 0 },
          end: { line: 2, character: 10 },
        } as vscode.Range,
        targetSelectionRange: {
          start: { line: 2, character: 0 },
          end: { line: 2, character: 10 },
        } as vscode.Range,
      },
    ];
    const result = serializeLocations(locations);

    expect(result).toHaveLength(2);
    expect(result[0].filePath).toBe('/src/location.ts');
    expect(result[1].filePath).toBe('/src/link.ts');
  });
});
