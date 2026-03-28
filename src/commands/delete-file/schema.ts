export const DeleteFileInputSchema = z.object({
  filePath: z.string().describe("Absolute path to the file to delete"),
})
