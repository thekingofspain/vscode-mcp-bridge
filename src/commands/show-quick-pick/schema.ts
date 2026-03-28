export const ShowQuickPickInputSchema = z.object({
  items: z.array().describe("The list of options to display"),
  placeHolder: z.string().optional().describe("Prompt text shown in the input box"),
  canPickMany: z.boolean().optional().default(false).describe("Allow selecting multiple items"),
})
