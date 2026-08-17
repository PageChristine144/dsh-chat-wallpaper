/**
 * Host-side Wallpaper Engine switching: applies a wallpaper project through
 * the WE command-line control (`-control openWallpaper -file <project.json>`).
 * WE must be running for the control message to reach it, so a dead engine is
 * started first (detached, its own window). All spawns are best-effort and
 * never block the gateway.
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** Wallpaper Engine CLI executables (64-bit preferred, 32-bit fallback). */
const WE_EXECUTABLES = ['wallpaper64.exe', 'wallpaper32.exe']

/**
 * The Wallpaper Engine CLI invocation seam (injectable for specs): returns the
 * engine executable to run, or undefined when WE is not installed.
 */
export interface WeApplySeam {
  /** Probe whether a Wallpaper Engine process is already running. */
  isWeRunning: () => boolean
  /** Spawn the engine detached (returns immediately; used to wake a dead WE). */
  startEngine: (engineDir: string) => void
  /** Run one WE control command synchronously; resolved status + output. */
  runControl: (engineDir: string, args: readonly string[]) => { status: number | null }
}

/** Default seam: real process probing and spawning. */
export const defaultWeApplySeam: WeApplySeam = {
  isWeRunning: () => {
    const probe = spawnSync('tasklist', ['/FI', 'IMAGENAME eq wallpaper64.exe'], { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true })
    if (probe.status === 0 && /wallpaper64\.exe/i.test(probe.stdout.toString())) return true
    const probe32 = spawnSync('tasklist', ['/FI', 'IMAGENAME eq wallpaper32.exe'], { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true })
    return probe32.status === 0 && /wallpaper32\.exe/i.test(probe32.stdout.toString())
  },
  startEngine: (engineDir) => {
    const exe = WE_EXECUTABLES.find(name => existsSync(join(engineDir, name)))
    if (exe === undefined) return
    const child = spawn(join(engineDir, exe), [], { detached: true, stdio: 'ignore' })
    child.unref()
  },
  runControl: (engineDir, args) => {
    const exe = WE_EXECUTABLES.find(name => existsSync(join(engineDir, name)))
    if (exe === undefined) return { status: null }
    const result = spawnSync(join(engineDir, exe), args, { stdio: ['ignore', 'ignore', 'ignore'], windowsHide: true, timeout: 20_000 })
    return { status: result.status }
  },
}

/**
 * Apply one wallpaper project through Wallpaper Engine. The engine is started
 * first when it is not running, then the control command is sent. The call
 * never throws: every failure becomes a `{ ok: false, reason }` result.
 * @param engineDir - Wallpaper Engine install directory (resolveEngineRoot).
 * @param projectDir - the wallpaper project directory (contains project.json).
 * @param seam - injectable process seam (defaults to the real engine).
 * @returns whether the wallpaper was applied, plus a machine-readable reason.
 */
export function applyWeProject(
  engineDir: string,
  projectDir: string,
  seam: WeApplySeam = defaultWeApplySeam,
): { ok: boolean; reason?: string } {
  const projectJson = join(projectDir, 'project.json')
  if (!existsSync(projectJson)) return { ok: false, reason: 'project-json-missing' }
  if (!existsSync(join(engineDir, 'wallpaper64.exe')) && !existsSync(join(engineDir, 'wallpaper32.exe'))) {
    return { ok: false, reason: 'engine-not-found' }
  }
  if (!seam.isWeRunning()) seam.startEngine(engineDir)
  // The control message needs the engine to have finished booting; give a
  // freshly started engine a moment, then send the open command. spawnSync
  // quotes paths itself — do not add shell quotes to the argument.
  const args = ['-control', 'openWallpaper', '-file', projectJson]
  const result = seam.runControl(engineDir, args)
  if (result.status !== 0) return { ok: false, reason: `control-failed:${String(result.status)}` }
  return { ok: true }
}

/**
 * Mute or unmute all Wallpaper Engine wallpapers (`-control mute` /
 * `-control unmute`). The engine must be running for the control message to
 * reach it; a dead engine is started first (it resumes its last wallpaper).
 * @param engineDir - Wallpaper Engine install directory (resolveEngineRoot).
 * @param muted - true to mute, false to unmute.
 * @param seam - injectable process seam (defaults to the real engine).
 * @returns whether the audio control command was accepted.
 */
export function setWeAudio(
  engineDir: string,
  muted: boolean,
  seam: WeApplySeam = defaultWeApplySeam,
): { ok: boolean; reason?: string } {
  if (!existsSync(join(engineDir, 'wallpaper64.exe')) && !existsSync(join(engineDir, 'wallpaper32.exe'))) {
    return { ok: false, reason: 'engine-not-found' }
  }
  if (!seam.isWeRunning()) seam.startEngine(engineDir)
  const args = ['-control', muted ? 'mute' : 'unmute']
  const result = seam.runControl(engineDir, args)
  if (result.status !== 0) return { ok: false, reason: `control-failed:${String(result.status)}` }
  return { ok: true }
}
