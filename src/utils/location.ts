import type * as vscode from 'vscode';

/**
 * Serialized location representation for MCP responses
 */
export interface SerializedLocation {
  filePath: string;
  startLine: number;
  startChar: number;
  endLine: number;
  endChar: number;
}

/**
 * Serialize a vscode.Location or vscode.LocationLink to a plain object
 */
export function serializeLocation(
  loc: vscode.Location | vscode.LocationLink,
): SerializedLocation {
  if ('uri' in loc) {
    // vscode.Location
    return {
      filePath: loc.uri.fsPath,
      startLine: loc.range.start.line,
      startChar: loc.range.start.character,
      endLine: loc.range.end.line,
      endChar: loc.range.end.character,
    };
  }

  // vscode.LocationLink
  return {
    filePath: loc.targetUri.fsPath,
    startLine: loc.targetRange.start.line,
    startChar: loc.targetRange.start.character,
    endLine: loc.targetRange.end.line,
    endChar: loc.targetRange.end.character,
  };
}

/**
 * Serialize an array of locations
 */
export function serializeLocations(
  locations: (vscode.Location | vscode.LocationLink)[],
): SerializedLocation[] {
  return locations.map(serializeLocation);
}
