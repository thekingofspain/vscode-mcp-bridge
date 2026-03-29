import { z } from 'zod'

export const ReadTerminalInputSchema = z.object({
  id: z.string().describe("Terminal ID (from spawn_terminal or list_terminals)"),
  lines: z.number().min(1).optional().describe("Number of lines to return from the end"),
})
