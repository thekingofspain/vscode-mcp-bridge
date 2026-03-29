# VS Code MCP Bridge - Component & System Architecture

## ⚠️ Critical Architectural Constraint

### The Security Boundary Problem

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PROCESS BOUNDARY                                        │
│                                                                                 │
│  ┌──────────────────────────────┐       ┌──────────────────────────────────┐   │
│  │   EXTERNAL PROCESS           │       │      VS CODE PROCESS             │   │
│  │                              │       │                                  │   │
│  │  ┌────────────────────────┐  │       │  ┌────────────────────────────┐  │   │
│  │  │   AI CODING AGENT      │  │       │  │   VS CODE MCP BRIDGE       │  │   │
│  │  │                        │  │       │  │   EXTENSION                │  │   │
│  │  │  • Runs independently  │  │       │  │                            │  │   │
│  │  │  • Node.js process     │  │       │  │  • Runs INSIDE VS Code     │  │   │
│  │  │  • NO direct access    │  │       │  │  • HAS access to           │  │   │
│  │  │    to VS Code APIs     │  │       │  │    vscode.* APIs           │  │   │
│  │  │                        │  │       │  │                            │  │   │
│  │  │  ❌ Cannot call:       │  │       │  │  ✅ Can call:              │  │   │
│  │  │     vscode.workspace   │  │       │  │     vscode.workspace       │  │   │
│  │  │     vscode.window      │  │       │  │     vscode.window          │  │   │
│  │  │     vscode.languages   │  │       │  │     vscode.languages       │  │   │
│  │  │     LSP providers      │  │       │  │     LSP providers          │  │   │
│  │  └────────────────────────┘  │       │  └────────────────────────────┘  │   │
│  │                              │       │                                  │   │
│  │         OUTSIDE             │       │            INSIDE                │   │
│  └──────────────────────────────┘       └──────────────────────────────────┘   │
│                                                                                 │
│                          PROCESS BOUNDARY                                       │
│                          ═══════════════                                        │
│                                                                                 │
│  The AI agent CANNOT directly access VS Code APIs because:                     │
│                                                                                 │
│  1. VS Code Extension APIs are ONLY available to extensions running            │
│     INSIDE the VS Code process                                                 │
│                                                                                 │
│  2. LSP providers (vscode.languages.*) are ONLY accessible from within         │
│     the VS Code process                                                        │
│                                                                                 │
│  3. External processes have NO mechanism to call vscode.* APIs directly        │
│                                                                                 │
│  SOLUTION: This extension acts as a BRIDGE/GATEWAY that:                       │
│                                                                                 │
│  • Runs INSIDE VS Code (has vscode.* API access)                               │
│  • Exposes SELECTED capabilities via MCP protocol                              │
│  • AI agent calls MCP endpoints → Extension translates to vscode.* calls       │
│  • Controlled exposure (we choose what to expose, with auth + allowlists)      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## System Context Diagram (C4 Level 1) - With Process Boundary

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SYSTEMS                                   │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    AI CODING AGENT (External Process)                    │  │
│  │                                                                          │  │
│  │  • Cursor, Cline, Roo Code, etc.                                         │  │
│  │  • Runs as separate Node.js process                                      │  │
│  │  • NO access to VS Code APIs                                             │  │
│  │  • Communicates via MCP Protocol (HTTP/SSE)                              │  │
│  │                                                                          │  │
│  │  "Read the active file"                                                  │  │
│  │  "Find all references"                                                   │  │
│  │  "Run npm test"                                                          │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │                                            │
│                                   │ MCP Protocol                               │
│                                   │ (HTTP/SSE on localhost:3333)               │
│                                   │                                            │
│                                   ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    VS CODE APPLICATION                                   │  │
│  │                                                                          │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │              VS CODE EXTENSION HOST PROCESS                        │  │  │
│  │  │                                                                    │  │  │
│  │  │  ┌──────────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                                                              │  │  │  │
│  │  │  │   VS CODE MCP BRIDGE EXTENSION                               │  │  │  │
│  │  │  │                                                              │  │  │  │
│  │  │  │   • Runs INSIDE VS Code extension host                       │  │  │  │
│  │  │  │   • HAS access to vscode.* APIs                              │  │  │  │
│  │  │  │   • HAS access to LSP providers                              │  │  │  │
│  │  │  │   • Translates MCP → VS Code API calls                       │  │  │  │
│  │  │  │                                                              │  │  │  │
│  │  │  └──────────────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                                    │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│  PROCESS BOUNDARY: External processes CANNOT cross this line                   │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Why This Architecture?

