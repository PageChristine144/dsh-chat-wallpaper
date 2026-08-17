/**
 * Compact wallpaper popover for the header quick switch: the Wallpaper Engine
 * gallery, the wallpaper-layer sliders, and the chat typography controls
 * (text color palette, font family, weight). Rendered in a portal over a
 * transparent backdrop; closes on backdrop click or Escape.
 */
import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { IconCloseOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { TEXT_COLORS } from '../text-colors.ts'
import type { WallpaperKey } from './locales.ts'
import type { createWallpaperStore } from './store.ts'
import type { WallpaperRowInjected } from './WallpaperRow.tsx'
import { WeGallery } from './WeGallery.tsx'
import { FONT_TIERS, Slider, WEIGHT_TIERS } from './wallpaper-controls.tsx'
import css from './WallpaperPanel.module.css'

/** Panel props: the button's composed props plus the close callback. */
export type WallpaperPanelProps =
  PropsRuntime<'conversation.session.header.utilities'> & PropsStore<ReturnType<typeof createWallpaperStore>>
  & PropsLocale<'settings.wallpaper'> & WallpaperRowInjected & { onClose: () => void }

/**
 * Render the wallpaper popover.
 * @param props - composed slot props plus close callback.
 * @returns the popover element tree.
 */
export function WallpaperPanel({
  t, useStore, onClose, setMode, setBlur, setDim, setSurfaceAlpha, setTextFont,
  setTextWeight, setTextColor, setTextOpacity, setTextOutline, setCodeBackground, setWeAudioMuted, applyWeWallpaper, setWeKey,
}: WallpaperPanelProps) {
  const settings = useStore(state => state.settings)
  const backdrop = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [onClose])

  const active = settings.mode !== 'none'

  return (
    <div
      ref={backdrop}
      className={css.backdrop}
      onMouseDown={(event) => { if (event.target === backdrop.current) onClose() }}
    >
      <div className={css.panel} role="dialog" aria-label={t('title')}>
        <div className={css.header}>
          <span className={css.title}>{t('title')}</span>
          <button type="button" className={css.close} aria-label="Close" onClick={onClose}>
            <IconCloseOutline16 size={14} />
          </button>
        </div>

        <div className={css.weBlock}>
          <span className={css.weTitle}>{t('we.title')}</span>
          <WeGallery
            t={t}
            currentKey={settings.weKey}
            onApply={async (key) => {
              const ok = await applyWeWallpaper(key)
              if (!ok) return
              setWeKey(key)
              setMode('desktop')
            }}
          />
        </div>

        {active && (
          <>
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

            <div className={css.sliderGroup}>
              <Slider css={css} label={t('opacity')} min={0} max={100} step={5} value={settings.textOpacity} onChange={setTextOpacity} />
              <Slider css={css} label={t('outline')} min={0} max={5} step={0.25} value={settings.textOutline} onChange={setTextOutline} />
            </div>

            <div className={css.tierRow}>
              <button
                type="button"
                className={clsx(css.tier, settings.codeBackground && css.tierSelected)}
                aria-pressed={settings.codeBackground}
                onClick={() => { setCodeBackground(!settings.codeBackground) }}
              >
                {t(settings.codeBackground ? 'codeBackground.on' : 'codeBackground.off')}
              </button>
            </div>

            <div className={css.tierRow}>
              {FONT_TIERS.map(({ id, labelKey }) => (
                <button
                  key={id}
                  type="button"
                  className={clsx(css.tier, settings.textFont === id && css.tierSelected)}
                  aria-pressed={settings.textFont === id}
                  onClick={() => { setTextFont(id) }}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>

            <div className={css.tierRow}>
              {WEIGHT_TIERS.map(({ id, labelKey }) => (
                <button
                  key={id}
                  type="button"
                  className={clsx(css.tier, settings.textWeight === id && css.tierSelected)}
                  aria-pressed={settings.textWeight === id}
                  onClick={() => { setTextWeight(id as never) }}
                >
                  {labelKey}
                </button>
              ))}
            </div>

            <div className={css.tierRow}>
              <button
                type="button"
                className={clsx(css.tier, settings.weAudioMuted && css.tierSelected)}
                aria-pressed={settings.weAudioMuted}
                onClick={() => { setWeAudioMuted(!settings.weAudioMuted) }}
              >
                {t(settings.weAudioMuted ? 'audio.muted' : 'audio.on')}
              </button>
            </div>

            <div className={css.tierRow}>
              <button
                type="button"
                className={clsx(css.tier, settings.mode === 'desktop' && css.tierSelected)}
                aria-pressed={settings.mode === 'desktop'}
                onClick={() => { setMode(settings.mode === 'desktop' ? 'none' : 'desktop') }}
              >
                {t('mode.desktop')}
              </button>
            </div>

            <button type="button" className={css.turnOff} onClick={() => { setMode('none') }}>
              {t('turnOff')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
