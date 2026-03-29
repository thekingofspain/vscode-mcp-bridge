import { z } from 'zod'

export const GetRepoMapInputSchema = z.object({
  directory: z.string().optional().describe("Absolute path to the directory to map. Defaults to workspace root."),
})