### The Fundamental Constraint

**VS Code Extension APIs are ONLY accessible from within the VS Code process.**

| Capability | External Process | VS Code Extension |
|------------|-----------------|-------------------|
| `vscode.workspace.*` | ❌ NO | ✅ YES |
| `vscode.window.*` | ❌ NO | ✅ YES |
| `vscode.languages.*` (LSP) | ❌ NO | ✅ YES |
| `vscode.commands.*` | ❌ NO | ✅ YES |
| `vscode.extensions.getExtension()` | ❌ NO | ✅ YES |

### The Problem

AI coding agents (Cursor, Cline, Roo Code, etc.) run as **external Node.js processes**. They cannot:
- Read the active file in VS Code
- Get LSP diagnostics
- Find references or go to definition
- Execute VS Code commands
- Access the Git extension API

### The Solution: Bridge/Gateway Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURAL PATTERN                               │
│                                                                             │
│                                                                             │
│  EXTERNAL                          VS CODE PROCESS                          │
│  PROCESS                                                                    │
│                                                                             │
│  ┌──────────────┐                 ┌──────────────────────────────┐         │
│  │              │                 │  ┌────────────────────────┐  │         │
│  │  AI Agent    │   MCP Protocol  │  │  MCP Bridge Extension  │  │         │
│  │              │◀───────────────▶│  │                        │  │         │
│  │  (Node.js)   │   HTTP/SSE      │  │  (Inside VS Code)      │  │         │
│  │              │                 │  │                        │  │         │
│  │              │                 │  │  ┌──────────────────┐  │  │         │
│  │              │                 │  │  │ vscode.* APIs    │  │  │         │
│  │              │                 │  │  │ - workspace      │  │  │         │
│  │              │                 │  │  │ - window         │  │  │         │
│  │              │                 │  │  │ - languages (LSP)│  │  │         │
│  │              │                 │  │  │ - commands       │  │  │         │
│  │              │                 │  │  └──────────────────┘  │  │         │
│  │              │                 │  └────────────────────────┘  │         │
│  └──────────────┘                 └──────────────────────────────┘         │
│                                                                             │
│  ❌ NO direct access                ✅ HAS access                           │
│     to VS Code APIs                    to VS Code APIs                      │
│                                                                             │
│                                                                             │
│  The extension acts as a SECURE GATEWAY that:                              │
│                                                                             │
│  1. RECEIVES MCP protocol calls from external agents                       │
│  2. TRANSLATES them to vscode.* API calls                                  │
│  3. RETURNS results back via MCP protocol                                  │
│  4. CONTROLS what capabilities are exposed (security boundary)             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Security Implications

Because the extension is a **gateway**, we control exactly what gets exposed:

| Security Feature | Implementation |
|-----------------|----------------|
| **Authentication** | Optional Bearer token (`mcpServer.authToken`) |
| **Command Allowlist** | `mcpServer.allowedCommands` - explicit list of allowed VS Code commands |
| **Network Boundary** | Binds to `127.0.0.1` only (not public network) |
| **Capability Selection** | We choose which 37 tools to expose - nothing more |
| **User Confirmation** | Destructive operations show diff before applying |

---

