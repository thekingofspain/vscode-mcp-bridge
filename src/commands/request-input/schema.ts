import { z } from 'zod'

export const RequestInputInputSchema = z.object({
  prompt: z.string().describe("The text to explain what input is needed"),
  placeHolder: z.string().optional().describe("Placeholder text in the input box"),
  value: z.string().optional().describe("Pre-filled value"),
})
