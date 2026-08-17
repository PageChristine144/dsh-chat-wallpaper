/** Host-side Wallpaper Engine switching: project application via the CLI
 *  control seam (process probing/spawning are injected, never exercised live). */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyWeProject, setWeAudio, type WeApplySeam } from '../src/we-apply.ts'

/** Temp engine dirs created per run. */
const dirs: string[] = []
function makeEngine(): { engineDir: string; projectDir: string } {
  const root = mkdtempSync(join(tmpdir(), 'ui-wallpaper-apply-'))
  dirs.push(root)
  const engineDir = join(root, 'engine')
  const projectDir = join(root, 'project')
  // engine exe + a project with project.json
  mkdirSync(engineDir, { recursive: true })
  mkdirSync(projectDir, { recursive: true })
  writeFileSync(join(engineDir, 'wallpaper64.exe'), 'x')
  writeFileSync(join(projectDir, 'project.json'), '{"title":"t"}')
  return { engineDir, projectDir }
}

afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true })
  dirs.length = 0
})

function fakeSeam(overrides: Partial<WeApplySeam> = {}): WeApplySeam {
  return {
    isWeRunning: vi.fn(() => true),
    startEngine: vi.fn(),
    runControl: vi.fn(() => ({ status: 0 })),
    ...overrides,
  }
}

describe('applyWeProject', () => {
  it('sends the openWallpaper control command with the project.json path', () => {
    const { engineDir, projectDir } = makeEngine()
    const seam = fakeSeam()
    const result = applyWeProject(engineDir, projectDir, seam)
    expect(result).toEqual({ ok: true })
    expect(seam.runControl).toHaveBeenCalledWith(
      engineDir,
      ['-control', 'openWallpaper', '-file', join(projectDir, 'project.json')],
    )
    // Already running: the engine is NOT started again.
    expect(seam.startEngine).not.toHaveBeenCalled()
  })

  it('starts a dead engine before sending the control command', () => {
    const { engineDir, projectDir } = makeEngine()
    const seam = fakeSeam({ isWeRunning: vi.fn(() => false) })
    const result = applyWeProject(engineDir, projectDir, seam)
    expect(result).toEqual({ ok: true })
    expect(seam.startEngine).toHaveBeenCalledWith(engineDir)
    expect(seam.runControl).toHaveBeenCalledTimes(1)
  })

  it('fails cleanly when project.json is missing or the engine is not installed', () => {
    const { engineDir } = makeEngine()
    const missing = join(engineDir, '..', 'no-project')
    mkdirSync(missing, { recursive: true })
    expect(applyWeProject(engineDir, missing, fakeSeam())).toEqual({ ok: false, reason: 'project-json-missing' })
    const bare = join(engineDir, '..', 'bare')
    mkdirSync(bare, { recursive: true })
    writeFileSync(join(bare, 'project.json'), '{}')
    expect(applyWeProject(bare, bare, fakeSeam())).toEqual({ ok: false, reason: 'engine-not-found' })
  })

  it('reports a non-zero control exit as a failure', () => {
    const { engineDir, projectDir } = makeEngine()
    const seam = fakeSeam({ runControl: vi.fn(() => ({ status: 1 })) })
    expect(applyWeProject(engineDir, projectDir, seam)).toEqual({ ok: false, reason: 'control-failed:1' })
  })
})

describe('setWeAudio', () => {
  it('sends mute / unmute control commands', () => {
    const { engineDir } = makeEngine()
    const seam = fakeSeam()
    expect(setWeAudio(engineDir, true, seam)).toEqual({ ok: true })
    expect(seam.runControl).toHaveBeenCalledWith(engineDir, ['-control', 'mute'])
    expect(setWeAudio(engineDir, false, seam)).toEqual({ ok: true })
    expect(seam.runControl).toHaveBeenCalledWith(engineDir, ['-control', 'unmute'])
  })

  it('starts a dead engine before sending the audio control', () => {
    const { engineDir } = makeEngine()
    const seam = fakeSeam({ isWeRunning: vi.fn(() => false) })
    expect(setWeAudio(engineDir, true, seam)).toEqual({ ok: true })
    expect(seam.startEngine).toHaveBeenCalledWith(engineDir)
  })

  it('fails cleanly when the engine is not installed or control errors', () => {
    const { engineDir } = makeEngine()
    const bare = join(engineDir, '..', 'bare')
    mkdirSync(bare, { recursive: true })
    expect(setWeAudio(bare, true, fakeSeam())).toEqual({ ok: false, reason: 'engine-not-found' })
    const seam = fakeSeam({ runControl: vi.fn(() => ({ status: 2 })) })
    expect(setWeAudio(engineDir, true, seam)).toEqual({ ok: false, reason: 'control-failed:2' })
  })
})
