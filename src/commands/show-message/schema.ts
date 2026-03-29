import { z } from 'zod'

export const ShowMessageInputSchema = z.object({
  message: z.string().describe("The text of the message"),
  level: z.enum(['info', 'warning', 'error']).optional().default("info").describe("The severity level of the message"),
  items: z.array().optional().default([]).describe("Buttons/options to show alongside the message"),
})
