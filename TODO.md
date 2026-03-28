# TODO: MCP Bridge Expansion

## Diagnostics API Enhancements
The `get_diagnostics` tool needs to be expanded to mirror full LSP capabilities and provide more granular control for agents.

- [ ] **Git-Based Diagnostics**: Filter results to only show errors/warnings in files changed in the current Git branch.
- [ ] **Delta Diagnostics**: Only report diagnostics that have appeared since the last tool call.
- [ ] **Open Files Only**: Explicitly limit diagnostic scope to currently open editor tabs.
- [ ] **Workspace-Wide Diagnostics**: Trigger a full project analysis (pull-based) if the language server supports it.
- [ ] **Folder-Based Scoping**:
    - [ ] Non-recursive: Diagnostics for files directly within a specific directory.
    - [ ] Recursive: Diagnostics for an entire sub-tree.
- [ ] **LSP Push/Pull Mirroring**: Better alignment with LSP 3.17 `textDocument/diagnostic` specifications.

## General Improvements
- [ ] Expose more LSP 3.17 features (Completions, Implementation, etc.)
- [ ] Add more Window API features (User notifications, Input boxes)
- [ ] **Beyond Compare Integration**: Add a tool to launch "Beyond Compare" for external file diffing, providing an alternative to VS Code's internal diff.
- [ ] **Performance Benchmarking**: Compare latency and reliability of MCP-driven operations (e.g., `open_file`, `get_diagnostics`) vs. traditional agent command execution methods.

## Future AI Assistant Features (MCP Roadmap)
New tools that would significantly enhance the intelligence and agency of connected AI assistants.

- [ ] **Workspace-Wide Text Search**: Bridge to VS Code's optimized ripgrep-based text search for fast code cross-referencing.
- [ ] **Real-time Event Streaming**: Pushing file system events (save/delete/move) and custom extension events to agents.
- [ ] **Terminal Process Intelligence**: Tool to list child processes and resource usage (CPU/Mem) for managed terminals.
- [ ] **Extension Inspector**: Allow agents to list installed extensions and versions to verify the target environment (e.g. check if Prettier or ESLint is present).
- [ ] **Editor Decoration Bridge**: Allow agents to "draw" or highlight lines in the actual VS Code UI to visually explain their logic.
- [ ] **Bulk Code Actions**: Trigger "Fix All" commands for specific files or warning categories.
- [ ] **Git Native Integration**: Dedicated tools for `git commit`, `git checkout`, and branch management without manual shell commands.
- [ ] **Output Channel Bridge**: Allow agents to "tail" specific output channels like "TypeScript" or "Prettier" for background logs.
- [ ] **Global Repo Mapping**: Implement a `get_repo_map` tool that provides a ranked, token-optimized summary of the whole project (similar to Aider's `repomap`) using LSP symbol data and dependency graph analysis.
