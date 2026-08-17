/**
 * Transparent-desktop toggle in the session header's right-aligned utilities
 * row: one click spawns the transparent Electron shell and switches the
 * wallpaper to Desktop-transparent mode (the OS desktop shows through the
 * chat); clicking again closes the shell and turns the mode off. The shell is
 * managed by the host's /chat-desktop routes, so this feels like a plain
 * plugin toggle.
 */
import { useState } from 'react'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { IconSparkle16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { WallpaperMode } from '../wallpaper-settings.ts'
import type { createWallpaperStore } from './store.ts'
import css from './WallpaperButton.module.css'

/** Injected business face: the wallpaper mode write. */
export interface TransparentDesktopButtonInjected {
  /** Switch the wallpaper mode (desktop on / none off). */
  setMode: (mode: WallpaperMode) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type TransparentDesktopButtonProps =
  PropsRuntime<'conversation.session.header.utilities'> & PropsStore<ReturnType<typeof createWallpaperStore>>
  & PropsLocale<'settings.wallpaper'> & TransparentDesktopButtonInjected

/**
 * Render the transparent-desktop toggle button.
 * @param props - composed slot props.
 * @returns the button element.
 */
export function TransparentDesktopButton({ t, useStore, setMode }: TransparentDesktopButtonProps) {
  const settings = useStore(state => state.settings)
  const [busy, setBusy] = useState(false)
  const active = settings.mode === 'desktop'

  const toggle = async (): Promise<void> => {
    if (busy) return
    setBusy(true)
    try {
      if (active) {
        await fetch('/chat-desktop/close', { method: 'POST' })
        setMode('none')
      } else {
        const response = await fetch('/chat-desktop/open', { method: 'POST' })
        const payload = await response.json().catch(() => null) as { ok?: boolean } | null
        // Switch the page into desktop mode only when the shell actually opened.
        if (payload?.ok !== false) setMode('desktop')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={css.button}
      title={t('desktop.transparent')}
      aria-label={t('desktop.transparent')}
      aria-pressed={active}
      onClick={() => { void toggle() }}
    >
      <IconSparkle16 size={16} />
    </button>
  )
}
