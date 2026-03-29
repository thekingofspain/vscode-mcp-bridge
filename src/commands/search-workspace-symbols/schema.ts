import { z } from 'zod'

export const SearchWorkspaceSymbolsInputSchema = z.object({
  query: z.string().describe("Symbol name to search for"),
})
