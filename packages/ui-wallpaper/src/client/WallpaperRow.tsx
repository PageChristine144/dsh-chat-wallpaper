/**
 * Chat-background row registered into the General section item slot: source
 * mode control (off / image / URL / desktop), upload and URL fields, the
 * wallpaper-layer sliders, and the chat typography controls (text color
 * palette, font family, weight). Registered by this package — the
 * wallpaper feature owns its settings surface. Selection follows the
 * persisted settings, never a local draft.
 */
import { useRef, useState } from 'react'
import clsx from 'clsx'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { TextFont, TextWeight, WallpaperMode } from '../wallpaper-settings.ts'
import { TEXT_COLORS } from '../text-colors.ts'
import type { ImageApplyResult } from './image.ts'
import type { WallpaperKey } from './locales.ts'
import type { createWallpaperStore } from './store.ts'
import { WeGallery } from './WeGallery.tsx'
import { FONT_TIERS, Slider, WEIGHT_TIERS } from './wallpaper-controls.tsx'
import css from './WallpaperRow.module.css'

/** Injected business face: the runtime write surface plus the file decode path. */
export interface WallpaperRowInjected {
  /** Select the wallpaper source. */
  setMode: (mode: WallpaperMode) => void
  /** Set the source value (image data URL / remote URL). */
  setValue: (value: string) => void
  /** Set the wallpaper blur in pixels. */
  setBlur: (value: number) => void
  /** Set the dim overlay opacity. */
  setDim: (value: number) => void
  /** Set the surface translucency (1 = opaque). */
  setSurfaceAlpha: (value: number) => void
  /** Set the chat font family preset. */
  setTextFont: (font: TextFont) => void
  /** Set the chat font weight. */
  setTextWeight: (weight: TextWeight) => void
  /** Set the manual text color id. */
  setTextColor: (color: string) => void
  /** Set the text opacity in percent (0 = fully transparent). */
  setTextOpacity: (opacity: number) => void
  /** Set the white text-outline thickness (0 = off). */
  setTextOutline: (outline: number) => void
  /** Show or hide the markdown code chip/block backgrounds. */
  setCodeBackground: (on: boolean) => void
  /** Mute or unmute the Wallpaper Engine audio. */
  setWeAudioMuted: (muted: boolean) => void
  /** Decode a picked file into a persisted wallpaper value. */
  applyImageFile: (file: File) => Promise<ImageApplyResult>
  /** Switch the live Wallpaper Engine wallpaper (host apply route). */
  applyWeWallpaper: (key: string) => Promise<boolean>
  /** Remember the applied Wallpaper Engine wallpaper key. */
  setWeKey: (key: string) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type WallpaperRowComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createWallpaperStore>>
  & PropsLocale<'settings.wallpaper'> & WallpaperRowInjected

/** Mode chips in display order. */
const MODES: readonly { id: WallpaperMode; labelKey: WallpaperKey }[] = [
  { id: 'none', labelKey: 'mode.none' },
  { id: 'image', labelKey: 'mode.image' },
  { id: 'url', labelKey: 'mode.url' },
  { id: 'desktop', labelKey: 'mode.desktop' },
]

/**
 * Render the Chat-background row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WallpaperRow({
  t, useStore, setMode, setValue, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight,
  setTextColor, setTextOpacity, setTextOutline, setCodeBackground, setWeAudioMuted, applyImageFile, applyWeWallpaper, setWeKey,
}: WallpaperRowComponentProps) {
  const settings = useStore(state => state.settings)
  const [urlDraft, setUrlDraft] = useState('')
  const [imageError, setImageError] = useState<WallpaperKey | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const active = settings.mode !== 'none'

  const pickFile = async (file: File | undefined): Promise<void> => {
    if (file === undefined) return
    const result = await applyImageFile(file)
    if (result.ok) {
      setImageError(null)
      setValue(result.dataUrl)
      setMode('image')
    } else {
      setImageError(result.reason === 'too-large' ? 'error.tooLarge' : 'error.decode')
    }
    if (fileInput.current !== null) fileInput.current.value = ''
  }

  const applyUrl = (): void => {
    const value = urlDraft.trim()
    if (value === '') return
    setValue(value)
    setMode('url')
  }

  /** Switch the live Wallpaper Engine wallpaper and show it through the
   *  transparent chat shell (desktop mode). */
  const applyWe = async (key: string): Promise<void> => {
    const ok = await applyWeWallpaper(key)
    if (!ok) return
    setWeKey(key)
    setMode('desktop')
  }

