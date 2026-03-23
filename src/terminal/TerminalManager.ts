import * as vscode from 'vscode'
import { spawn, type ChildProcess } from 'child_process'
import * as os from 'os'
import { log } from '../utils/logger.js'

const MAX_BUFFER_SIZE = 128 * 1024 // 128 KB per terminal

// Try to load node-pty for full interactive terminal support
let pty: typeof import('node-pty') | null = null
try {
  pty = require('node-pty')
  log.info('Terminal', 'node-pty loaded successfully')
} catch (err) {
  log.info('Terminal', 'node-pty not available, using child_process fallback', (err as Error).message)
}

interface ManagedTerminal {
  id: string
  name: string
  process: ChildProcess | import('node-pty').IPty
  terminal: vscode.Terminal
  writeEmitter: vscode.EventEmitter<string>
  cwd: string
  createdAt: number
  outputBuffer: string
  alive: boolean
  usePty: boolean
}

export class TerminalManager {
  private terminals = new Map<string, ManagedTerminal>()
  private nextId = 1

  get hasPty(): boolean {
    return pty !== null
  }

  dispose(): void {
    for (const [, t] of this.terminals) {
      this.killProcess(t)
      t.writeEmitter.dispose()
    }
    this.terminals.clear()
  }

  spawn(name: string, command?: string, cwd?: string): { id: string; name: string; pid: number | undefined; mode: string } {
    const id = `term_${this.nextId++}`
    const workingDir = cwd ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd()
    const shell = process.env.SHELL || (os.platform() === 'win32' ? 'cmd.exe' : '/bin/sh')

    const writeEmitter = new vscode.EventEmitter<string>()
    const closeEmitter = new vscode.EventEmitter<number | void>()

    const ptyHandler: vscode.Pseudoterminal = {
      onDidWrite: writeEmitter.event,
      onDidClose: closeEmitter.event,
      open: () => {},
      close: () => {
        this.kill(id)
      },
      handleInput: (data: string) => {
        const managed = this.terminals.get(id)
        if (!managed?.alive) return
        if (managed.usePty) {
          (managed.process as import('node-pty').IPty).write(data)
        } else {
          (managed.process as ChildProcess).stdin?.write(data)
        }
      },
    }

    const terminal = vscode.window.createTerminal({ name: name || `Task ${id}`, pty: ptyHandler })
    terminal.show(true)

    let proc: ChildProcess | import('node-pty').IPty | null = null
    let usePty = false

    if (pty) {
      // node-pty available — try full interactive terminal
      try {
        const args = command ? ['-c', command] : []
        log.debug('Terminal', `Attempting node-pty spawn: ${shell} ${args.join(' ')}`, { cwd: workingDir })
        proc = pty.spawn(shell, args, {
          cwd: workingDir,
          env: process.env as Record<string, string>,
          cols: 120,
          rows: 30,
        })
        usePty = true
        log.info('Terminal', `Spawned via node-pty: ${id} (pid: ${proc.pid})`)
      } catch (err) {
        log.warn('Terminal', `node-pty spawn failed, falling back to child_process`, (err as Error).message)
      }
    }

    if (!proc) {
      // Fallback to child_process
      const spawnArgs: [string, string[]] = command
        ? [shell, ['-c', command]]
        : [shell, []]
      log.debug('Terminal', `Spawning via child_process: ${spawnArgs[0]} ${spawnArgs[1].join(' ')}`, { cwd: workingDir })
      proc = spawn(spawnArgs[0], spawnArgs[1], {
        cwd: workingDir,
        env: { ...process.env, TERM: 'xterm-256color' },
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      log.info('Terminal', `Spawned via child_process: ${id} (pid: ${proc.pid})`)
    }

    const managed: ManagedTerminal = {
      id,
      name: name || `Task ${id}`,
      process: proc,
      terminal,
      writeEmitter,
      cwd: workingDir,
      createdAt: Date.now(),
      outputBuffer: '',
      alive: true,
      usePty,
    }

    this.terminals.set(id, managed)

    if (usePty) {
      const ptyProc = proc as import('node-pty').IPty
      ptyProc.onData((data: string) => {
        this.appendOutput(managed, data)
        writeEmitter.fire(data)
      })
      ptyProc.onExit(({ exitCode }: { exitCode: number }) => {
        managed.alive = false
        log.info('Terminal', `Process exited: ${id} (code: ${exitCode})`)
        writeEmitter.fire(`\r\n[Process exited with code ${exitCode}]\r\n`)
        closeEmitter.fire(exitCode)
      })
    } else {
      const cpProc = proc as ChildProcess
      cpProc.stdout?.on('data', (chunk: Buffer) => {
        const text = chunk.toString()
        this.appendOutput(managed, text)
        writeEmitter.fire(text.replace(/\n/g, '\r\n'))
      })
      cpProc.stderr?.on('data', (chunk: Buffer) => {
        const text = chunk.toString()
        this.appendOutput(managed, text)
        writeEmitter.fire(text.replace(/\n/g, '\r\n'))
      })
      cpProc.on('exit', (code) => {
        managed.alive = false
        log.info('Terminal', `Process exited: ${id} (code: ${code})`)
        writeEmitter.fire(`\r\n[Process exited with code ${code}]\r\n`)
        closeEmitter.fire(code ?? undefined)
      })
      cpProc.on('error', (err) => {
        managed.alive = false
        log.error('Terminal', `Process error: ${id}`, err.message)
        writeEmitter.fire(`\r\n[Process error: ${err.message}]\r\n`)
        closeEmitter.fire(1)
      })
    }

    return { id, name: managed.name, pid: proc.pid, mode: usePty ? 'pty' : 'pipe' }
  }

  list(): Array<{
    id: string
    name: string
    pid: number | undefined
    alive: boolean
    cwd: string
    createdAt: number
    bufferSize: number
    mode: string
  }> {
    return Array.from(this.terminals.values()).map(t => ({
      id: t.id,
      name: t.name,
      pid: t.process.pid,
      alive: t.alive,
      cwd: t.cwd,
      createdAt: t.createdAt,
      bufferSize: t.outputBuffer.length,
      mode: t.usePty ? 'pty' : 'pipe',
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
    if (managed.usePty) {
      (managed.process as import('node-pty').IPty).write(input)
    } else {
      (managed.process as ChildProcess).stdin?.write(input)
    }
    return true
  }

  kill(id: string, signal: NodeJS.Signals = 'SIGTERM'): boolean {
    const managed = this.terminals.get(id)
    if (!managed) return false

    if (managed.alive) {
      log.info('Terminal', `Killing terminal: ${id} (signal: ${signal})`)
      this.killProcess(managed, signal)
      managed.alive = false
    }
    this.terminals.delete(id)
    return true
  }

  private killProcess(managed: ManagedTerminal, signal: NodeJS.Signals = 'SIGTERM'): void {
    if (managed.usePty) {
      (managed.process as import('node-pty').IPty).kill(signal)
    } else {
      (managed.process as ChildProcess).kill(signal)
    }
  }

  private appendOutput(managed: ManagedTerminal, text: string): void {
    managed.outputBuffer += text
    if (managed.outputBuffer.length > MAX_BUFFER_SIZE) {
      managed.outputBuffer = managed.outputBuffer.slice(-MAX_BUFFER_SIZE)
    }
  }
}
