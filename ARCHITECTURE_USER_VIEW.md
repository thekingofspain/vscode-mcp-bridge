# VS Code MCP Bridge - User Perspective Architecture

## Overview

This extension exposes VS Code's capabilities to AI coding agents via the **Model Context Protocol (MCP)**. Think of it as a bridge that lets AI agents "see" and "interact" with your VS Code environment.

---

## High-Level Architecture (User View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI CODING AGENT                                     │
│         (Cursor, Cline, Roo Code, or any MCP-compatible client)             │
│                                                                             │
│         "Read the active file"                                              │
│         "Find all references to this function"                              │
│         "Run npm test and show me the output"                               │
│         "Show me diagnostics in this folder"                                │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ MCP Protocol (HTTP/SSE)
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VS CODE MCP BRIDGE EXTENSION                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      MCP HTTP SERVER                                 │   │
│  │                      Port 3333 (default)                             │   │
│  │                                                                      │   │
│  │  Connection URL: http://127.0.0.1:3333/sse                          │   │
│  │  Authentication: Bearer token (optional)                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    37 EXPOSED TOOLS                                  │   │
│  │                                                                      │   │
│  │  📁 FILES              👁️ EDITOR            🧠 LSP INTELLIGENCE      │   │
│  │  • get_active_file     • show_diff          • get_diagnostics       │   │
│  │  • get_selection       • show_message       • find_references       │   │
│  │  • get_open_tabs       • show_quick_pick    • go_to_definition      │   │
│  │  • read_file           • request_input      • get_completions       │   │
│  │  • write_file          • add_decoration     • get_hover             │   │
│  │  • create_file                              • get_symbols           │   │
│  │  • delete_file                              • code_actions          │   │
│  │  • open_file                                • rename_symbol         │   │
│  │  • close_file                                                    │   │
│  │                                                                      │   │
│  │  💻 TERMINAL           🔧 GIT               🏢 WORKSPACE             │   │
│  │  • run_command         • git_action         • get_workspace_info    │   │
│  │  • spawn_terminal        - commit             • get_repo_map        │   │
│  │  • list_terminals        - checkout           • execute_command     │   │
│  │  • read_terminal         - branch                                      │   │
│  │  • write_terminal        - status                                       │   │
│  │  • kill_terminal                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   CONTEXT PUSHING (Auto-push)                        │   │
│  │                                                                      │   │
│  │  Automatically sends to connected agents:                            │   │
│  │  • Active file changes                                               │   │
│  │  • Selection changes                                                 │   │
│  │  • New diagnostics (errors/warnings)                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ VS Code Extension APIs
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VS CODE APPLICATION                                 │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Language   │  │    Window    │  │  Workspace   │  │   Terminal   │   │
│  │    Server    │  │      UI      │  │    Files     │  │   Commands   │   │
│  │   (LSP)      │  │              │  │              │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐                                        │
│  │  Git Extension│  │  Extensions  │                                        │
│  │    API       │  │   Commands   │                                        │
│  └──────────────┘  └──────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Connection Flow

```
┌──────────────┐                              ┌─────────────────────────┐
│  AI Agent    │                              │   VS Code Extension     │
│  (MCP Client)│                              │    (MCP Server)         │
└──────┬───────┘                              └───────────┬─────────────┘
       │                                                  │
       │  1. Connect to http://127.0.0.1:3333/sse        │
       │─────────────────────────────────────────────────▶│
       │                                                  │
       │  2. SSE Connection Established                   │
       │◀─────────────────────────────────────────────────│
       │                                                  │
       │  3. Initialize MCP Protocol                      │
       │─────────────────────────────────────────────────▶│
       │                                                  │
       │  4. List Available Tools (37 tools)              │
       │◀─────────────────────────────────────────────────│
       │                                                  │
       │  5. Ready for Tool Calls                         │
       │                                                  │
       │  6. Call Tool: read_file({ filePath: "..." })   │
       │─────────────────────────────────────────────────▶│
       │                                                  │
       │  7. Execute in VS Code, Return Result           │
       │◀─────────────────────────────────────────────────│
       │                                                  │
       │  8. (Optional) Auto-push context updates         │
       │◀─────────────────────────────────────────────────│
```