  return (
    <div className={css.group}>
      <div className={css.title}>{t('title')}</div>
      <div className={css.modeRow}>
        {MODES.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={clsx(css.chip, settings.mode === id && css.chipSelected)}
            aria-pressed={settings.mode === id}
            onClick={() => { setMode(id) }}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {active && settings.mode === 'desktop' ? (
        <>
          <span className={css.hint}>{t('desktop.hint')}</span>
          <button type="button" className={css.turnOff} onClick={() => { setMode('none') }}>
            {t('turnOff')}
          </button>
        </>
      ) : (
        <>
          <div
            className={css.preview}
            role="img"
            aria-label={t('title')}
            style={previewStyle(settings)}
          />
          {settings.mode === 'image' && (
            <div className={css.sourceRow}>
              <button type="button" className={css.sourceButton} onClick={() => { fileInput.current?.click() }}>
                {t('upload')}
              </button>
              <span className={css.hint}>{t('uploadHint')}</span>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => { void pickFile(event.target.files?.[0]) }}
              />
              {imageError !== null && <span className={css.error}>{t(imageError)}</span>}
            </div>
          )}
          {settings.mode === 'url' && (
            <div className={css.sourceRow}>
              <input
                type="text"
                className={css.textInput}
                placeholder={t('urlPlaceholder')}
                value={urlDraft}
                onChange={(event) => { setUrlDraft(event.target.value) }}
                onKeyDown={(event) => { if (event.key === 'Enter') applyUrl() }}
              />
              <button type="button" className={css.sourceButton} onClick={applyUrl}>
                {t('apply')}
              </button>
            </div>
          )}

          <div className={css.weBlock}>
            <span className={css.weTitle}>{t('we.title')}</span>
            <WeGallery
              t={t}
              currentKey={settings.weKey}
              onApply={applyWe}
            />
          </div>

          <div className={css.modeRow}>
            <button
              type="button"
              className={clsx(css.chip, settings.weAudioMuted && css.chipSelected)}
              aria-pressed={settings.weAudioMuted}
              onClick={() => { setWeAudioMuted(!settings.weAudioMuted) }}
            >
              {t(settings.weAudioMuted ? 'audio.muted' : 'audio.on')}
            </button>
          </div>

          {/* The wallpaper-layer effects (blur/dim/translucency) only apply to
              a rendered wallpaper layer; in desktop-transparent mode there is
              no layer, so those sliders are hidden as dead controls. */}
          {settings.mode !== 'desktop' && (
            <div className={css.sliderGroup}>
              <Slider css={css} label={t('blur')} min={0} max={40} step={1} value={settings.blur} onChange={setBlur} />
              <Slider css={css} label={t('dim')} min={0} max={0.8} step={0.05} value={settings.dim} onChange={setDim} />
              <Slider
                css={css}
                label={t('translucency')}
                min={0.5}
                max={1}
                step={0.05}
                value={settings.surfaceAlpha}
                onChange={setSurfaceAlpha}
              />
            </div>
          )}

          {/* Manual text color palette. */}
          <div className={css.swatchGrid}>
            {TEXT_COLORS.map(entry => (
              <button
                key={entry.id}
                type="button"
                className={clsx(css.swatch, settings.textColor === entry.id && css.swatchSelected)}
                aria-pressed={settings.textColor === entry.id}
                title={t(entry.nameKey as WallpaperKey)}
                onClick={() => { setTextColor(entry.id) }}
              >
                <span className={css.swatchColor} style={{ background: entry.css }} />
                <span className={css.swatchName}>{t(entry.nameKey as WallpaperKey)}</span>
              </button>
            ))}
          </div>

          {/* Text color depth + white outline thickness. */}
          <div className={css.sliderGroup}>
            <Slider css={css} label={t('opacity')} min={0} max={100} step={5} value={settings.textOpacity} onChange={setTextOpacity} />
            <Slider css={css} label={t('outline')} min={0} max={5} step={0.25} value={settings.textOutline} onChange={setTextOutline} />
          </div>

          {/* Markdown code chip/block backgrounds (off = transparent over the
              wallpaper). */}
          <div className={css.modeRow}>
            <button
              type="button"
              className={clsx(css.chip, settings.codeBackground && css.chipSelected)}
              aria-pressed={settings.codeBackground}
              onClick={() => { setCodeBackground(!settings.codeBackground) }}
            >
              {t(settings.codeBackground ? 'codeBackground.on' : 'codeBackground.off')}
            </button>
          </div>

          <div className={css.modeRow}>
            {FONT_TIERS.map(({ id, labelKey }) => (
              <button
                key={id}
                type="button"
                className={clsx(css.chip, settings.textFont === id && css.chipSelected)}
                aria-pressed={settings.textFont === id}
                onClick={() => { setTextFont(id) }}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          <div className={css.modeRow}>
            {WEIGHT_TIERS.map(({ id, labelKey }) => (
              <button
                key={id}
                type="button"
                className={clsx(css.chip, settings.textWeight === id && css.chipSelected)}
                aria-pressed={settings.textWeight === id}
                onClick={() => { setTextWeight(id as never) }}
              >
                {labelKey}
              </button>
            ))}
          </div>

          <button type="button" className={css.turnOff} onClick={() => { setMode('none') }}>
            {t('turnOff')}
          </button>
        </>
      )}
    </div>
  )
}

/** CSS background value of the current wallpaper for the preview box. */
function previewStyle(settings: { mode: WallpaperMode; value: string }): React.CSSProperties {
  if (settings.mode === 'image' || settings.mode === 'url') {
    return { background: `url("${settings.value}") center / cover no-repeat` }
  }
  return {}
}
