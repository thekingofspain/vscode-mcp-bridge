import { z } from 'zod';

export const GetRepoMapInputSchema = z.object({
  directory: z.string().optional().describe("Absolute path to the directory to map. Defaults to workspace root."),
  limit: z.number().min(1).optional().describe("Maximum number of symbols to include. Defaults to 1000."),
});
