// @vitest-environment jsdom
/** WallpaperButton + WallpaperPanel behavior: header button toggles the
 * portaled panel, panel controls drive the runtime writes, close button and
 * Escape dismiss. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { WallpaperButton, type WallpaperButtonComponentProps } from '../src/client/WallpaperButton.tsx'
import { createWallpaperStore } from '../src/client/store.ts'
import { DEFAULT_WALLPAPER_SETTINGS, type WallpaperSettings } from '../src/wallpaper-settings.ts'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

const COPY: Record<string, string> = {
  'title': 'Chat background',
  'switch': 'Switch wallpaper',
  'blur': 'Blur', 'dim': 'Dim', 'translucency': 'Translucency', 'opacity': 'Opacity', 'outline': 'Outline',
  'codeBackground.on': 'Code bg: on', 'codeBackground.off': 'Code bg: off',
  'color.ink': 'Ink', 'color.snow': 'Snow', 'color.silver': 'Silver', 'color.rosegold': 'Rose gold',
  'color.champagne': 'Champagne', 'color.azure': 'Azure', 'color.violet': 'Violet', 'color.mint': 'Mint',
  'color.coral': 'Coral', 'color.lemon': 'Lemon', 'color.seablue': 'Sea blue', 'color.blossom': 'Blossom',
  'color.grape': 'Grape',
  'font': 'Font', 'font.system': 'System', 'font.serif': 'Serif', 'font.mono': 'Mono', 'font.rounded': 'Rounded',
  'we.title': 'Wallpaper Engine',
  'audio.on': 'Sound on', 'audio.muted': 'Sound off',
  'mode.desktop': 'Desktop',
  'turnOff': 'Turn off wallpaper',
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
  const setValue = vi.fn()
  const setBlur = vi.fn()
  const setDim = vi.fn()
  const setSurfaceAlpha = vi.fn()
  const setTextFont = vi.fn()
  const setTextWeight = vi.fn()
  const setTextColor = vi.fn()
  const setTextOpacity = vi.fn()
  const setTextOutline = vi.fn()
  const setCodeBackground = vi.fn()
  const setWeAudioMuted = vi.fn()
  const applyImageFile = vi.fn()
  const applyWeWallpaper = vi.fn(async () => true)
  const setWeKey = vi.fn()
  // The panel hosts the WE gallery which loads the host list; keep it quiet.
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ items: [] }),
  } as Response)))
  const props: WallpaperButtonComponentProps = {
    sessionId: 's1',
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    setMode, setValue, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight,
    setTextColor, setTextOpacity, setTextOutline, setCodeBackground,
    setWeAudioMuted, applyImageFile, applyWeWallpaper, setWeKey,
  } as unknown as WallpaperButtonComponentProps
  render(<WallpaperButton {...props} />)
  return {
    store, setMode, setValue, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight,
    setTextColor, setTextOpacity, setTextOutline, setCodeBackground, applyWeWallpaper, setWeKey,
  }
}

describe('WallpaperButton', () => {
  it('renders the switch button; the panel is closed by default', () => {
    mount()
    expect(screen.getByRole('button', { name: 'Switch wallpaper' })).toBeDefined()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens the panel on click and the palette drives setTextColor', () => {
    const b = mount({ mode: 'image' })
    fireEvent.click(screen.getByRole('button', { name: 'Switch wallpaper' }))
    expect(screen.getByRole('dialog')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Azure' }))
    expect(b.setTextColor).toHaveBeenCalledWith('azure')
  })

  it('panel sliders and turn-off drive the runtime writes', () => {
    const b = mount({ mode: 'image', blur: 0, dim: 0.35, surfaceAlpha: 0.82 })
    fireEvent.click(screen.getByRole('button', { name: 'Switch wallpaper' }))
    const sliders = screen.getAllByRole('slider')
    fireEvent.change(sliders[0]!, { target: { value: '20' } })
    expect(b.setBlur).toHaveBeenCalledWith(20)
    fireEvent.click(screen.getByRole('button', { name: 'Turn off wallpaper' }))
    expect(b.setMode).toHaveBeenCalledWith('none')
  })

  it('desktop mode hides the wallpaper-layer sliders but keeps the text ones', () => {
    mount({ mode: 'desktop', surfaceAlpha: 0.6 })
    fireEvent.click(screen.getByRole('button', { name: 'Switch wallpaper' }))
    expect(screen.getByRole('dialog')).toBeDefined()
    // blur/dim/translucency are hidden in desktop mode; the color-depth and
    // text-outline sliders stay (text legibility applies in every mode).
    expect(screen.queryAllByRole('slider')).toHaveLength(2)
  })

  it('close button dismisses the panel', () => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Switch wallpaper' }))
    expect(screen.getByRole('dialog')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Escape dismisses the panel', () => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Switch wallpaper' }))
    expect(screen.getByRole('dialog')).toBeDefined()
    act(() => { fireEvent.keyDown(document, { key: 'Escape' }) })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
