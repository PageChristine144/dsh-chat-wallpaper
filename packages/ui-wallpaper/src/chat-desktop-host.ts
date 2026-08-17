/**
 * Host-side transparent-chat-desktop control: locate the shell app (the
 * Electron transparent window), spawn/close it from the webserver routes the
 * browser button calls, and track its main-process pid through a temp pid file
 * the shell writes at startup. The shell itself is a plain Electron app that
 * loads the chat GUI; this seam makes it feel like a plugin toggle.
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

/** Plugin config for the transparent chat desktop. */
export interface ChatDesktopConfig {
  /** Absolute path of the shell app directory (contains package.json + main.js). */
  appDir?: string
  /** Absolute path of the electron executable (defaults to the app's node_modules). */
  electronPath?: string
}

/**
 * Default shell app directory: walk up from the working directory and the
 * config root looking for `<root>/tools/chat-desktop` (with a main.js). The
 * config root (`ctx.baseUrl`) is the profile dir, not the repo, so the repo
 * root is found by walking up from cwd.
 */
export function resolveAppDir(baseUrl: string | undefined, config: ChatDesktopConfig): string {
  if (config.appDir !== undefined) return config.appDir
  const roots = [process.cwd(), ...(baseUrl !== undefined ? [stripFileUrl(baseUrl)] : [])]
  for (const root of roots) {
    for (let dir = root; ;) {
      const candidate = join(dir, 'tools', 'chat-desktop')
      if (existsSync(join(candidate, 'main.js'))) return candidate
      const parent = dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  }
  return join(stripFileUrl(baseUrl ?? process.cwd()), 'tools', 'chat-desktop')
}

/** Normalize a `file:///` URL into a plain absolute path (ctx.baseUrl form). */
function stripFileUrl(value: string): string {
  if (value.startsWith('file:///')) return value.slice('file:///'.length)
  return value
}

/** Default electron executable inside the shell app. */
export function resolveElectronPath(appDir: string, config: ChatDesktopConfig): string {
  return config.electronPath ?? join(appDir, 'node_modules', 'electron', 'dist', 'electron.exe')
}

/** Temp pid file the shell writes at startup (same value as its app.getPath('temp')). */
export function shellPidFile(): string {
  return join(tmpdir(), 'dsh-chat-desktop.pid')
}

/** Whether a pid names a live process (Windows-compatible existence probe). */
export function isPidAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

/** The shell's main-process pid, or undefined when the shell is not running. */
export function readShellPid(): number | undefined {
  return readShellPidFromFile(shellPidFile())
}

/** Read a shell pid file: the pid when it names a live process, else undefined. */
export function readShellPidFromFile(pidFile: string): number | undefined {
  try {
    const pid = Number.parseInt(readFileSync(pidFile, 'utf8').trim(), 10)
    return isPidAlive(pid) ? pid : undefined
  } catch {
    return undefined
  }
}

/**
 * Open the transparent shell (idempotent): if its pid file names a live
 * process, it is already open. Otherwise spawn the electron app detached.
 * @param baseUrl - config tree root used to locate the shell app by default.
 * @param config - plugin chat-desktop config.
 * @returns whether the shell is open, and the reason when it cannot start.
 */
export function openShell(
  baseUrl: string | undefined,
  config: ChatDesktopConfig,
): { ok: boolean; alreadyOpen?: boolean; reason?: string; electronPath?: string } {
  const existing = readShellPid()
  if (existing !== undefined) return { ok: true, alreadyOpen: true }
  const appDir = resolveAppDir(baseUrl, config)
  const electronPath = resolveElectronPath(appDir, config)
  if (!existsSync(electronPath)) {
    return { ok: false, reason: 'electron-not-installed', electronPath }
  }
  if (!existsSync(join(appDir, 'main.js'))) {
    return { ok: false, reason: 'shell-app-missing', electronPath }
  }
  const child = spawn(electronPath, ['.'], { cwd: appDir, detached: true, stdio: 'ignore' })
  child.unref()
  return { ok: true }
}

/**
 * Close the transparent shell (idempotent): first restore the desktop state
 * the clear-screen changed (un-minimize the recorded windows — the opaque
 * chat window returns — and show desktop icons), then kill the shell process
 * tree and clear its pid file.
 * @param baseUrl - config tree root used to locate the shell app by default.
 * @param config - plugin chat-desktop config.
 * @returns whether the shell is closed, and the reason when it cannot be.
 */
export function closeShell(
  baseUrl: string | undefined,
  config: ChatDesktopConfig,
): { ok: boolean; alreadyClosed?: boolean; reason?: string } {
  const pid = readShellPid()
  if (pid === undefined) return { ok: true, alreadyClosed: true }
  // Bring the chat window back before the shell dies: only the recorded
  // windows whose title marks the chat (the regular chat browser) are
  // restored; other apps stay minimized. Icons are shown again.
  const script = join(resolveAppDir(baseUrl, config), 'clear-screen.ps1')
  if (existsSync(script)) {
    spawnSync('powershell.exe', [
      '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script,
      'restore-chat', String(pid), join(tmpdir(), 'dsh-chat-desktop-state.json'),
    ], { stdio: 'ignore' })
  }
  const result = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' })
  if (result.status !== 0 && result.status !== null) {
    return { ok: false, reason: `taskkill-failed:${result.status}` }
  }
  try {
    rmSync(shellPidFile(), { force: true })
  } catch {
    // Best effort; the shell removes its own pid file on quit.
  }
  return { ok: true }
}
