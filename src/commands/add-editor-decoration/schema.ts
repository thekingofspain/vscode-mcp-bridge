import { z } from 'zod'

export const AddEditorDecorationInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file"),
  startLine: z.number().min(0).describe("0-indexed start line"),
  endLine: z.number().min(0).describe("0-indexed end line"),
  color: z.string().optional().describe("CSS color name or hex code. Defaults to 'rgba(255, 255, 0, 0.3)'"),
})
