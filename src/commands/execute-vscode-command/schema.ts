import { z } from 'zod'

export const ExecuteVscodeCommandInputSchema = z.object({
  command: z.string().describe("The VS Code command ID to execute"),
  args: z.array().optional().default([]).describe("Arguments to pass to the command"),
})
