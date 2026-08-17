/**
 * Global wallpaper DOM applier: projects a WallpaperSnapshot plus the current
 * ThemeSnapshot onto the document. It owns two fixed layers on `body` — the
 * wallpaper layer and the dim overlay — both behind the app (z-index -1), and
 * rides the theme plugin's official `theme.overrideTokens` extension point to
 * make the surface tokens translucent and retune the label colors. The
 * presenter only ever retracts what it wrote itself: layers it created, the
 * override layer it pushed, the body background it forced transparent, and
 * the body attribute it owns.
 *
 * Override values are concrete per-palette pairs, so a palette switch (or a
 * third-party theme) needs a recompute: on `theme/change` the presenter drops
 * its override layer first (the theme presenter re-applies the pure cascade),
 * re-reads the surface token bases for both palettes, and pushes a fresh
 * layer. Re-entrant publishes from those operations are absorbed by a guard
 * and a self-echo revision match.
 */
import type { ThemeSnapshot, ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'
import type { TextFont, TextWeight, WallpaperSettings } from '../wallpaper-settings.ts'
import { textColorById } from '../text-colors.ts'
import type { WallpaperSnapshot } from './runtime.ts'
import { isVideoUrl } from './we.ts'

/** The theme service surface this presenter consumes (ctx.theme in the app). */
export interface ThemeFace {
  /** Stack a token override layer; the disposer removes exactly this layer. */
  overrideTokens(source: string, tokens: ThemeTokenOverrides): () => void
  /** Current immutable theme snapshot (for self-echo revision matching). */
  getTheme(): ThemeSnapshot
}

/** Pure surface token values for both palettes, read before any wallpaper override. */
export interface SurfaceTokenBase {
  /** Token → declared value while the light base palette is active. */
  light: Readonly<Record<string, string>>
  /** Token → declared value while the dark base palette is active. */
  dark: Readonly<Record<string, string>>
}

/** Presenter seams; every one is injectable for specs and defaulted for the app. */
export interface WallpaperPresenterOptions {
  /** Read the pure surface token bases (default: computed-style read with a palette probe). */
  readTokenBase?: () => SurfaceTokenBase
}

/** Surface tokens made translucent over the wallpaper. */
const SURFACE_TOKENS = [
  '--dsw-alias-bg-base',
  '--dsw-specific-sidebar-fill',
  '--dsw-alias-bg-layer-1',
  '--dsw-alias-bg-layer-2',
  '--dsw-alias-bg-overlay',
  // The chat surfaces that stay opaque by default but should follow the
  // translucent treatment over a wallpaper: the user message bubble, the
  // "new session" button, the input bar, and elevated buttons.
  '--dsw-specific-bubble',
  '--dsw-specific-input-major',
  '--dsw-alias-button-elevated-fill',
  '--dsw-alias-button-floating-hover',
] as const

/** Built-in chat font stacks (high-contrast, wallpaper-friendly). */
const TEXT_FONT_STACKS: Record<TextFont, string> = {
  system: 'inherit',
  serif: 'Georgia, "Times New Roman", "Songti SC", "SimSun", serif',
  mono: '"Cascadia Code", Consolas, "JetBrains Mono", "Sarasa Mono SC", monospace',
  rounded: '"Segoe UI", "Microsoft YaHei UI", "PingFang SC", "HarmonyOS Sans SC", "MiSans", system-ui, sans-serif',
}

/** Override-layer source identity (also names the layer's origin for inspection). */
const OVERRIDE_SOURCE = 'ui-wallpaper'

/** Body attribute selecting the dark base palette in the token stylesheets. */
const DARK_ATTRIBUTE = 'data-ds-dark-theme'

/** Body attribute this presenter owns (paint mode for styling/debugging). */

/** Blur bleed compensation: scaling hides the transparent margin blur draws at edges. */
const BLUR_SCALE = 1.2

/** Fully transparent surface value for desktop-transparent mode. */
const TRANSPARENT = 'rgba(0, 0, 0, 0)'

/**
 * Read the pure surface token bases for both palettes from the live cascade:
 * the current palette as-is, the other palette by briefly toggling the dark
 * attribute (synchronous reads; the browser cannot paint mid-function, so the
 * probe is invisible).
 * @returns token bases keyed by palette.
 */
export function defaultReadTokenBase(): SurfaceTokenBase {
  const body = document.body
  const read = (): Record<string, string> => {
    const computed = getComputedStyle(body)
    const out: Record<string, string> = {}
    for (const name of SURFACE_TOKENS) out[name] = computed.getPropertyValue(name).trim()
    return out
  }
  const wasDark = body.hasAttribute(DARK_ATTRIBUTE)
  const current = read()
  let other: Record<string, string>
  if (wasDark) {
    body.removeAttribute(DARK_ATTRIBUTE)
    try { other = read() } finally { body.setAttribute(DARK_ATTRIBUTE, '') }
  } else {
    body.setAttribute(DARK_ATTRIBUTE, '')
    try { other = read() } finally { body.removeAttribute(DARK_ATTRIBUTE) }
  }
  return wasDark ? { light: other, dark: current } : { light: current, dark: other }
}

/**
 * Applies wallpaper snapshots to the document; one instance per plugin fiber.
 */
export class WallpaperPresenter {
  private readonly layer: HTMLDivElement
  private readonly videoLayer: HTMLVideoElement
  private readonly dimLayer: HTMLDivElement
  private readonly readTokenBase: () => SurfaceTokenBase
  private overrideDisposer: (() => void) | undefined
  private appliedThemeRevision: number | undefined
  private current: { wallpaper: WallpaperSnapshot; theme: ThemeSnapshot } | undefined
  private handlingThemeChange = false
  private ownsBodyBackground = false
  private textStyleTag: HTMLStyleElement | null = null

  /**
   * @param theme - theme service face (overrideTokens + getTheme).
   * @param options - injectable seams for specs.
   */
  constructor(
    private readonly theme: ThemeFace,
    options: WallpaperPresenterOptions = {},
  ) {
    this.readTokenBase = options.readTokenBase ?? defaultReadTokenBase
    this.layer = createLayer('image')
    this.videoLayer = createVideoLayer()
    this.dimLayer = createLayer('dim')
  }

  /**
   * Project a wallpaper snapshot onto the document: show/hide the layers,
   * apply blur/dim, force the body background transparent, and push the
   * surface/color override layer through the theme service.
   * @param wallpaper - resolved wallpaper snapshot from ctx.wallpaper.
   * @param theme - current theme snapshot from ctx.theme.
   */
  apply(wallpaper: WallpaperSnapshot, theme: ThemeSnapshot): void {
    this.current = { wallpaper, theme }
    const settings = wallpaper.settings
    // Text styling applies regardless of the wallpaper mode (it governs the
    // whole chat's legibility, not just the wallpaper layer).
    this.applyText(settings.textFont, settings.textWeight, settings.textColor, settings.textOpacity, settings.textOutline)
    // Markdown code chip/block backgrounds: on keeps the theme's code
    // backgrounds, off routes them to transparent (cleaner over a live
    // desktop wallpaper).
    document.body.dataset.dswCodeBg = settings.codeBackground ? 'on' : 'off'
    if (settings.mode === 'none') {
      this.hideLayers()
      this.releaseOverride()
      return
    }
    this.showLayers(settings)
    // Read the pure cascade: the previous override layer must be gone first.
    this.releaseOverride()
    this.pushOverride(settings)
  }

  /**
   * Recompute the override layer after a palette switch (theme/change). Drops
   * the stale layer, re-reads the pure bases, and pushes a fresh layer.
   * Self-echo publishes (from this presenter's own overrideTokens) and
   * re-entrant cascades are skipped.
   * @param snapshot - the theme snapshot that changed.
   */
  onThemeChange(snapshot: ThemeSnapshot): void {
    if (this.current === undefined || this.handlingThemeChange) return
    if (snapshot.revision === this.appliedThemeRevision) return
    this.handlingThemeChange = true
    try {
      this.releaseOverride()
      if (this.current.wallpaper.settings.mode === 'none') return
      this.pushOverride(this.current.wallpaper.settings)
    } finally {
      this.handlingThemeChange = false
    }
  }

  /** Retract every DOM write this presenter made. */
  dispose(): void {
    this.layer.remove()
    this.videoLayer.remove()
    this.dimLayer.remove()
    this.releaseOverride()
    delete document.body.dataset.wallpaperMode
    delete document.body.dataset.dswOutline
    delete document.body.dataset.dswCodeBg
    const root = document.documentElement
    root.style.removeProperty('--dsw-font-family')
    root.style.removeProperty('--dsw-font-weight-chat')
    root.style.removeProperty('--dsw-text-ink')
    root.style.removeProperty('--dsw-text-opacity')
    root.style.removeProperty('--dsw-text-outline')
    root.style.removeProperty('--dsw-text-halo')
    if (this.textStyleTag !== null) {
      this.textStyleTag.remove()
      this.textStyleTag = null
    }
    if (this.ownsBodyBackground) {
      document.body.style.removeProperty('background')
      this.ownsBodyBackground = false
    }
  }

  private showLayers(settings: WallpaperSettings): void {
    const layer = this.layer
    const video = this.videoLayer
    if (!layer.isConnected) document.body.append(layer, video, this.dimLayer)
    if (settings.mode === 'desktop') {
      // Desktop-transparent mode: no wallpaper layer at all — the surfaces
      // become translucent so whatever the OS renders behind the transparent
      // window (the desktop, Wallpaper Engine included) shows through.
      layer.style.visibility = 'hidden'
      video.style.visibility = 'hidden'
      this.pauseVideo()
      this.dimLayer.style.visibility = 'hidden'
    } else if (isVideoUrl(settings.value)) {
      // Video wallpaper: the video element is the media layer.
      layer.style.visibility = 'hidden'
      video.style.visibility = 'visible'
      if (video.getAttribute('src') !== settings.value) {
        video.setAttribute('src', settings.value)
        // Autoplay is muted + looped; a blocked play is not fatal (the video
        // stays visible and resumes on the next apply). Guarded because some
        // embedders (jsdom, older WebKit) throw instead of returning a promise.
        try {
          void video.play().catch(() => { /* muted autoplay may be deferred */ })
        } catch {
          /* media play unavailable */
        }
      }
      this.applyMediaEffects(video, settings)
      this.dimLayer.style.backgroundColor = `rgba(0, 0, 0, ${settings.dim})`
      this.dimLayer.style.visibility = 'visible'
    } else {
      // Image / url wallpaper: cover-center, no repeat — full-bleed.
      layer.style.visibility = 'visible'
      video.style.visibility = 'hidden'
      this.pauseVideo()
      layer.style.background = `url("${settings.value}") center / cover no-repeat`
      this.applyMediaEffects(layer, settings)
      this.dimLayer.style.backgroundColor = `rgba(0, 0, 0, ${settings.dim})`
      this.dimLayer.style.visibility = 'visible'
    }
    document.body.style.background = 'transparent'
    this.ownsBodyBackground = true
    document.body.dataset.wallpaperMode = settings.mode
  }

  /** Blur/scale the active media layer (blur bleeds at edges; scale hides the margin). */
  private applyMediaEffects(element: HTMLElement, settings: WallpaperSettings): void {
    if (settings.blur > 0) {
      element.style.filter = `blur(${settings.blur}px)`
      element.style.transform = `scale(${BLUR_SCALE})`
    } else {
      element.style.filter = ''
      element.style.transform = ''
    }
  }

  private hideLayers(): void {
    this.layer.style.visibility = 'hidden'
    this.videoLayer.style.visibility = 'hidden'
    this.pauseVideo()
    this.dimLayer.style.visibility = 'hidden'
    delete document.body.dataset.wallpaperMode
  }

  /** Stop playback and release the source (stops the network stream). */
  private pauseVideo(): void {
    const video = this.videoLayer
    if (video.getAttribute('src') === null) return
    try {
      video.pause()
      video.removeAttribute('src')
      video.load()
    } catch {
      /* media control unavailable (jsdom); the src removal still releases state */
      video.removeAttribute('src')
    }
  }

  private pushOverride(settings: WallpaperSettings): void {
    const base = this.readTokenBase()
    const alpha = settings.surfaceAlpha
    const tokens: ThemeTokenOverrides = {}
    if (settings.mode === 'desktop') {
      // Desktop-transparent mode: surfaces are FULLY transparent — the desktop
      // wallpaper shows through with no tint; only the theme's own text and
      // icons float over it.
      for (const name of SURFACE_TOKENS) {
        const light = base.light[name]
        const dark = base.dark[name]
        if (light === undefined || light === '' || dark === undefined || dark === '') continue
        tokens[name] = { light: TRANSPARENT, dark: TRANSPARENT }
      }
    } else {
      for (const name of SURFACE_TOKENS) {
        const light = base.light[name]
        const dark = base.dark[name]
        if (light === undefined || light === '' || dark === undefined || dark === '') continue
        tokens[name] = { light: mix(light, alpha), dark: mix(dark, alpha) }
      }
      // Label colors are NOT overridden here: the typography stylesheet
      // derives every label tier from --dsw-text-ink (the chosen palette
      // color), and chat text carries a white outline for wallpaper legibility.
    }
    this.overrideDisposer = this.theme.overrideTokens(OVERRIDE_SOURCE, tokens)
    this.appliedThemeRevision = this.theme.getTheme().revision
  }

  /**
   * Apply the chat typography on the document root: font family through the
   * theme's --dsw-font-family variable (so EVERY text node — historical and
   * new — inherits it) plus the chosen weight, and the label color policy.
   *
   * The chosen palette color becomes --dsw-text-ink and every label tier
   * derives from it (whole-app, both palettes), so the text color applies
   * globally; the opacity (--dsw-text-opacity, 0–1) fades the ink AND its
   * white outline together toward transparent. The outline is only rendered
   * while body[data-dsw-outline] is set to a non-zero value, so thickness 0
   * leaves no shadow at all (a zero-offset shadow would still hint at the
   * glyph edges through antialiasing).
   */
  private applyText(font: TextFont, weight: TextWeight, textColor: string, opacity: number, outline: number): void {
    const root = document.documentElement
    const stack = TEXT_FONT_STACKS[font]
    if (stack === 'inherit') {
      root.style.removeProperty('--dsw-font-family')
    } else {
      root.style.setProperty('--dsw-font-family', stack)
    }
    root.style.setProperty('--dsw-font-weight-chat', String(weight))
    const manual = textColorById(textColor)
    const ink = manual?.css ?? '#1f2430'
    root.style.setProperty('--dsw-text-ink', ink)
    root.style.setProperty('--dsw-text-opacity', String(opacity / 100))
    root.style.setProperty('--dsw-text-outline', String(outline))
    document.body.dataset.dswOutline = String(outline)
    // One owned stylesheet translating the custom properties into real text
    // rules (weight + label color policy + white outline), retracted on
    // dispose. The weight is forced on every text node (chat components
    // hard-code font-weight: 400); strong/b keep a relative bump so emphasis
    // stays visible.
    if (this.textStyleTag === null) {
      const tag = document.createElement('style')
      tag.dataset.plugin = OVERRIDE_SOURCE
      tag.dataset.pluginCss = 'ui-wallpaper-text'
      tag.textContent = [
        ':root {',
        '  --dsw-font-weight-chat: 400;',
        '}',
        'body, body * {',
        '  font-weight: var(--dsw-font-weight-chat) !important;',
        '}',
        // Emphasis stays visible on top of the chosen base weight.
        'body strong, body b, body th, body h1, body h2, body h3, body h4 {',
        '  font-weight: min(calc(var(--dsw-font-weight-chat) + 200), 900) !important;',
        '}',
        // Whole-app text ink: EVERY label tier derives from --dsw-text-ink so
        // the chosen palette color colors all text, not just the primary
        // labels, and the opacity fades it toward transparent. Both palette
        // selectors are listed to beat the theme's own body /
        // body[data-ds-dark-theme] token definitions (same specificity,
        // injected later wins). The ink/opacity values are set per apply above.
        'body, body[data-ds-dark-theme] {',
        '  --dsw-alias-label-primary: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 100%), transparent);',
        '  --dsw-alias-label-secondary: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 72%), transparent);',
        '  --dsw-alias-label-primary-dimmed: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 72%), transparent);',
        '  --dsw-alias-label-tertiary: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 55%), transparent);',
        '  --dsw-alias-label-caption: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 55%), transparent);',
        '  --dsw-alias-label-dimmed: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 40%), transparent);',
        '}',
        // Global white outline on ALL text: text-shadow is inherited, so one
        // rule on body reaches every text node. It only applies while
        // data-dsw-outline is present and not "0", so thickness 0 renders no
        // shadow at all; the thickness scales with --dsw-text-outline and the
        // shadow alpha follows --dsw-text-opacity so text and outline fade
        // together.
        'body[data-dsw-outline]:not([data-dsw-outline="0"]) {',
        '  text-shadow:',
        '    0 0 calc(var(--dsw-text-outline, 1) * 1.5px) rgba(255, 255, 255, calc(var(--dsw-text-opacity, 1) * 0.9)),',
        '    calc(var(--dsw-text-outline, 1) * 1px) 0 0 rgba(255, 255, 255, var(--dsw-text-opacity, 1)),',
        '    calc(var(--dsw-text-outline, 1) * -1px) 0 0 rgba(255, 255, 255, var(--dsw-text-opacity, 1)),',
        '    0 calc(var(--dsw-text-outline, 1) * 1px) 0 rgba(255, 255, 255, var(--dsw-text-opacity, 1)),',
        '    0 calc(var(--dsw-text-outline, 1) * -1px) 0 rgba(255, 255, 255, var(--dsw-text-opacity, 1)),',
        '    calc(var(--dsw-text-outline, 1) * 0.7px) calc(var(--dsw-text-outline, 1) * 0.7px) 0 rgba(255, 255, 255, var(--dsw-text-opacity, 1)),',
        '    calc(var(--dsw-text-outline, 1) * -0.7px) calc(var(--dsw-text-outline, 1) * 0.7px) 0 rgba(255, 255, 255, var(--dsw-text-opacity, 1)),',
        '    calc(var(--dsw-text-outline, 1) * 0.7px) calc(var(--dsw-text-outline, 1) * -0.7px) 0 rgba(255, 255, 255, var(--dsw-text-opacity, 1)),',
        '    calc(var(--dsw-text-outline, 1) * -0.7px) calc(var(--dsw-text-outline, 1) * -0.7px) 0 rgba(255, 255, 255, var(--dsw-text-opacity, 1));',
        '}',
        // Code chip/block backgrounds off: route the markdown code tokens to
        // transparent so inline code and code blocks float on the wallpaper
        // (their text still follows the ink + outline policy).
        'body[data-dsw-code-bg="off"] {',
        '  --dsw-alias-markdown-inline-code: transparent;',
        '  --dsw-alias-markdown-code-block: transparent;',
        '  --dsw-alias-markdown-code-block-banner: transparent;',
        '}',
      ].join('\n')
      document.head.appendChild(tag)
      this.textStyleTag = tag
    }
  }

  private releaseOverride(): void {
    if (this.overrideDisposer === undefined) return
    this.overrideDisposer()
    this.overrideDisposer = undefined
    this.appliedThemeRevision = undefined
  }
}

/** One translucent surface value: the base color at the given alpha. */
function mix(color: string, alpha: number): string {
  if (alpha >= 1) return color
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`
}

/** Create one presenter-owned fixed layer (hidden until first apply). */
function createLayer(kind: 'image' | 'dim'): HTMLDivElement {
  const element = document.createElement('div')
  element.dataset.wallpaperLayer = kind
  element.style.position = 'fixed'
  element.style.inset = '0'
  element.style.zIndex = '-1'
  element.style.pointerEvents = 'none'
  element.style.visibility = 'hidden'
  return element
}

/** Create the presenter-owned wallpaper video layer (muted looped autoplay, cover-fit). */
function createVideoLayer(): HTMLVideoElement {
  const element = document.createElement('video')
  element.dataset.wallpaperLayer = 'video'
  element.style.position = 'fixed'
  element.style.inset = '0'
  element.style.zIndex = '-1'
  element.style.pointerEvents = 'none'
  element.style.visibility = 'hidden'
  element.style.objectFit = 'cover'
  element.style.width = '100%'
  element.style.height = '100%'
  element.muted = true
  element.loop = true
  element.autoplay = true
  element.playsInline = true
  element.preload = 'auto'
  return element
}
