import * as vscode from 'vscode'
import { spawn, type ChildProcess } from 'child_process'
import * as os from 'os'

const MAX_BUFFER_SIZE = 128 * 1024 // 128 KB per terminal
const MAX_COMMANDS = 10 // keep last 10 commands per terminal

interface CapturedCommand {
  command: string
  output: string
  exitCode: number | null
  startedAt: number
  finishedAt: number | null
  truncated: boolean
}

interface ManagedTerminal {
  id: string
  name: string
  process: ChildProcess
  terminal: vscode.Terminal
  writeEmitter: vscode.EventEmitter<string>
  cwd: string
  createdAt: number
  commands: CapturedCommand[]
  // Rolling output buffer for the entire terminal lifetime
  outputBuffer: string
  alive: boolean
}

export class TerminalManager {
  private terminals = new Map<string, ManagedTerminal>()
  private nextId = 1

  dispose(): void {
    for (const [, t] of this.terminals) {
      t.process.kill('SIGTERM')
      t.writeEmitter.dispose()
    }
    this.terminals.clear()
  }

  spawn(name: string, command?: string, cwd?: string): { id: string; name: string; pid: number | undefined } {
    const id = `term_${this.nextId++}`
    const workingDir = cwd ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd()
    const shell = process.env.SHELL || (os.platform() === 'win32' ? 'cmd.exe' : '/bin/sh')

    const writeEmitter = new vscode.EventEmitter<string>()
    const closeEmitter = new vscode.EventEmitter<number | void>()

    const pty: vscode.Pseudoterminal = {
      onDidWrite: writeEmitter.event,
      onDidClose: closeEmitter.event,
      open: () => {},
      close: () => {
        this.kill(id)
      },
      handleInput: (data: string) => {
        const managed = this.terminals.get(id)
        if (managed?.alive) {
          managed.process.stdin?.write(data)
        }
      },
    }

    const terminal = vscode.window.createTerminal({ name: name || `Task ${id}`, pty })
    terminal.show(true) // preserve focus

    // Spawn the shell process
    const proc = spawn(shell, ['-l'], {
      cwd: workingDir,
      env: { ...process.env, TERM: 'xterm-256color' },
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const managed: ManagedTerminal = {
      id,
      name: name || `Task ${id}`,
      process: proc,
      terminal,
      writeEmitter,
      cwd: workingDir,
      createdAt: Date.now(),
      commands: [],
      outputBuffer: '',
      alive: true,
    }

    this.terminals.set(id, managed)

    // Pipe stdout to both buffer and terminal display
    proc.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      this.appendOutput(managed, text)
      writeEmitter.fire(text.replace(/\n/g, '\r\n'))
    })

    proc.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      this.appendOutput(managed, text)
      writeEmitter.fire(text.replace(/\n/g, '\r\n'))
    })

    proc.on('exit', (code) => {
      managed.alive = false
      writeEmitter.fire(`\r\n[Process exited with code ${code}]\r\n`)
      closeEmitter.fire(code ?? undefined)
    })

    proc.on('error', (err) => {
      managed.alive = false
      writeEmitter.fire(`\r\n[Process error: ${err.message}]\r\n`)
      closeEmitter.fire(1)
    })

    // If a command was provided, send it immediately
    if (command) {
      this.sendCommand(id, command)
    }

    return { id, name: managed.name, pid: proc.pid }
  }

  sendCommand(id: string, command: string): boolean {
    const managed = this.terminals.get(id)
    if (!managed || !managed.alive) return false

    // Track the command
    const entry: CapturedCommand = {
      command,
      output: '',
      exitCode: null,
      startedAt: Date.now(),
      finishedAt: null,
      truncated: false,
    }
    managed.commands.push(entry)
    if (managed.commands.length > MAX_COMMANDS) {
      managed.commands.shift()
    }

    managed.process.stdin?.write(command + '\n')
    return true
  }

  list(): Array<{
    id: string
    name: string
    pid: number | undefined
    alive: boolean
    cwd: string
    createdAt: number
    bufferSize: number
  }> {
    return Array.from(this.terminals.values()).map(t => ({
      id: t.id,
      name: t.name,
      pid: t.process.pid,
      alive: t.alive,
      cwd: t.cwd,
      createdAt: t.createdAt,
      bufferSize: t.outputBuffer.length,
    }))
  }

  readOutput(id: string, lines?: number): { output: string; alive: boolean; totalBytes: number } | null {
    const managed = this.terminals.get(id)
    if (!managed) return null

    let output = managed.outputBuffer
    if (lines !== undefined && lines > 0) {
      const allLines = output.split('\n')
      output = allLines.slice(-lines).join('\n')
    }

    return {
      output,
      alive: managed.alive,
      totalBytes: managed.outputBuffer.length,
    }
  }

  write(id: string, input: string): boolean {
    const managed = this.terminals.get(id)
    if (!managed || !managed.alive) return false
    managed.process.stdin?.write(input)
    return true
  }

  kill(id: string, signal: NodeJS.Signals = 'SIGTERM'): boolean {
    const managed = this.terminals.get(id)
    if (!managed) return false

    if (managed.alive) {
      managed.process.kill(signal)
      managed.alive = false
    }
    this.terminals.delete(id)
    return true
  }

  getTerminal(id: string): ManagedTerminal | undefined {
    return this.terminals.get(id)
  }

  private appendOutput(managed: ManagedTerminal, text: string): void {
    managed.outputBuffer += text

    // Ring buffer: keep the tail when we exceed max size
    if (managed.outputBuffer.length > MAX_BUFFER_SIZE) {
      managed.outputBuffer = managed.outputBuffer.slice(-MAX_BUFFER_SIZE)
    }
  }
}