## Container Diagram (C4 Level 2) - Inside the Extension

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    VS CODE MCP BRIDGE EXTENSION                                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         EXTENSION LAYER                                  │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    extension.ts                                  │   │   │
│  │  │  • Extension lifecycle (activate/deactivate)                     │   │   │
│  │  │  • VS Code command registrations                                 │   │   │
│  │  │  • Status bar UI management                                      │   │   │
│  │  │  • Component orchestration                                       │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Settings (config/)                            │   │   │
│  │  │  • VS Code configuration wrapper                                 │   │   │
│  │  │  • Port, auth token, allowed commands                            │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          MCP LAYER                                       │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    HttpServer (server/)                          │   │   │
│  │  │  • HTTP/SSE transport                                            │   │   │
│  │  │  • StreamableHTTPServerTransport                                 │   │   │
│  │  │  • Session management                                            │   │   │
│  │  │  • Authentication (Bearer token)                                 │   │   │
│  │  │  • CORS handling                                                 │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              Tool Registry (mcp/tools/)                          │   │   │
│  │  │  • registerAllTools()                                            │   │   │
│  │  │  • MCP SDK server.registerTool() calls                           │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              Commands (commands/) - 37 modules                   │   │   │
│  │  │  ┌──────────────────────────────────────────────────────────┐   │   │   │
│  │  │  │  get-active-file/                                        │   │   │   │
│  │  │  │  ├─ definition.yaml (declarative schema)                 │   │   │   │
│  │  │  │  ├─ handler.ts (business logic)                          │   │   │   │
│  │  │  │  ├─ schema.ts (Zod - auto-generated)                     │   │   │   │
│  │  │  │  └─ index.ts (exports - auto-generated)                  │   │   │   │
│  │  │  └──────────────────────────────────────────────────────────┘   │   │   │
│  │  │  ┌──────────────────────────────────────────────────────────┐   │   │   │
│  │  │  │  read-file/, write-file/, ... (36 more)                  │   │   │   │
│  │  │  └──────────────────────────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    VSCODE-API LAYER (Infrastructure)                    │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              workspace/                                          │   │   │
│  │  │  • documents.ts    - getActiveFile, readFile, openFile          │   │   │
│  │  │  • diagnostics.ts  - getDiagnostics (LSP)                       │   │   │
│  │  │  • symbols.ts      - getRepoMap, getDocumentSymbols             │   │   │
│  │  │  • filesystem.ts   - writeFile, deleteFile, createFile          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              window/                                             │   │   │
│  │  │  • editors.ts      - getSelection, getOpenTabs, showDiff        │   │   │
│  │  │  • ui.ts           - showMessage, showQuickPick, requestInput   │   │   │
│  │  │  • decorations.ts  - addEditorDecoration                         │   │   │
│  │  │  • terminals.ts    - runCommand (child_process)                 │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              languages/                                          │   │   │
│  │  │  • references.ts   - findReferences, renameSymbol               │   │   │
│  │  │  • definitions.ts  - getDefinition, getTypeDefinition,          │   │   │
│  │  │                        getImplementation                        │   │   │
│  │  │  • completions.ts  - getCompletions                             │   │   │
│  │  │  • hover.ts        - getHover                                   │   │   │
│  │  │  • signature.ts    - getSignatureHelp                           │   │   │
│  │  │  • codeactions.ts  - getCodeActions, applyCodeAction            │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              commands/                                           │   │   │
│  │  │  • execute.ts      - executeCommand (with allowlist)            │   │   │
│  │  │  • git.ts          - gitAction (commit, checkout, etc.)         │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       SERVICES LAYER                                    │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              ContextPusher (context/)                            │   │   │
│  │  │  • Listens to VS Code events:                                    │   │   │
│  │  │    - onDidChangeActiveTextEditor                                 │   │   │
│  │  │    - onDidChangeTextEditorSelection                               │   │   │
│  │  │    - onDidChangeDiagnostics                                      │   │   │
│  │  │  • Pushes context to connected MCP clients                       │   │   │
│  │  │  • Debounced event aggregation                                   │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              TerminalManager (services/)                         │   │   │
│  │  │  • Spawns long-running processes in VS Code terminals            │   │   │
│  │  │  • Captures output to log files                                  │   │   │
│  │  │  • Manages terminal lifecycle (spawn, read, write, kill)         │   │   │
│  │  │  • Shell integration (trap, script command)                      │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              DiffService (embedded in vscode-api/)               │   │   │
│  │  │  • In-memory FileSystemProvider for diff previews                │   │   │
│  │  │  • vscode.diff command integration                               │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       CROSS-CUTTING CONCERNS                            │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              Logger (utils/)                                     │   │   │
│  │  │  • Output channel integration                                    │   │   │
│  │  │  • Log levels: info, debug, warn, error                          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              Code Generation (scripts/)                          │   │   │
│  │  │  • generate-commands.ts                                          │   │   │
│  │  │  • YAML → TypeScript (schema.ts, index.ts, registry.ts)          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Diagram - MCP Tool Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MCP TOOL EXECUTION FLOW                                      │
│                                                                                 │
│                                                                                 │
│  ┌──────────────┐                                                              │
│  │  AI Agent    │                                                              │
│  │  (MCP Client)│                                                              │
│  └──────┬───────┘                                                              │
│         │ 1. MCP Tool Call                                                      │
│         │    { tool: "read_file",                                               │
│         │      arguments: { filePath: "/src/index.ts" } }                      │
│         │                                                                       │
│         ▼                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         HttpServer.ts                                     │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  StreamableHTTPServerTransport                                     │  │  │
│  │  │  • Session management                                              │  │  │
│  │  │  • Request parsing                                                 │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ 2. Route to Tool Handler                   │
│                                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    Tool Registry (mcp/tools/)                            │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  registerAllTools()                                                │  │  │
│  │  │  • server.registerTool('read_file', { schema }, execute)           │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ 3. Invoke Handler                          │
│                                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │              commands/read-file/handler.ts                               │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  export async function execute(args: { filePath: string }) {       │  │  │
│  │  │    const result = await readFile(args.filePath)                    │  │  │
│  │  │    return { content: [{ type: 'text', text: JSON.stringify(result)│  │  │
│  │  │  }                                                                 │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ 4. Call vscode-api Layer                   │
│                                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │           vscode-api/workspace/documents.ts                              │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  export async function readFile(filePath: string) {                │  │  │
│  │  │    const doc = await vscode.workspace.openTextDocument(filePath)   │  │  │
│  │  │    return { content: doc.getText(), exists: true }                 │  │  │
│  │  │  }                                                                 │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ 5. Call VS Code Extension API              │
│                                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    VS CODE EXTENSION APIs                                │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  vscode.workspace.openTextDocument()                               │  │  │
│  │  │  vscode.window.showInformationMessage()                            │  │  │
│  │  │  vscode.languages.getDiagnostics()                                 │  │  │
│  │  │  vscode.commands.executeCommand()                                  │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ 6. Return Result                           │
│                                   │                                            │
│  ┌────────────────────────────────┴─────────────────────────────────────────┐  │
│  │                    RESULT FLOWS BACK TO AGENT                            │  │
│  │                                                                          │  │
│  │  {                                                                       │  │
│  │    content: [{                                                           │  │
│  │      type: "text",                                                       │  │
│  │      text: "{\"content\":\"...\",\"exists\":true}"                       │  │
│  │    }]                                                                    │  │
│  │  }                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Diagram - Context Push Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CONTEXT PUSH (Auto-Push to Agents)                           │
│                                                                                 │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      VS CODE EVENTS                                      │  │
│  │                                                                          │  │
│  │  • window.onDidChangeActiveTextEditor                                    │  │
│  │  • window.onDidChangeTextEditorSelection                                 │  │
│  │  • languages.onDidChangeDiagnostics                                      │  │
│  │  • workspace.onDidSaveTextDocument                                       │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ Event Fires                                │
│                                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    ContextPusher.ts                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  constructor(bridge: VsCodeBridge)                                 │  │  │
│  │  │                                                                    │  │  │
│  │  │  start(): void {                                                   │  │  │
│  │  │    this.disposables.push(                                          │  │  │
│  │  │      onDidChangeActiveTextEditor(debounce(() =>                    │  │  │
│  │  │        this.pushActiveFile(), 200)),                               │  │  │
│  │  │      onDidChangeTextEditorSelection(debounce(() =>                 │  │  │
│  │  │        this.pushSelection(), 300)),                                │  │  │
│  │  │      onDidChangeDiagnostics(debounce(() =>                         │  │  │
│  │  │        this.pushDiagnostics(), 500))                               │  │  │
│  │  │    )                                                               │  │  │
│  │  │  }                                                                 │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ Debounced (200-500ms)                     │
│                                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    Event Aggregation                                     │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  private emit(type: string, payload: unknown): void {              │  │  │
│  │  │    for (const cb of this.callbacks) {                              │  │  │
│  │  │      try { cb(type, payload) } catch { /* ignore */ }              │  │  │
│  │  │    }                                                               │  │  │
│  │  │  }                                                                 │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ Callback Invocation                        │
│                                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    HttpServer.ts (Per-Session)                           │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  pusher.onPush((type, payload) => {                                │  │  │
│  │  │    session.transport.send({                                        │  │  │
│  │  │      jsonrpc: '2.0',                                               │  │  │
│  │  │      method: 'notifications/message',                              │  │  │
│  │  │      params: { level: type, data: payload }                        │  │  │
│  │  │    })                                                              │  │  │
│  │  │  })                                                                │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ MCP Notification                           │
│                                   ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      AI AGENT RECEIVES CONTEXT                           │  │
│  │                                                                          │  │
│  │  {                                                                       │  │
│  │    jsonrpc: "2.0",                                                       │  │
│  │    method: "notifications/message",                                      │  │
│  │    params: {                                                             │  │
│  │      level: "active_file_changed",                                       │  │
│  │      data: { path: "/src/index.ts", content: "..." }                     │  │
│  │    }                                                                     │  │
│  │  }                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Tool Call Sequence

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  Agent  │     │ HttpServer   │     │   Tool      │     │  vscode-api  │     │  VS Code │
│         │     │              │     │   Handler   │     │              │     │   APIs   │
└────┬────┘     └──────┬───────┘     └──────┬──────┘     └──────┬───────┘     └────┬─────┘
     │                 │                    │                   │                  │
     │ 1. Tool Call    │                    │                   │                  │
     │────────────────▶│                    │                   │                  │
     │                 │                    │                   │                  │
     │                 │ 2. Route           │                   │                  │
     │                 │───────────────────▶│                   │                  │
     │                 │                    │                   │                  │
     │                 │                    │ 3. Execute        │                  │
     │                 │                    │──────────────────▶│                  │
     │                 │                    │                   │                  │
     │                 │                    │                   │ 4. VS Code API   │
     │                 │                    │                   │─────────────────▶│
     │                 │                    │                   │                  │
     │                 │                    │                   │                  │
     │                 │                    │ 5. Result         │                  │
     │                 │                    │◀──────────────────│                  │
     │                 │                    │                   │                  │
     │                 │ 6. MCP Response    │                   │                  │
     │                 │◀───────────────────│                   │                  │
     │                 │                    │                   │                  │
     │ 7. Tool Result  │                    │                   │                  │
     │◀────────────────│                    │                   │                  │
     │                 │                    │                   │                  │
```

### Context Push Sequence

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────┐
│ VS Code  │     │ContextPusher│     │ HttpServer   │     │  Session    │     │  Agent  │
│  Event   │     │             │     │              │     │             │     │         │
└────┬─────┘     └──────┬──────┘     └──────┬───────┘     └──────┬──────┘     └────┬────┘
     │                  │                   │                    │                 │
     │ Editor Event     │                   │                    │                 │
     │─────────────────▶│                   │                    │                 │
     │                  │                   │                    │                 │
     │                  │ Debounce (200ms)  │                    │                 │
     │                  │────────┐          │                    │                 │
     │                  │        │          │                    │                 │
     │                  │◀───────┘          │                    │                 │
     │                  │                   │                    │                 │
     │                  │ Emit Callback     │                    │                 │
     │                  │──────────────────▶│                    │                 │
     │                  │                   │                    │                 │
     │                  │                   │ MCP Notification   │                 │
     │                  │                   │───────────────────▶│                 │
     │                  │                   │                    │                 │
     │                  │                   │                    │ SSE Push        │
     │                  │                   │                    │────────────────▶│
     │                  │                   │                    │                 │
```

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT DEPENDENCIES                                  │
│                                                                                 │
│                                                                                 │
│  extension.ts                                                                   │
│      │                                                                          │
│      ├─▶ Settings ─────────────────────────────────────────────────────┐       │
│      │                                                                  │       │
│      ├─▶ VsCodeBridge (facade) ──┬─▶ workspace/*                       │       │
│      │                           ├─▶ window/*                          │       │
│      │                           ├─▶ languages/*                       │       │
│      │                           └─▶ commands/*                        │       │
│      │                                                                  │       │
│      ├─▶ ContextPusher ──────────┴─▶ (uses bridge methods)             │       │
│      │                                                                  │       │
│      ├─▶ TerminalManager ────────────▶ (uses child_process)            │       │
│      │                                                                  │       │
│      └─▶ HttpServer ──┬─▶ Tool Registry ──▶ commands/*                 │       │
│                       │       │                                         │       │
│                       │       └─▶ (each command uses vscode-api/*)     │       │
│                       │                                                 │       │
│                       └─▶ ContextPusher (for push callbacks)           │       │
│                                                                         │       │
│                       ┌─────────────────────────────────────────────────┘       │
│                       │                                                         │
│                       ▼                                                         │
│                vscode-api/* ──▶ VS Code Extension APIs                          │
│                                                                                 │
│                                                                                 │
│  Legend:                                                                        │
│  ──▶  : Depends on / Calls                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## External System Interfaces

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTERFACES                                        │
│                                                                                 │
│                                                                                 │
│  1. MCP PROTOCOL (HTTP/SSE)                                                    │
│     ┌─────────────────────────────────────────────────────────────────────┐    │
│     │  Endpoint: http://127.0.0.1:3333/sse                               │    │
│     │  Protocol: MCP over SSE                                            │    │
│     │  Auth: Bearer token (optional)                                     │    │
│     │                                                                      │    │
│     │  Messages:                                                         │    │
│     │  • Tool calls (agent → server)                                     │    │
│     │  • Tool results (server → agent)                                   │    │
│     │  • Notifications (server → agent, context push)                    │    │
│     └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  2. VS CODE EXTENSION API                                                      │
│     ┌─────────────────────────────────────────────────────────────────────┐    │
│     │  vscode.workspace.*                                                 │    │
│     │  vscode.window.*                                                    │    │
│     │  vscode.languages.*                                                 │    │
│     │  vscode.commands.*                                                  │    │
│     │  vscode.env.*                                                       │    │
│     └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  3. VS CODE GIT EXTENSION API                                                  │
│     ┌─────────────────────────────────────────────────────────────────────┐    │
│     │  vscode.extensions.getExtension('vscode.git')                      │    │
│     │  git.getAPI(1)                                                      │    │
│     │  Repository.*                                                       │    │
│     └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  4. NODE.JS CHILD_PROCESS                                                      │
│     ┌─────────────────────────────────────────────────────────────────────┐    │
│     │  exec() - For git commands and terminal commands                   │    │
│     │  (when terminalStrategy: childProcess)                             │    │
│     └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  5. VS CODE TERMINAL API                                                       │
│     ┌─────────────────────────────────────────────────────────────────────┐    │
│     │  vscode.window.createTerminal()                                    │    │
│     │  vscode.window.onDidEndTerminalShellExecution                       │    │
│     │  (when terminalStrategy: shellIntegration)                         │    │
│     └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          TECHNOLOGY STACK                                       │
│                                                                                 │
│  Runtime:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  • Node.js (bundled with VS Code)                                      │   │
│  │  • TypeScript 5.7+                                                     │   │
│  │  • ES Modules (ESM)                                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  VS Code:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  • @types/vscode ^1.110.0                                             │   │
│  │  • vscode engine ^1.93.0                                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  MCP Protocol:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  • @modelcontextprotocol/sdk ^1.28.0                                  │   │
│  │  • StreamableHTTPServerTransport                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Schema Validation:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  • Zod ^4.3.6 (runtime validation)                                     │   │
│  │  • js-yaml (YAML parsing for tool definitions)                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Build:                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  • esbuild ^0.27.4 (bundling)                                          │   │
│  │  • TypeScript (type checking)                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Linting:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  • ESLint ^10.1.0                                                      │   │
│  │  • typescript-eslint ^8.57.2                                          │   │
│  │  • @eslint/js ^10.0.1                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

### Layers (Top to Bottom)

| Layer | Components | Responsibility |
|-------|------------|----------------|
| **Extension** | `extension.ts`, `Settings` | Lifecycle, VS Code commands, orchestration |
| **MCP** | `HttpServer`, `Tool Registry`, `commands/*` | Protocol, tool registration, handlers |
| **VSCode-API** | `workspace/*`, `window/*`, `languages/*`, `commands/*` | VS Code API abstraction |
| **Services** | `ContextPusher`, `TerminalManager` | Cross-cutting business logic |
| **External** | VS Code APIs, Git Extension, Node.js | Platform interfaces |

### Key Design Decisions

1. **One folder per tool** - Easy to add/remove/modify tools
2. **Declarative YAML definitions** - Source of truth for tool schemas
3. **Auto-generated code** - Schema, index, registry from YAML
4. **Layered architecture** - Clear separation of concerns
5. **Context pushing** - Automatic event aggregation and push to agents
