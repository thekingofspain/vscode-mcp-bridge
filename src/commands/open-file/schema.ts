export const OpenFileInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file"),
  line: z.number().min(0).optional().describe("Line to jump to (0-indexed)"),
  character: z.number().min(0).optional().describe("Character position"),
  preview: z.boolean().optional().default(false).describe("Open in preview mode"),
})
