export const GetSignatureHelpInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file"),
  line: z.number().min(0).describe("Line number (0-indexed)"),
  character: z.number().min(0).describe("Character position (0-indexed)"),
  triggerCharacter: z.string().optional().describe("The character that triggered the signature help (e.g., \",\")"),
})