---

## Tool Categories & Use Cases

### 📁 File Operations

| Tool | User Says | Agent Does |
|------|-----------|------------|
| `get_active_file` | "What file am I looking at?" | Returns current file content + metadata |
| `read_file` | "Read src/index.ts" | Reads file content (optionally line range) |
| `write_file` | "Update the file with..." | Writes content with undo history |
| `create_file` | "Create a new test file" | Creates new file |
| `delete_file` | "Delete the old file" | Deletes file |
| `open_file` | "Open the config file" | Opens file in editor at position |
| `close_file` | "Close that file" | Closes file tab |

### 👁️ Editor UI

| Tool | User Says | Agent Does |
|------|-----------|------------|
| `show_diff` | "Show me what changed" | Opens diff view (non-destructive) |
| `show_message` | "Tell me when it's done" | Shows notification message |
| `show_quick_pick` | "Let me choose an option" | Shows dropdown selection |
| `request_input` | "Ask me for the class name" | Prompts for text input |
| `add_editor_decoration` | "Highlight those lines" | Adds visual highlight to editor |

### 🧠 LSP Intelligence

| Tool | User Says | Agent Does |
|------|-----------|------------|
| `get_diagnostics` | "What errors are there?" | Returns errors/warnings (filterable) |
| `find_references` | "Where is this used?" | Finds all references to symbol |
| `go_to_definition` | "Where is this defined?" | Jumps to definition location |
| `get_completions` | "What can I type here?" | Gets IntelliSense suggestions |
| `get_hover` | "What type is this?" | Gets type info on hover |
| `get_document_symbols` | "What's in this file?" | Lists all symbols in file |
| `get_code_actions` | "What fixes are available?" | Gets quick fixes/refactors |
| `apply_code_action` | "Apply the first fix" | Applies selected code action |
| `rename_symbol` | "Rename this variable" | Renames symbol across workspace |

### 💻 Terminal

| Tool | User Says | Agent Does |
|------|-----------|------------|
| `run_terminal_command` | "Run npm test" | Runs command, captures output |
| `spawn_terminal` | "Start the dev server" | Spawns long-running process |
| `list_terminals` | "What's running?" | Lists all managed terminals |
| `read_terminal` | "Show me the output" | Reads terminal output buffer |
| `write_terminal` | "Send 'q' to quit" | Sends input to terminal |
| `kill_terminal` | "Stop the server" | Kills terminal process |

### 🔧 Git

| Tool | User Says | Agent Does |
|------|-----------|------------|
| `git_action` | "Git status" | Runs git operation (status/commit/checkout/branch) |

### 🏢 Workspace

| Tool | User Says | Agent Does |
|------|-----------|------------|
| `get_workspace_info` | "What's in this workspace?" | Returns workspace folders |
| `get_repo_map` | "Give me an overview of the codebase" | AST-based symbol map |
| `execute_vscode_command` | "Format the document" | Executes any VS Code command |

---

## Context Pushing (Auto-Push Feature)

When enabled (default), the extension **automatically pushes** context to connected agents:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXT PUSH EVENTS                          │
│                                                                 │
│  User Action                    →  Agent Receives              │
│  ─────────────────────────────────────────────────────────────  │
│  Switch to different file       →  Active file content         │
│  Select some code             →  Selection snapshot            │
│  Error appears in Problems    →  New diagnostic                │
│  Save file                    →  Updated file content          │
│                                                                 │
│  Configurable via: mcpServer.enableContextPush (boolean)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Interface

### Status Bar Item

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Running:  [$(radio-tower) MCP :3333 | 1 agent]                │
│            ↑              ↑         ↑                          │
│            Icon           Port      Connected agents           │
│                                                                 │
│  Stopped:  [$(circle-slash) MCP Stopped]                       │
│                                                                 │
│  Error:    [$(error) MCP Error]                                │
│                                                                 │
│  Click status bar → Quick Pick Menu:                           │
│  • Connected agents: 1                                         │
│  • Copy connection URL                                         │
│  • Stop server                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Command Palette

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type:

