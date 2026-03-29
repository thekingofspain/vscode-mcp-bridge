import { z } from 'zod'

export const ShowDiffInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file to diff"),
  newContent: z.string().describe("The proposed new content to show in the diff"),
  title: z.string().optional().describe("Title for the diff editor tab"),
})
