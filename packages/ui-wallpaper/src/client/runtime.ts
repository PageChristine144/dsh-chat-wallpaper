/**
 * DOM-free wallpaper state owner. The service owns the durable wallpaper
 * settings (mode/value/blur/dim/surfaceAlpha/textColor), writes every user
 * gesture through the settings scope, and publishes immutable
 * `wallpaper/change` snapshots. It never touches the DOM — the presenter
 * consumes the snapshots.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import {
  clampWallpaperNumber, DEFAULT_WALLPAPER_SETTINGS, isTextFont, isTextWeight, isWallpaperMode,
  WALLPAPER_SETTINGS_FIELDS,
  type TextFont, type TextWeight, type WallpaperMode, type WallpaperSettings,
} from '../wallpaper-settings.ts'

/** Immutable wallpaper state published on every change. */
export interface WallpaperSnapshot {
  /** The durable wallpaper settings (schema-resolved). */
  settings: WallpaperSettings
  /** Monotonic change counter. */
  revision: number
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Wallpaper preference and state owner (provided by this plugin). */
    wallpaper: WallpaperRuntime
  }
  interface Events {
    /**
     * Wallpaper state changed (any settings field, or the scope adopted a
     * durable section).
     * @param snapshot - Current immutable wallpaper snapshot.
     * @mode emit
     */
    'wallpaper/change'(snapshot: WallpaperSnapshot): void
  }
}

/**
 * Wallpaper preference owner. Reads go through {@link getWallpaper}; writes
 * only through the typed setters; continuous sync only through the
 * `wallpaper/change` event. Every write routes through the settings scope
 * (durable in the Host settings document; process-local for remote browsers).
 */
export class WallpaperRuntime {
  private settings: WallpaperSettings
  private revision = 0
  private snapshot: WallpaperSnapshot

  /**
   * @param ctx - owning context (change events are emitted on it; the scope
   * listener is released through ctx.effect on dispose).
   * @param host - durable settings scope owned by the same plugin.
   */
  constructor(
    private readonly ctx: Context,
    private readonly host: SettingsScope<WallpaperSettings>,
  ) {
    this.settings = { ...DEFAULT_WALLPAPER_SETTINGS }
    this.snapshot = this.buildSnapshot()
    ctx.effect(() => host.subscribe(() => { this.adopt() }), 'ui-wallpaper: settings scope adoption')
    this.adopt()
  }

  /**
   * Read the current immutable wallpaper snapshot.
   * @returns the current snapshot (stable reference until the next change).
   */
  getWallpaper(): WallpaperSnapshot {
    return this.snapshot
  }

  /** Select the wallpaper source; unknown modes fall back to `none`.
   * @param mode - the wallpaper source to select. */
  setMode(mode: WallpaperMode): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.MODE, isWallpaperMode(mode) ? mode : DEFAULT_WALLPAPER_SETTINGS.mode)
  }

  /** Set the source value (image data URL / remote URL).
   * @param value - the source value to persist. */
  setValue(value: string): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.VALUE, value)
  }

  /** Set the wallpaper blur in pixels (clamped 0–40).
   * @param blur - blur magnitude in pixels. */
  setBlur(blur: number): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.BLUR, clampWallpaperNumber('blur', blur))
  }

  /** Set the dim overlay opacity (clamped 0–0.8).
   * @param dim - overlay opacity to apply. */
  setDim(dim: number): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.DIM, clampWallpaperNumber('dim', dim))
  }

  /** Set the surface translucency (clamped 0.5–1; 1 = opaque surfaces).
   * @param alpha - surface opacity against the wallpaper. */
  setSurfaceAlpha(alpha: number): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.SURFACE_ALPHA, clampWallpaperNumber('surfaceAlpha', alpha))
  }

  /** Remember the live Wallpaper Engine wallpaper key (gallery selection).
   * @param key - the WE item key, or '' to forget it. */
  setWeKey(key: string): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.WE_KEY, typeof key === 'string' ? key : DEFAULT_WALLPAPER_SETTINGS.weKey)
  }

  /** Set the chat font family preset; unknown fonts fall back to `system`.
   * @param font - the font preset id to select. */
  setTextFont(font: TextFont): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_FONT, isTextFont(font) ? font : DEFAULT_WALLPAPER_SETTINGS.textFont)
  }

  /** Set the chat font weight; unknown weights fall back to 400.
   * @param weight - the font weight to select. */
  setTextWeight(weight: TextWeight): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_WEIGHT, isTextWeight(weight) ? weight : DEFAULT_WALLPAPER_SETTINGS.textWeight)
  }

  /** Set the manual text color id.
   * @param color - the text-color palette id to select. */
  setTextColor(color: string): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_COLOR, typeof color === 'string' ? color : DEFAULT_WALLPAPER_SETTINGS.textColor)
  }

  /** Set the text opacity in percent (clamped 0–100; 0 = fully transparent).
   * @param opacity - text opacity as a percent. */
  setTextOpacity(opacity: number): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_OPACITY, clampWallpaperNumber('textOpacity', opacity))
  }

  /** Set the white text-outline thickness (clamped 0–3; 0 = off).
   * @param thickness - outline thickness in steps. */
  setTextOutline(thickness: number): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_OUTLINE, clampWallpaperNumber('textOutline', thickness))
  }

  /** Show or hide the markdown code chip/block backgrounds.
   * @param on - true to show code backgrounds, false to make them transparent. */
  setCodeBackground(on: boolean): void {
    this.write(WALLPAPER_SETTINGS_FIELDS.CODE_BACKGROUND, on)
  }

  /**
   * Apply several fields in one gesture (the mode+value pair from an image
   * pick). Fields are clamped/narrowed individually; unchanged fields are not
   * written.
   * @param draft - partial settings to apply.
   */
  setWallpaper(draft: Partial<WallpaperSettings>): void {
    const next: WallpaperSettings = { ...this.settings }
    let changed = false
    if (draft.mode !== undefined && isWallpaperMode(draft.mode)) { next.mode = draft.mode; changed = true }
    if (draft.value !== undefined && typeof draft.value === 'string') { next.value = draft.value; changed = true }
    if (draft.blur !== undefined) { next.blur = clampWallpaperNumber('blur', draft.blur); changed = true }
    if (draft.dim !== undefined) { next.dim = clampWallpaperNumber('dim', draft.dim); changed = true }
    if (draft.surfaceAlpha !== undefined) { next.surfaceAlpha = clampWallpaperNumber('surfaceAlpha', draft.surfaceAlpha); changed = true }
    if (draft.weKey !== undefined && typeof draft.weKey === 'string') { next.weKey = draft.weKey; changed = true }
    if (draft.textFont !== undefined && isTextFont(draft.textFont)) { next.textFont = draft.textFont; changed = true }
    if (draft.textWeight !== undefined && isTextWeight(draft.textWeight)) { next.textWeight = draft.textWeight; changed = true }
    if (draft.textColor !== undefined && typeof draft.textColor === 'string') { next.textColor = draft.textColor; changed = true }
    if (draft.textOpacity !== undefined) { next.textOpacity = clampWallpaperNumber('textOpacity', draft.textOpacity); changed = true }
    if (draft.textOutline !== undefined) { next.textOutline = clampWallpaperNumber('textOutline', draft.textOutline); changed = true }
    if (draft.codeBackground !== undefined) { next.codeBackground = draft.codeBackground; changed = true }
    if (!changed) return
    const previous = this.settings
    this.settings = next
    for (const field of Object.values(WALLPAPER_SETTINGS_FIELDS)) {
      if (next[field] !== previous[field]) void this.host.set(field, next[field])
    }
    this.publish()
  }

  /** Adopt the scope's accepted durable section without writing it back. */
  private adopt(): void {
    const section = this.host.getSnapshot().value
    if (section === undefined || sameSettings(section, this.settings)) return
    this.settings = sanitizeSettings(section)
    this.publish()
  }

  private write(field: keyof WallpaperSettings, value: WallpaperSettings[typeof field]): void {
    if (this.settings[field] === value) return
    this.settings = { ...this.settings, [field]: value }
    void this.host.set(field, value)
    this.publish()
  }

  private buildSnapshot(): WallpaperSnapshot {
    return Object.freeze({
      settings: Object.freeze({ ...this.settings }),
      revision: this.revision,
    })
  }

  private publish(): void {
    this.revision += 1
    this.snapshot = this.buildSnapshot()
    this.ctx.emit('wallpaper/change', this.snapshot)
  }
}

