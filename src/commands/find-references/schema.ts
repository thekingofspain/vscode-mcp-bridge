export const FindReferencesInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file"),
  line: z.number().min(0).describe("Line number (0-indexed)"),
  character: z.number().min(0).describe("Character position (0-indexed)"),
  includeDeclaration: z.boolean().optional().default(true).describe("Include declaration in results"),
})
