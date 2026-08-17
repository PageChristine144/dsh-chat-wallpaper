/** Transparent chat desktop host control: app/electron resolution, pid-file
 * readback, and the alive probe. (Spawn/kill themselves are thin wrappers over
 * child_process — exercised live, not unit-mocked.) */
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  isPidAlive, readShellPidFromFile, resolveAppDir, resolveElectronPath,
} from '../src/chat-desktop-host.ts'

describe('chat-desktop-host resolution', () => {
  it('prefers the explicit app dir and resolves the electron exe inside it', () => {
    expect(resolveAppDir('C:\\repo', { appDir: 'C:\\custom' })).toBe('C:\\custom')
    expect(resolveElectronPath('C:\\repo\\tools\\chat-desktop', {}))
      .toBe('C:\\repo\\tools\\chat-desktop\\node_modules\\electron\\dist\\electron.exe')
    expect(resolveElectronPath('C:\\app', { electronPath: 'C:\\e.exe' })).toBe('C:\\e.exe')
  })

  it('walks up from cwd to find a real shell app directory', () => {
    const found = resolveAppDir(undefined, {})
    // In the repo workspace the walk must locate tools/chat-desktop/main.js.
    expect(existsSync(join(found, 'main.js'))).toBe(true)
  })

  it('probes pid liveness without throwing', () => {
    expect(isPidAlive(0)).toBe(false)
    expect(isPidAlive(-5)).toBe(false)
    // A pid far above any real process is simply not alive.
    expect(isPidAlive(999999999)).toBe(false)
  })
})

describe('chat-desktop-host pid file', () => {
  const tempDirs: string[] = []
  afterEach(() => {
    for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true })
    tempDirs.length = 0
  })

  it('reads the pid file only when it names a live process', () => {
    const dir = mkdtempSync(join(tmpdir(), 'chat-desktop-host-'))
    tempDirs.push(dir)
    const pidFile = join(dir, 'shell.pid')
    writeFileSync(pidFile, String(process.pid))
    expect(readShellPidFromFile(pidFile)).toBe(process.pid)
    writeFileSync(pidFile, '999999999')
    expect(readShellPidFromFile(pidFile)).toBeUndefined()
  })
})
