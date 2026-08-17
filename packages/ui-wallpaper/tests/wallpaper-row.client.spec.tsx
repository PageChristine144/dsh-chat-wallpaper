// @vitest-environment jsdom
/** WallpaperRow behavior: mode chips, upload decode path, URL apply, slider
 * binding, auto-adapt toggle + manual color palette, font/weight chips, and
 * turn-off. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { WallpaperRow, type WallpaperRowComponentProps } from '../src/client/WallpaperRow.tsx'
import { createWallpaperStore } from '../src/client/store.ts'
import { DEFAULT_WALLPAPER_SETTINGS, type WallpaperSettings } from '../src/wallpaper-settings.ts'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

const COPY: Record<string, string> = {
  'title': 'Chat background',
  'mode.none': 'Off', 'mode.image': 'Image', 'mode.url': 'URL', 'mode.desktop': 'Desktop',
  'upload': 'Upload image', 'uploadHint': 'PNG / JPG, max 10 MB',
  'urlPlaceholder': 'https://…', 'apply': 'Apply',
  'blur': 'Blur', 'dim': 'Dim', 'translucency': 'Translucency', 'opacity': 'Opacity', 'outline': 'Outline',
  'codeBackground.on': 'Code bg: on', 'codeBackground.off': 'Code bg: off',
  'color.ink': 'Ink', 'color.snow': 'Snow', 'color.silver': 'Silver', 'color.rosegold': 'Rose gold',
  'color.champagne': 'Champagne', 'color.azure': 'Azure', 'color.violet': 'Violet', 'color.mint': 'Mint',
  'color.coral': 'Coral', 'color.lemon': 'Lemon', 'color.seablue': 'Sea blue', 'color.blossom': 'Blossom',
  'color.grape': 'Grape',
  'font': 'Font', 'font.system': 'System', 'font.serif': 'Serif', 'font.mono': 'Mono', 'font.rounded': 'Rounded',
  'we.title': 'Wallpaper Engine',
  'turnOff': 'Turn off wallpaper',
  'error.tooLarge': 'File too large', 'error.decode': 'Could not read',
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

function mount(settings: Partial<WallpaperSettings> = {}, injected: Partial<WallpaperRowComponentProps> = {}) {
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
  const applyImageFile = vi.fn()
  const applyWeWallpaper = vi.fn(async () => true)
  const setWeKey = vi.fn()
  // The Wallpaper Engine gallery always loads the host list; keep it quiet.
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ items: [] }),
  } as Response)))
  const props: WallpaperRowComponentProps = {
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    setMode, setValue, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight,
    setTextColor, setTextOpacity, setTextOutline, setCodeBackground,
    applyImageFile, applyWeWallpaper, setWeKey,
    ...injected,
  }
  render(<WallpaperRow {...props} />)
  return {
    store, setMode, setValue, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight,
    setTextColor, setTextOpacity, setTextOutline, setCodeBackground,
    applyImageFile, applyWeWallpaper, setWeKey,
  }
}

describe('WallpaperRow', () => {
  it('renders the title and mode chips with Off selected by default', () => {
    mount()
    expect(screen.getByText('Chat background')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Off' }).getAttribute('aria-pressed')).toBe('true')
    // The palette renders in every non-desktop mode, off included, so the
    // text color is always reachable.
    expect(screen.getByText('Ink')).toBeDefined()
  })

  it('mode chips drive setMode', () => {
    const b = mount({ mode: 'image' })
    fireEvent.click(screen.getByRole('button', { name: 'URL' }))
    expect(b.setMode).toHaveBeenCalledWith('url')
    fireEvent.click(screen.getByRole('button', { name: 'Desktop' }))
    expect(b.setMode).toHaveBeenCalledWith('desktop')
  })

  it('upload decodes the file and applies the data URL', async () => {
    const b = mount({ mode: 'image' })
    b.applyImageFile.mockResolvedValueOnce({ ok: true, dataUrl: 'data:image/jpeg;base64,OK' })
    const input = document.querySelector('input[type="file"]')!
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } })
    await act(async () => { await Promise.resolve() })
    expect(b.applyImageFile).toHaveBeenCalledOnce()
    expect(b.setValue).toHaveBeenCalledWith('data:image/jpeg;base64,OK')
    expect(b.setMode).toHaveBeenCalledWith('image')
  })

  it('upload surfaces a localized error when decode fails', async () => {
    const b = mount({ mode: 'image' })
    b.applyImageFile.mockResolvedValueOnce({ ok: false, reason: 'too-large' })
    const input = document.querySelector('input[type="file"]')!
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } })
    await act(async () => { await Promise.resolve() })
    expect(screen.getByText('File too large')).toBeDefined()
    expect(b.setValue).not.toHaveBeenCalled()
  })

  it('URL apply trims and writes value + mode', () => {
    const b = mount({ mode: 'url' })
    fireEvent.change(screen.getByPlaceholderText('https://…'), { target: { value: '  https://example.com/a.png  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(b.setValue).toHaveBeenCalledWith('https://example.com/a.png')
    expect(b.setMode).toHaveBeenCalledWith('url')
  })

  it('sliders bind to the numeric fields', () => {
    const b = mount({ mode: 'image', value: 'data:image/jpeg;base64,AA==', blur: 4, dim: 0.35, surfaceAlpha: 0.82, textOpacity: 80, textOutline: 2 })
    const sliders = screen.getAllByRole('slider')
    // blur / dim / translucency / depth / outline.
    expect(sliders).toHaveLength(5)
    fireEvent.change(sliders[0]!, { target: { value: '12' } })
    expect(b.setBlur).toHaveBeenCalledWith(12)
    fireEvent.change(sliders[1]!, { target: { value: '0.2' } })
    expect(b.setDim).toHaveBeenCalledWith(0.2)
    fireEvent.change(sliders[2]!, { target: { value: '0.9' } })
    expect(b.setSurfaceAlpha).toHaveBeenCalledWith(0.9)
    fireEvent.change(sliders[3]!, { target: { value: '55' } })
    expect(b.setTextOpacity).toHaveBeenCalledWith(55)
    fireEvent.change(sliders[4]!, { target: { value: '2.5' } })
    expect(b.setTextOutline).toHaveBeenCalledWith(2.5)
    // Fine 0.1 steps are honored by the outline slider.
    fireEvent.change(sliders[4]!, { target: { value: '1.1' } })
    expect(b.setTextOutline).toHaveBeenCalledWith(1.1)
  })

  it('manual palette swatches drive setTextColor', () => {
    const b = mount({ mode: 'image' })
    fireEvent.click(screen.getByRole('button', { name: 'Azure' }))
    expect(b.setTextColor).toHaveBeenCalledWith('azure')
    fireEvent.click(screen.getByRole('button', { name: 'Mint' }))
    expect(b.setTextColor).toHaveBeenCalledWith('mint')
  })

  it('font and weight chips drive setTextFont and setTextWeight', () => {
    const b = mount({ mode: 'image' })
    fireEvent.click(screen.getByRole('button', { name: 'Rounded' }))
    expect(b.setTextFont).toHaveBeenCalledWith('rounded')
    fireEvent.click(screen.getByRole('button', { name: '700' }))
    expect(b.setTextWeight).toHaveBeenCalledWith(700)
  })

  it('code-background toggle drives setCodeBackground', () => {
    const b = mount({ mode: 'image' })
    fireEvent.click(screen.getByRole('button', { name: 'Code bg: on' }))
    expect(b.setCodeBackground).toHaveBeenCalledWith(false)
  })

  it('turn-off drives setMode(none)', () => {
    const b = mount({ mode: 'image' })
    fireEvent.click(screen.getByRole('button', { name: 'Turn off wallpaper' }))
    expect(b.setMode).toHaveBeenCalledWith('none')
  })

  it('desktop mode shows only the hint and the turn-off', () => {
    mount({ mode: 'desktop', surfaceAlpha: 0.6 })
    expect(screen.getByText('desktop.hint')).toBeDefined()
    expect(screen.queryAllByRole('slider')).toHaveLength(0)
    expect(screen.queryByText('mode.desktop')).toBeNull()
    expect(screen.getByRole('button', { name: 'Turn off wallpaper' })).toBeDefined()
  })
})
