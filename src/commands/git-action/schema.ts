import { z } from 'zod';

export const GitActionInputSchema = z.object({
  operation: z.enum(['commit', 'checkout', 'branch', 'status']).describe("The git operation to perform"),
  branchName: z.string().optional().describe("Target branch for checkout or branch commands"),
  commitMessage: z.string().optional().describe("Message for commit command"),
});
