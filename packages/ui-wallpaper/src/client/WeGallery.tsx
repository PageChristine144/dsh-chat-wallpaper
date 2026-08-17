/**
 * Wallpaper Engine gallery: loads the host-scanned local library and renders a
 * thumbnail grid. Picking an item asks the host to switch the LIVE Wallpaper
 * Engine wallpaper (`/wallpaper-engine/apply`); the transparent chat shell then
 * shows the engine's real-time rendering through. Every item is selectable —
 * scene/web wallpapers included, since they render in the engine, not in the
 * browser. The busy state disables the grid while a switch is in flight.
 */
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import type { WallpaperKey } from './locales.ts'
import { loadWeList, type WeItem } from './we.ts'
import css from './WeGallery.module.css'

/** Gallery props: copy, the pick callback, and the current key for selection. */
export interface WeGalleryProps {
  /** Locale resolver (the wallpaper copy namespace). */
  t: (key: WallpaperKey) => string
  /** Switch the live Wallpaper Engine wallpaper and enter desktop mode. */
  onApply: (key: string) => Promise<void>
  /** Current wallpaper key, to mark the selected cell. */
  currentKey?: string
}

type GalleryState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: WeItem[] }

/**
 * Render the Wallpaper Engine gallery.
 * @param props - copy, apply callback, current key.
 * @returns the gallery element tree.
 */
export function WeGallery({ t, onApply, currentKey }: WeGalleryProps) {
  const [state, setState] = useState<GalleryState>({ status: 'loading' })
  const [busyKey, setBusyKey] = useState<string | undefined>(undefined)
  useEffect(() => {
    let alive = true
    void loadWeList().then((items) => {
      if (alive) setState({ status: 'ready', items })
    }).catch(() => {
      if (alive) setState({ status: 'error' })
    })
    return () => { alive = false }
  }, [])

  if (state.status === 'loading') return <div className={css.status}>{t('we.loading')}</div>
  if (state.status === 'error') return <div className={css.status}>{t('we.error')}</div>
  if (state.items.length === 0) return <div className={css.status}>{t('we.empty')}</div>
  return (
    <div className={css.grid}>
      {state.items.map((item) => {
        const selected = currentKey !== undefined && item.key === currentKey
        return (
          <button
            key={item.key}
            type="button"
            className={clsx(css.cell, selected && css.cellSelected)}
            aria-pressed={selected}
            disabled={busyKey !== undefined}
            title={item.title}
            onClick={() => {
              setBusyKey(item.key)
              void onApply(item.key).finally(() => { setBusyKey(undefined) })
            }}
          >
            <span
              className={css.thumb}
              style={item.previewUrl === '' ? undefined : { backgroundImage: `url("${item.previewUrl}")` }}
            />
            {item.type === 'video' && <span className={css.videoBadge}>▶</span>}
            <span className={css.title}>{busyKey === item.key ? t('we.applying') : item.title}</span>
          </button>
        )
      })}
    </div>
  )
}
