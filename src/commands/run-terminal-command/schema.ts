import { z } from 'zod';

export const RunTerminalCommandInputSchema = z.object({
  command: z.string().describe("The shell command to run"),
  cwd: z.string().optional().describe("Working directory (defaults to workspace root)"),
  timeoutMs: z.number().min(1000).optional().default(30000).describe("Timeout in milliseconds"),
});
