import { z } from 'zod'

export const WriteFileInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file"),
  content: z.string().describe("The full content to write"),
  createIfMissing: z.boolean().optional().default(true).describe("Create the file if it does not exist"),
})
