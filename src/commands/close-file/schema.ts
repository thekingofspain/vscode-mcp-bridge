import { z } from 'zod'

export const CloseFileInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file to close"),
})
