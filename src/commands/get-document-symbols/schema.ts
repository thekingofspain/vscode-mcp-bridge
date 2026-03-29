import { z } from 'zod';

export const GetDocumentSymbolsInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file"),
});
