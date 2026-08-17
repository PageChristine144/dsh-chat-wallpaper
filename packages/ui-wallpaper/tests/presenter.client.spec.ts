// @vitest-environment jsdom
/** WallpaperPresenter behavior: layer application per mode, blur/dim writes,
 * surface token overrides through the theme face, theme-change recompute,
 * auto-adaptive vs manual text ink, and full retraction on dispose. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ThemeSnapshot, ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'
import { WallpaperPresenter, defaultReadTokenBase, type ThemeFace } from '../src/client/presenter.ts'
import type { WallpaperSettings } from '../src/wallpaper-settings.ts'
import type { WallpaperSnapshot } from '../src/client/runtime.ts'
import { DEFAULT_WALLPAPER_SETTINGS } from '../src/wallpaper-settings.ts'

afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  document.documentElement.removeAttribute('style')
  delete window.desktopShell
  vi.unstubAllGlobals()
})

/** Pure surface token bases for both palettes, shared by the specs. */
const BASE = {
  light: {
    '--dsw-alias-bg-base': '#ffffff',
    '--dsw-specific-sidebar-fill': '#f2f3f5',
    '--dsw-alias-bg-layer-1': '#fafbfc',
    '--dsw-alias-bg-layer-2': '#f2f3f5',
    '--dsw-alias-bg-overlay': '#ffffff',
  },
  dark: {
    '--dsw-alias-bg-base': '#1a1c21',
    '--dsw-specific-sidebar-fill': '#22252b',
    '--dsw-alias-bg-layer-1': '#23262c',
    '--dsw-alias-bg-layer-2': '#2b2e35',
    '--dsw-alias-bg-overlay': '#26292f',
  },
}

const snap = (settings: Partial<WallpaperSettings>, revision = 1): WallpaperSnapshot => ({
  settings: { ...DEFAULT_WALLPAPER_SETTINGS, ...settings },
  revision,
})

const themeSnap = (revision = 0): ThemeSnapshot => ({
  preference: 'light',
  active: { id: 'light', colorScheme: 'light', tokens: {} },
  themes: [],
  revision,
})

/** Theme face stub: records override layers and increments revision per publish. */
function fakeTheme(initialRevision = 0) {
  let revision = initialRevision
  const layers = new Map<string, ThemeTokenOverrides>()
  const disposals: string[] = []
  const theme: ThemeFace = {
    overrideTokens: vi.fn((source: string, tokens: ThemeTokenOverrides) => {
      layers.set(source, tokens)
      revision += 1
      return () => {
        layers.delete(source)
        disposals.push(source)
        revision += 1
      }
    }),
    getTheme: () => ({ ...themeSnap(revision) }),
  }
  return { theme, layers, disposals, revision: () => revision }
}

const layer = (kind: 'image' | 'dim'): HTMLElement | null =>
  document.body.querySelector(`[data-wallpaper-layer="${kind}"]`)

const textStyle = (): HTMLStyleElement | null =>
  document.head.querySelector('[data-plugin-css="ui-wallpaper-text"]')

const rootVar = (name: string): string =>
  document.documentElement.style.getPropertyValue(name).trim()

