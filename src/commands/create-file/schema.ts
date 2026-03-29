import { z } from 'zod'

export const CreateFileInputSchema = z.object({
  filePath: z.string().describe("Absolute path for the new file"),
  content: z.string().optional().default("").describe("Initial content"),
})
