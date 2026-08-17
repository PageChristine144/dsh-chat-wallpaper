/**
 * Browser-style window controls for the transparent chat shell: minimize /
 * maximize-restore / close buttons rendered in the session header utilities
 * row, exactly where a normal browser puts them. The controls only exist when
 * the page runs inside the Electron shell (window.desktopShell, injected by
 * the shell's preload bridge) — a regular browser tab never sees them. The
 * close button routes through the shell's close path, which restores the
 * desktop chat window before quitting.
 */
import { useEffect, useState } from 'react'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { IconCloseOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { createWallpaperStore } from './store.ts'
import css from './WindowControls.module.css'

/** Window-control bridge injected by the transparent shell's preload. */
export interface DesktopShellBridge {
  minimize: () => void
  toggleMaximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizedChange: (callback: (maximized: boolean) => void) => () => void
  /** Tell the shell whether the user muted wallpaper audio (true = muted). */
  setAudioMuted?: (muted: boolean) => void
}

declare global {
  interface Window {
    /** Present only inside the transparent Electron shell (preload bridge). */
    desktopShell?: DesktopShellBridge
  }
}

/** Injected face: window controls need no business surface. */
export interface WindowControlsInjected {
  /** (empty — the shell bridge is read directly from window.desktopShell) */
}

/** Full component props: runtime share + store share + locale seat. */
export type WindowControlsProps =
  PropsRuntime<'conversation.session.header.utilities'> & PropsStore<ReturnType<typeof createWallpaperStore>>
  & PropsLocale<'settings.wallpaper'> & WindowControlsInjected

/** Minimize glyph: a single horizontal bar. */
function MinimizeGlyph() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 7h8" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  )
}

/** Maximize glyph: an empty square. */
function MaximizeGlyph() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
      <rect x={3} y={3} width={8} height={8} fill="none" stroke="currentColor" strokeWidth={1.4} rx={1.5} />
    </svg>
  )
}

/** Restore glyph: two overlapping squares (the lower one filled). */
function RestoreGlyph() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M5 6h3.5A2.5 2.5 0 0 1 11 8.5V12H8.5A2.5 2.5 0 0 1 6 9.5V6Z"
        fill="currentColor"
        opacity={0.45}
      />
      <rect x={3} y={3} width={7} height={7} fill="none" stroke="currentColor" strokeWidth={1.4} rx={1.5} />
    </svg>
  )
}

/**
 * Render the window control buttons (shell environment only).
 * @param props - composed slot props.
 * @returns the button group, or null outside the transparent shell.
 */
export function WindowControls({ t }: WindowControlsProps) {
  const shell = typeof window !== 'undefined' ? window.desktopShell : undefined
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    if (shell === undefined) return
    let alive = true
    void shell.isMaximized().then((value) => { if (alive) setMaximized(value) }).catch(() => {})
    const unsubscribe = shell.onMaximizedChange((value) => { if (alive) setMaximized(value) })
    return () => { alive = false; unsubscribe() }
  }, [shell])

  if (shell === undefined) return null

  return (
    <div className={css.group} role="group" aria-label={t('window.controls')}>
      <button
        type="button"
        className={css.button}
        title={t('window.minimize')}
        aria-label={t('window.minimize')}
        onClick={() => { shell.minimize() }}
      >
        <MinimizeGlyph />
      </button>
      <button
        type="button"
        className={css.button}
        title={maximized ? t('window.restore') : t('window.maximize')}
        aria-label={maximized ? t('window.restore') : t('window.maximize')}
        onClick={() => { shell.toggleMaximize() }}
      >
        {maximized ? <RestoreGlyph /> : <MaximizeGlyph />}
      </button>
      <button
        type="button"
        className={css.close}
        title={t('window.close')}
        aria-label={t('window.close')}
        onClick={() => { shell.close() }}
      >
        <IconCloseOutline16 size={14} />
      </button>
    </div>
  )
}