describe('WallpaperPresenter', () => {
  it('applies an image wallpaper: layers visible, dim overlay, body attribute, transparent body background', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==' }), themeSnap())

    const image = layer('image')
    const dim = layer('dim')
    expect(image).not.toBeNull()
    expect(image!.style.visibility).toBe('visible')
    expect(dim!.style.backgroundColor).toBe('rgba(0, 0, 0, 0.35)')
    expect(document.body.dataset.wallpaperMode).toBe('image')
    expect(document.body.style.background).toBe('transparent')
    expect(image!.style.position).toBe('fixed')
    expect(image!.style.zIndex).toBe('-1')
    presenter.dispose()
  })

  it('pushes per-palette surface overrides through the theme face and leaves labels alone', () => {
    const { theme, layers } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', surfaceAlpha: 0.82 }), themeSnap())

    const tokens = layers.get('ui-wallpaper')!
    expect(tokens['--dsw-alias-bg-base']).toEqual({
      light: 'color-mix(in srgb, #ffffff 82%, transparent)',
      dark: 'color-mix(in srgb, #1a1c21 82%, transparent)',
    })
    // Label ink is derived per block by the adaptive stylesheet, not pushed.
    expect(tokens['--dsw-alias-label-primary']).toBeUndefined()
    presenter.dispose()
  })

  it('applies an image data URL and a remote URL as cover backgrounds', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==' }), themeSnap())
    // jsdom normalizes the shorthand position: 'center' 鈫?'center center'.
    expect(layer('image')!.style.background).toBe('url("data:image/jpeg;base64,AA==") center center / cover no-repeat')
    presenter.apply(snap({ mode: 'url', value: 'https://example.com/a.png' }, 2), themeSnap())
    expect(layer('image')!.style.background).toBe('url("https://example.com/a.png") center center / cover no-repeat')
    presenter.dispose()
  })

  it('renders a video wallpaper in the video layer and hides the image layer', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    const value = 'http://127.0.0.1:3080/wallpaper-engine/raw/workshop/1/a.mp4'
    presenter.apply(snap({ mode: 'url', value }), themeSnap())
    const video = document.body.querySelector<HTMLVideoElement>('[data-wallpaper-layer="video"]')!
    expect(video.style.visibility).toBe('visible')
    expect(video.getAttribute('src')).toBe(value)
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(true)
    expect(layer('image')!.style.visibility).toBe('hidden')
    presenter.dispose()
  })

  it('switching to an image value hides and releases the video layer', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'url', value: 'http://127.0.0.1:3080/wallpaper-engine/raw/workshop/1/a.mp4' }), themeSnap())
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==' }, 2), themeSnap())
    const video = document.body.querySelector<HTMLVideoElement>('[data-wallpaper-layer="video"]')!
    expect(video.style.visibility).toBe('hidden')
    expect(video.getAttribute('src')).toBeNull()
    expect(layer('image')!.style.visibility).toBe('visible')
    presenter.dispose()
  })

  it('applies blur to the active media layer for both images and videos', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'url', value: 'http://127.0.0.1:3080/wallpaper-engine/raw/workshop/1/a.mp4', blur: 8 }), themeSnap())
    const video = document.body.querySelector<HTMLVideoElement>('[data-wallpaper-layer="video"]')!
    expect(video.style.filter).toBe('blur(8px)')
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', blur: 8 }, 2), themeSnap())
    expect(layer('image')!.style.filter).toBe('blur(8px)')
    presenter.dispose()
  })

  it('desktop mode hides every wallpaper layer and the dim, with fully transparent surfaces', () => {
    const { theme, layers } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'desktop', surfaceAlpha: 0.6 }), themeSnap())
    expect(layer('image')!.style.visibility).toBe('hidden')
    expect(document.body.querySelector<HTMLVideoElement>('[data-wallpaper-layer="video"]')!.style.visibility).toBe('hidden')
    expect(layer('dim')!.style.visibility).toBe('hidden')
    expect(document.body.style.background).toBe('transparent')
    expect(document.body.dataset.wallpaperMode).toBe('desktop')
    const tokens = layers.get('ui-wallpaper')!
    // Surfaces are fully transparent (no milky tint) and labels stay adaptive.
    expect(tokens['--dsw-alias-bg-base']).toEqual({ light: 'rgba(0, 0, 0, 0)', dark: 'rgba(0, 0, 0, 0)' })
    expect(tokens['--dsw-alias-label-primary']).toBeUndefined()
    presenter.dispose()
  })

  it('blurs and scales the wallpaper layer when blur is set', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', blur: 8 }), themeSnap())
    expect(layer('image')!.style.filter).toBe('blur(8px)')
    expect(layer('image')!.style.transform).toBe('scale(1.2)')
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', blur: 0 }, 2), themeSnap())
    expect(layer('image')!.style.filter).toBe('')
    expect(layer('image')!.style.transform).toBe('')
    presenter.dispose()
  })

  it('mode none hides the layers and releases the override layer', () => {
    const { theme, layers, disposals } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==' }), themeSnap())
    expect(layers.has('ui-wallpaper')).toBe(true)
    presenter.apply(snap({ mode: 'none' }, 2), themeSnap())
    expect(layer('image')!.style.visibility).toBe('hidden')
    expect(layers.has('ui-wallpaper')).toBe(false)
    expect(disposals).toContain('ui-wallpaper')
    expect(document.body.dataset.wallpaperMode).toBeUndefined()
    presenter.dispose()
  })

  it('recomputes overrides on theme change with fresh token bases', () => {
    const { theme, layers } = fakeTheme()
    const readTokenBase = vi.fn()
      .mockReturnValueOnce(BASE)
      .mockReturnValueOnce({ light: BASE.light, dark: { ...BASE.dark, '--dsw-alias-bg-base': '#0f1114' } })
    const presenter = new WallpaperPresenter(theme, { readTokenBase })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==' }), themeSnap())
    expect(layers.get('ui-wallpaper')?.['--dsw-alias-bg-base']?.dark)
      .toBe('color-mix(in srgb, #1a1c21 82%, transparent)')

    presenter.onThemeChange(themeSnap(5))
    expect(layers.get('ui-wallpaper')?.['--dsw-alias-bg-base']?.dark)
      .toBe('color-mix(in srgb, #0f1114 82%, transparent)')
    expect(readTokenBase).toHaveBeenCalledTimes(2)
    presenter.dispose()
  })

  it('ignores self-echo theme snapshots (its own override publish)', () => {
    const { theme, layers, revision } = fakeTheme()
    const readTokenBase = vi.fn(() => BASE)
    const presenter = new WallpaperPresenter(theme, { readTokenBase })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==' }), themeSnap())
    const pushedRevision = revision()
    // The push published theme/change with exactly this revision 鈥?a self-echo.
    presenter.onThemeChange(themeSnap(pushedRevision))
    expect(readTokenBase).toHaveBeenCalledTimes(1)
    expect(layers.has('ui-wallpaper')).toBe(true)
    presenter.dispose()
  })

  it('manual text color applies the chosen palette ink inside the shell', () => {
    window.desktopShell = {} as unknown as NonNullable<typeof window.desktopShell>
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textColor: 'azure' }), themeSnap())
    expect(rootVar('--dsw-text-ink')).toBe('#5ea8f0')
    presenter.dispose()
  })

  it('outside the shell the ink is forced to the default black', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    // No window.desktopShell: the regular chat window after leaving desktop
    // mode must read black, regardless of the stored palette color.
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textColor: 'azure' }), themeSnap())
    expect(rootVar('--dsw-text-ink')).toBe('#1f2430')
    presenter.dispose()
  })

  it('applies the text-outline thickness through the root variable and body attribute', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textOutline: 1 }), themeSnap())
    expect(rootVar('--dsw-text-outline')).toBe('1')
    expect(document.body.dataset.dswOutline).toBe('1')
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textOutline: 0 }, 2), themeSnap())
    expect(rootVar('--dsw-text-outline')).toBe('0')
    expect(document.body.dataset.dswOutline).toBe('0')
    presenter.dispose()
  })

  it('applies the text opacity through the root variable', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textOpacity: 60 }), themeSnap())
    expect(rootVar('--dsw-text-opacity')).toBe('0.6')
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textOpacity: 100 }, 2), themeSnap())
    expect(rootVar('--dsw-text-opacity')).toBe('1')
    presenter.dispose()
  })

  it('flags the code-background toggle through a body attribute', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', codeBackground: true }), themeSnap())
    expect(document.body.dataset.dswCodeBg).toBe('on')
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', codeBackground: false }, 2), themeSnap())
    expect(document.body.dataset.dswCodeBg).toBe('off')
    presenter.dispose()
  })

  it('unknown manual color falls back to the default ink inside the shell', () => {
    window.desktopShell = {} as unknown as NonNullable<typeof window.desktopShell>
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textColor: 'nope' }), themeSnap())
    expect(rootVar('--dsw-text-ink')).toBe('#1f2430')
    presenter.dispose()
  })

  it('re-applying a new color updates the ink variable without duplicating the stylesheet', () => {
    window.desktopShell = {} as unknown as NonNullable<typeof window.desktopShell>
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textColor: 'mint' }), themeSnap())
    expect(rootVar('--dsw-text-ink')).toBe('#5fd6a8')
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textColor: 'coral' }, 2), themeSnap())
    expect(rootVar('--dsw-text-ink')).toBe('#ff7f6b')
    expect(document.head.querySelectorAll('[data-plugin-css="ui-wallpaper-text"]')).toHaveLength(1)
    presenter.dispose()
  })

  it('applies the font family and weight through root variables', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textFont: 'serif', textWeight: 700 }), themeSnap())
    expect(rootVar('--dsw-font-family')).toContain('Georgia')
    expect(rootVar('--dsw-font-weight-chat')).toBe('700')
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==', textFont: 'system', textWeight: 400 }, 2), themeSnap())
    expect(rootVar('--dsw-font-family')).toBe('')
    expect(rootVar('--dsw-font-weight-chat')).toBe('400')
    presenter.dispose()
  })

  it('injects the typography stylesheet once and retracts it on dispose', () => {
    const { theme } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==' }), themeSnap())
    const style = textStyle()
    expect(style).not.toBeNull()
    expect(style!.textContent).toContain('font-weight: var(--dsw-font-weight-chat)')
    // The outline rule sits on body (inherited) via -webkit-text-stroke, and
    // only matches while data-dsw-outline is non-zero; self-backgrounded
    // elements (code/pre/...) opt out.
    expect(style!.textContent).toContain('-webkit-text-stroke')
    expect(style!.textContent).toContain('data-dsw-outline')
    expect(style!.textContent).toContain('body code')
    // Every label tier derives from the ink so the color applies globally.
    expect(style!.textContent).toContain('--dsw-alias-label-tertiary')
    expect(style!.textContent).toContain('body[data-ds-dark-theme]')
    // Chat text keeps a white outline for wallpaper legibility.
    expect(style!.textContent).toContain('255, 255, 255')
    // The outline thickness scales with the --dsw-text-outline variable.
    expect(style!.textContent).toContain('--dsw-text-outline')
    // The opacity fades the ink toward transparent in every label tier.
    expect(style!.textContent).toContain('--dsw-text-opacity')
    // The code-background toggle routes the markdown code tokens to
    // transparent when off.
    expect(style!.textContent).toContain('data-dsw-code-bg')
    expect(style!.textContent).toContain('--dsw-alias-markdown-code-block')
    // Re-applying does not duplicate the stylesheet.
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==' }, 2), themeSnap())
    expect(document.head.querySelectorAll('[data-plugin-css="ui-wallpaper-text"]')).toHaveLength(1)
    presenter.dispose()
    expect(textStyle()).toBeNull()
  })

  it('dispose removes the layers, the override, the attribute, and the body background', () => {
    const { theme, disposals } = fakeTheme()
    const presenter = new WallpaperPresenter(theme, { readTokenBase: () => BASE })
    presenter.apply(snap({ mode: 'image', value: 'data:image/jpeg;base64,AA==' }), themeSnap())
    presenter.dispose()
    expect(layer('image')).toBeNull()
    expect(layer('dim')).toBeNull()
    expect(disposals).toContain('ui-wallpaper')
    expect(document.body.dataset.wallpaperMode).toBeUndefined()
    expect(document.body.style.background).toBe('')
    expect(rootVar('--dsw-font-weight-chat')).toBe('')
  })

  it('defaultReadTokenBase probes both palettes through the dark attribute', () => {
    const values: Record<string, string> = {
      '--dsw-alias-bg-base': '#111111',
      '--dsw-specific-sidebar-fill': '#222222',
      '--dsw-alias-bg-layer-1': '#333333',
      '--dsw-alias-bg-layer-2': '#444444',
      '--dsw-alias-bg-overlay': '#555555',
    }
    const darkValues: Record<string, string> = {
      '--dsw-alias-bg-base': '#eeeeee',
      '--dsw-specific-sidebar-fill': '#dddddd',
      '--dsw-alias-bg-layer-1': '#cccccc',
      '--dsw-alias-bg-layer-2': '#bbbbbb',
      '--dsw-alias-bg-overlay': '#aaaaaa',
    }
    const read = (map: Record<string, string>) => ({
      getPropertyValue: (name: string) => map[name] ?? '',
    })
    const computed = vi.fn((_element: Element) => {
      return document.body.hasAttribute('data-ds-dark-theme') ? read(darkValues) : read(values)
    })
    vi.stubGlobal('getComputedStyle', computed)
    const base = defaultReadTokenBase()
    expect(base.light['--dsw-alias-bg-base']).toBe('#111111')
    expect(base.dark['--dsw-alias-bg-base']).toBe('#eeeeee')
    expect(document.body.hasAttribute('data-ds-dark-theme')).toBe(false)
  })
})
