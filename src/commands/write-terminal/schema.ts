import { z } from 'zod'

export const WriteTerminalInputSchema = z.object({
  id: z.string().describe("Terminal ID"),
  input: z.string().describe("Text to send to the terminal stdin"),
  addNewline: z.boolean().optional().default(true).describe("Append a newline after the input"),
})
