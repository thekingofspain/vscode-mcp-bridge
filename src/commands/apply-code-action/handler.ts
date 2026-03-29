import * as vscode from 'vscode';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ApplyCodeActionArgs } from '@type-defs/index.js';
import { getCodeActions } from '@vscode-api/languages/codeactions.js';

export async function execute(
  args: ApplyCodeActionArgs,
): Promise<{ content: [{ type: 'text'; text: string }] }> {
  const actions = await getCodeActions(
    args.filePath,
    args.startLine,
    args.startChar,
    args.endLine,
    args.endChar,
  );
  const action = actions?.[args.actionIndex];

  if (action === undefined)
    throw new Error(`No code action at index ${String(args.actionIndex)}`);

  let applied = false;

  if ('edit' in action && action.edit) {
    await vscode.workspace.applyEdit(action.edit);
    applied = true;
  } else if ('command' in action && action.command) {
    const cmd =
      typeof action.command === 'string'
        ? action.command
        : action.command.command;

    await vscode.commands.executeCommand(cmd);
    applied = true;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          applied,
          title: 'title' in action ? action.title : '',
        }),
      },
    ],
  };
}

export function registerApplyCodeAction(server: McpServer): void {
  server.registerTool(
    'apply_code_action',
    {
      description:
        'Apply a code action by index (get index from get_code_actions first)',
      inputSchema: {},
    },
    execute as never,
  );
}
