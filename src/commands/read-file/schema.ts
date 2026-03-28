export const ReadFileInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file"),
  startLine: z.number().min(0).optional().describe("Start line (0-indexed, inclusive)"),
  endLine: z.number().min(0).optional().describe("End line (0-indexed, inclusive)"),
})
