// @vitest-environment jsdom
/** WindowControls behavior: renders only inside the transparent shell bridge
 *  (window.desktopShell), drives minimize / toggle-maximize / close, and keeps
 *  the maximize glyph in sync with the shell's maximize state. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import {
  WindowControls, type DesktopShellBridge, type WindowControlsProps,
} from '../src/client/WindowControls.tsx'
import { createWallpaperStore } from '../src/client/store.ts'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); delete window.desktopShell })

const COPY: Record<string, string> = {
  'window.controls': 'Window controls',
  'window.minimize': 'Minimize',
  'window.maximize': 'Maximize',
  'window.restore': 'Restore',
  'window.close': 'Close',
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

function mount() {
  const store = createWallpaperStore().create()
  const props: WindowControlsProps = {
    sessionId: 's1',
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
  } as unknown as WindowControlsProps
  render(<WindowControls {...props} />)
  return props
}

/** Install a fake shell bridge on window.desktopShell. */
function installShell(overrides: Partial<DesktopShellBridge> = {}): DesktopShellBridge {
  const bridge: DesktopShellBridge = {
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn(() => Promise.resolve(false)),
    onMaximizedChange: vi.fn(() => () => {}),
    ...overrides,
  }
  window.desktopShell = bridge
  return bridge
}

describe('WindowControls', () => {
  it('renders nothing outside the transparent shell', () => {
    mount()
    expect(screen.queryByRole('group', { name: 'Window controls' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Minimize' })).toBeNull()
  })

  it('renders minimize/maximize/close inside the shell', () => {
    installShell()
    mount()
    expect(screen.getByRole('group', { name: 'Window controls' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Minimize' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Maximize' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy()
  })

  it('calls minimize / toggle-maximize / close on click', () => {
    const bridge = installShell()
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Minimize' }))
    expect(bridge.minimize).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Maximize' }))
    expect(bridge.toggleMaximize).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(bridge.close).toHaveBeenCalledTimes(1)
  })

  it('reflects the maximize state and subscribes to changes', async () => {
    let listener: ((maximized: boolean) => void) | undefined
    const bridge = installShell({
      isMaximized: vi.fn(() => Promise.resolve(true)),
      onMaximizedChange: vi.fn(((cb: (maximized: boolean) => void) => { listener = cb; return () => {} })),
    })
    mount()
    // Initial async state lands as Restore (maximized).
    expect(await screen.findByRole('button', { name: 'Restore' })).toBeTruthy()
    expect(bridge.isMaximized).toHaveBeenCalledTimes(1)
    // A later shell event flips the glyph back to Maximize.
    act(() => { listener?.(false) })
    expect(screen.getByRole('button', { name: 'Maximize' })).toBeTruthy()
  })

  it('unsubscribes from maximize changes on unmount', () => {
    const unsubscribe = vi.fn()
    installShell({ onMaximizedChange: vi.fn(() => unsubscribe) })
    const store = createWallpaperStore().create()
    const props: WindowControlsProps = {
      sessionId: 's1',
      useSessions: emptySessions(),
      useWorkspaces: emptyWorkspaces(),
      useStore: bindSnapshotSelector(store),
      actions: store.actions,
      t: (key: string) => COPY[key] ?? key,
    } as unknown as WindowControlsProps
    const { unmount } = render(<WindowControls {...props} />)
    unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
