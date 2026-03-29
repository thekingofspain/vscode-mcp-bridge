import { z } from 'zod'

export const GetDiagnosticsInputSchema = z.object({
  scope: z.enum(['open_files', 'workspace', 'git_delta', 'folder', 'file']).describe("Filtering scope for diagnostics"),
  targetPath: z.string().optional().describe("Absolute path to a specific file or folder (required if scope is file or folder)"),
  recursive: z.boolean().optional().default(true).describe("Recursive folder search (if scope is folder)"),
  severity: z.enum(['error', 'warning', 'information', 'hint']).optional().describe("Filter by minimum severity"),
})