/** Defensive re-validation of a wire section before adoption. */
function sanitizeSettings(section: WallpaperSettings): WallpaperSettings {
  return {
    mode: isWallpaperMode(section.mode) ? section.mode : DEFAULT_WALLPAPER_SETTINGS.mode,
    value: typeof section.value === 'string' ? section.value : DEFAULT_WALLPAPER_SETTINGS.value,
    blur: clampWallpaperNumber('blur', typeof section.blur === 'number' ? section.blur : DEFAULT_WALLPAPER_SETTINGS.blur),
    dim: clampWallpaperNumber('dim', typeof section.dim === 'number' ? section.dim : DEFAULT_WALLPAPER_SETTINGS.dim),
    surfaceAlpha: clampWallpaperNumber(
      'surfaceAlpha',
      typeof section.surfaceAlpha === 'number' ? section.surfaceAlpha : DEFAULT_WALLPAPER_SETTINGS.surfaceAlpha,
    ),
    weKey: typeof section.weKey === 'string' ? section.weKey : DEFAULT_WALLPAPER_SETTINGS.weKey,
    textFont: isTextFont(section.textFont) ? section.textFont : DEFAULT_WALLPAPER_SETTINGS.textFont,
    textWeight: isTextWeight(section.textWeight) ? section.textWeight : DEFAULT_WALLPAPER_SETTINGS.textWeight,
    textColor: typeof section.textColor === 'string' ? section.textColor : DEFAULT_WALLPAPER_SETTINGS.textColor,
    textOpacity: clampWallpaperNumber(
      'textOpacity',
      typeof section.textOpacity === 'number' ? section.textOpacity : DEFAULT_WALLPAPER_SETTINGS.textOpacity,
    ),
    textOutline: clampWallpaperNumber(
      'textOutline',
      typeof section.textOutline === 'number' ? section.textOutline : DEFAULT_WALLPAPER_SETTINGS.textOutline,
    ),
    codeBackground: typeof section.codeBackground === 'boolean'
      ? section.codeBackground
      : DEFAULT_WALLPAPER_SETTINGS.codeBackground,
  }
}

function sameSettings(left: WallpaperSettings, right: WallpaperSettings): boolean {
  return left.mode === right.mode && left.value === right.value && left.blur === right.blur
    && left.dim === right.dim && left.surfaceAlpha === right.surfaceAlpha
    && left.weKey === right.weKey
    && left.textFont === right.textFont
    && left.textWeight === right.textWeight
    && left.textColor === right.textColor && left.textOpacity === right.textOpacity
    && left.textOutline === right.textOutline && left.codeBackground === right.codeBackground
}
