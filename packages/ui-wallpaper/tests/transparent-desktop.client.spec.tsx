// @vitest-environment jsdom
/** TransparentDesktopButton behavior: opens/closes the shell via the host
 * routes and switches the wallpaper mode; selection follows the store. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { TransparentDesktopButton, type TransparentDesktopButtonProps } from '../src/client/TransparentDesktopButton.tsx'
import { createWallpaperStore } from '../src/client/store.ts'
import { DEFAULT_WALLPAPER_SETTINGS, type WallpaperSettings } from '../src/wallpaper-settings.ts'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

const COPY: Record<string, string> = {
  'desktop.transparent': 'Transparent desktop',
}

function emptySessions() {
  const store = createSnapshotStore<SessionListState>(
    { ids: [], byId: {}, current: undefined, phase: 'ready', subagentsByParent: {}, jobsBySession: {}, currentAddress: undefined })
  return bindSnapshotSelector(store)
}
function emptyWorkspaces() {
  const store = createSnapshotStore<WorkspaceListState>({
    items: [], archivedSessionIds: [], state: 'idle', phase: 'ready', error: null,
    baselinesReady: true, recentWorkspaceId: undefined,
  })
  return bindSnapshotSelector(store)
}

function mount(settings: Partial<WallpaperSettings> = {}) {
  const store = createWallpaperStore().create()
  store.actions.sync({ ...DEFAULT_WALLPAPER_SETTINGS, ...settings }, 0)
  const setMode = vi.fn()
  const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) } as Response))
  vi.stubGlobal('fetch', fetchMock)
  const props: TransparentDesktopButtonProps = {
    sessionId: 's1',
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    setMode,
  } as unknown as TransparentDesktopButtonProps
  render(<TransparentDesktopButton {...props} />)
  return { store, setMode, fetchMock }
}

describe('TransparentDesktopButton', () => {
  it('opens the shell and switches to desktop mode when inactive', async () => {
    const b = mount()
    expect(screen.getByRole('button', { name: 'Transparent desktop' }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'Transparent desktop' }))
    await act(async () => { await Promise.resolve() })
    expect(b.fetchMock).toHaveBeenCalledWith('/chat-desktop/open', { method: 'POST' })
    expect(b.setMode).toHaveBeenCalledWith('desktop')
  })

  it('closes the shell and leaves desktop mode when active', async () => {
    const b = mount({ mode: 'desktop' })
    expect(screen.getByRole('button', { name: 'Transparent desktop' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Transparent desktop' }))
    await act(async () => { await Promise.resolve() })
    expect(b.fetchMock).toHaveBeenCalledWith('/chat-desktop/close', { method: 'POST' })
    expect(b.setMode).toHaveBeenCalledWith('none')
  })

  it('keeps the mode untouched when the shell cannot open', async () => {
    const b = mount()
    b.fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: false, reason: 'electron-not-installed' }) } as Response)
    fireEvent.click(screen.getByRole('button', { name: 'Transparent desktop' }))
    await act(async () => { await Promise.resolve() })
    expect(b.setMode).not.toHaveBeenCalled()
  })
})
