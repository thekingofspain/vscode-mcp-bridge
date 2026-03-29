import type { McpToolResponse } from '@type-defs/index.js';

/**
 * Convert a result object to MCP response format
 */
export function toMcpResponse(
  data: unknown,
  maxLength?: number,
): McpToolResponse {
  let text = JSON.stringify(data);

  if (maxLength !== undefined && text.length > maxLength) {
    text = text.slice(0, maxLength) + '... (truncated)';
  }

  return { content: [{ type: 'text', text }] };
}