```
> VS Code MCP Bridge: Start Server
> VS Code MCP Bridge: Stop Server
> VS Code MCP Bridge: Restart Server
> VS Code MCP Bridge: Copy Connection URL
> VS Code MCP Bridge: Show Status / Options
```

---

## Configuration Options

```jsonc
{
  // Port for the MCP server
  "mcpServer.port": 3333,
  
  // Automatically push context updates to agents
  "mcpServer.enableContextPush": true,
  
  // Bearer token for authentication (empty = no auth)
  "mcpServer.authToken": "",
  
  // VS Code commands allowed via execute_vscode_command tool
  "mcpServer.allowedCommands": [],
  
  // Terminal strategy: childProcess or shellIntegration
  "mcpServer.terminalStrategy": "childProcess"
}
```

---

## Example Agent Interactions

### Scenario 1: Fix a Bug

```
User: "There's a bug in the login function. Can you help?"

Agent (via MCP Bridge):
  1. get_active_file()           ← Gets current file
  2. get_diagnostics({scope: "open_files"})  ← Checks for errors
  3. find_references(filePath, line, char)   ← Finds all usages
  4. read_file(filePath)         ← Reads full file content
  5. show_diff(filePath, newContent)         ← Shows proposed fix
  6. write_file(filePath, content)           ← Applies fix (if approved)
  7. run_terminal_command("npm test")        ← Runs tests
  8. read_terminal(id, lines: 50)            ← Shows test output
```

### Scenario 2: Refactor Code

```
User: "Rename this variable everywhere it's used"

Agent (via MCP Bridge):
  1. get_selection()             ← Gets selected text
  2. rename_symbol(filePath, line, char, newName)  ← Renames across workspace
  3. get_diagnostics({scope: "workspace"})       ← Checks for errors
```

### Scenario 3: Explore Codebase

```
User: "I'm new here. What does this project do?"

Agent (via MCP Bridge):
  1. get_workspace_info()        ← Gets workspace structure
  2. get_repo_map()              ← Gets symbol map of entire repo
  3. search_workspace_symbols("Controller")  ← Finds controllers
  4. read_file(filePath)         ← Reads key files
```

---

## Security Considerations

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY MODEL                             │
│                                                                 │
│  🔒 Authentication                                              │
│     • Optional Bearer token (mcpServer.authToken)              │
│     • Required for all HTTP connections if set                 │
│                                                                 │
│  🔒 Allowed Commands                                            │
│     • execute_vscode_command requires explicit allowlist       │
│     • Empty list = no commands allowed (safe default)          │
│                                                                 │
│  🔒 Localhost Only                                              │
│     • Server binds to 127.0.0.1 (not public network)           │
│     • Only accessible from local machine                       │
│                                                                 │
│  🔒 User Confirmation                                           │
│     • Destructive operations (delete_file) require approval    │
│     • show_diff shows changes before write_file applies        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Connection String for AI Agents

```
MCP Server URL: http://127.0.0.1:3333/sse

Example MCP Client Configuration:

{
  "mcpServers": {
    "vscode": {
      "url": "http://127.0.0.1:3333/sse",
      "authToken": "your-token-here"  // If configured
    }
  }
}
```

---

## Summary

**What This Extension Does:**

1. **Exposes VS Code as an API** - 37 tools for AI agents to interact with your editor
2. **Bridges AI ↔ VS Code** - Translates MCP protocol calls into VS Code API actions
3. **Pushes Context Automatically** - Keeps agents informed of active file, selection, errors
4. **Runs Locally & Securely** - Localhost only, optional auth, command allowlisting

**Who Uses It:**

- **AI Coding Agents** (Cursor, Cline, Roo Code, etc.) - Connect via MCP protocol
- **VS Code Users** - Get AI assistance with full editor integration
- **Developers** - Automate repetitive tasks through AI + MCP Bridge

**Key Value:**

> "Your AI agent can now **see** what you see, **edit** what you edit, and **run** commands in your workspace — all through a standardized, secure API."
