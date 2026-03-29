import { z } from 'zod'

export const ApplyCodeActionInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file"),
  startLine: z.number().min(0).describe("Start line (0-indexed)"),
  startChar: z.number().min(0).describe("Start character (0-indexed)"),
  endLine: z.number().min(0).describe("End line (0-indexed)"),
  endChar: z.number().min(0).describe("End character (0-indexed)"),
  actionIndex: z.number().min(0).describe("Index from get_code_actions result"),
})
