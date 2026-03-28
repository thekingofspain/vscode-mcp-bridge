export const SpawnTerminalInputSchema = z.object({
  name: z.string().describe("Display name for the terminal (e.g. \"dev-server\", \"tests-watch\")"),
  command: z.string().optional().describe("Command to run immediately (e.g. \"npm run dev\"). Omit to just open a shell."),
  cwd: z.string().optional().describe("Working directory (defaults to workspace root)"),
})
