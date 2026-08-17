/**
 * Session-header wallpaper quick switch: an icon button in the right-aligned
 * header utilities row that toggles a compact wallpaper panel (WE gallery,
 * readability sliders, text color, turn-off). The full source management
 * (upload / URL) lives in the General-settings row; this is the fast path.
 */
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { IconFullscreenOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { createWallpaperStore } from './store.ts'
import { WallpaperPanel } from './WallpaperPanel.tsx'
import type { WallpaperRowInjected } from './WallpaperRow.tsx'
import css from './WallpaperButton.module.css'

/** Full component props: runtime share + store share + locale seat + injected face. */
export type WallpaperButtonComponentProps =
  PropsRuntime<'conversation.session.header.utilities'> & PropsStore<ReturnType<typeof createWallpaperStore>>
  & PropsLocale<'settings.wallpaper'> & WallpaperRowInjected

/**
 * Render the header quick-switch button and its panel.
 * @param props - composed slot props.
 * @returns the button (plus the portaled panel while open).
 */
export function WallpaperButton(props: WallpaperButtonComponentProps) {
  const [open, setOpen] = useState(false)
  const close = (): void => { setOpen(false) }
  return (
    <>
      <button
        type="button"
        className={css.button}
        title={props.t('switch')}
        aria-label={props.t('switch')}
        aria-expanded={open}
        onClick={() => { setOpen(current => !current) }}
      >
        <IconFullscreenOutline16 size={16} />
      </button>
      {open && createPortal(<WallpaperPanel {...props} onClose={close} />, document.body)}
    </>
  )
}
