/**
 * Wallpaper plugin, browser half: provides the wallpaper service, drives the
 * DOM presenter, registers the localized Chat-background row into the General
 * settings section, and registers the header quick-switch button into the
 * conversation header utilities. Surface translucency and label colors ride
 * the theme plugin's `overrideTokens` extension point through the presenter.
 */
import type { BakedActions, BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: the ctx.settingsScope Context merge. Cross-plugin collaboration
// goes through the service, never a value import (client bundle purity gate).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the theme plugin's Context merge (ctx.theme) and the
// 'theme/change' event signature.
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
// Type-only: pulls the conversation SlotMap merge (header utilities seat).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { WALLPAPER_SETTINGS_NAMESPACE, type WallpaperSettings } from '../wallpaper-settings.ts'
import { applyImageFile } from './image.ts'
import { en, zh, type WallpaperKey } from './locales.ts'
import { WallpaperPresenter } from './presenter.ts'
import { WallpaperRuntime, type WallpaperSnapshot } from './runtime.ts'
import { createWallpaperStore, type WallpaperRowActions, type WallpaperRowState } from './store.ts'
import { applyWeWallpaper } from './we.ts'
import { WallpaperButton } from './WallpaperButton.tsx'
import { WallpaperRow, type WallpaperRowInjected } from './WallpaperRow.tsx'
import { TransparentDesktopButton, type TransparentDesktopButtonInjected } from './TransparentDesktopButton.tsx'
import { WindowControls, type WindowControlsInjected } from './WindowControls.tsx'

export type { WallpaperRowInjected, WallpaperRowComponentProps } from './WallpaperRow.tsx'
export type { WallpaperButtonComponentProps } from './WallpaperButton.tsx'
export type { TransparentDesktopButtonInjected, TransparentDesktopButtonProps } from './TransparentDesktopButton.tsx'
export type { WindowControlsInjected, WindowControlsProps, DesktopShellBridge } from './WindowControls.tsx'
export type { WallpaperPanelProps } from './WallpaperPanel.tsx'
export type { WallpaperRowState, WallpaperRowActions } from './store.ts'
export type { WallpaperKey } from './locales.ts'
export { WallpaperRuntime } from './runtime.ts'
export type { WallpaperSnapshot } from './runtime.ts'
export { WallpaperPresenter } from './presenter.ts'
export type { WallpaperMode, WallpaperSettings } from '../wallpaper-settings.ts'

/** Namespace owning this feature's settings-row copy. */
export const SETTINGS_NS = 'settings.wallpaper'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The Chat-background row's copy. */
    'settings.wallpaper': WallpaperKey
  }
}

/**
 * Required services: settings transport, slots/locale/theme, plus the
 * forwarded settings invalidation that `bindSettingsScope` subscribes to on
 * this context.
 */
export const inject = ['slots', 'locale', 'theme', 'connection', 'remote', 'settingsScope']

/**
 * Client plugin body: provide the wallpaper service, drive the presenter, and
 * register the feature-owned settings row and header quick-switch button.
 * @param ctx - client cordis context.
 */
export function apply(ctx: ClientContext): void {
  const host = ctx.settingsScope.bind<WallpaperSettings>({ namespace: WALLPAPER_SETTINGS_NAMESPACE })
  const wallpaper = new WallpaperRuntime(ctx, host)
  ctx.provide('wallpaper', wallpaper)

  const presenter = new WallpaperPresenter(ctx.theme)
  const applySnapshot = (snapshot: WallpaperSnapshot): void => {
    presenter.apply(snapshot, ctx.theme.getTheme())
  }
  ctx.on('wallpaper/change', applySnapshot)
  ctx.on('theme/change', (snapshot) => { presenter.onThemeChange(snapshot) })
  applySnapshot(wallpaper.getWallpaper())

  ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), 'ui-wallpaper: settings dictionaries')

  // One store per mount scope: the settings row lives at root scope, the
  // header button at session scope, and a store handle mounts under exactly
  // one scope. Both mirrors are fed from the same wallpaper/change stream.
  const rowStore = createWallpaperStore()
  const headerStore = createWallpaperStore()
  let rowBound: BoundActions<typeof rowStore> | undefined
  let headerBound: BoundActions<typeof headerStore> | undefined
  const sync = (snapshot: WallpaperSnapshot): void => {
    rowBound?.sync(snapshot.settings, snapshot.revision)
    headerBound?.sync(snapshot.settings, snapshot.revision)
  }
  ctx.on('wallpaper/change', sync)
  const face = (): WallpaperRowInjected => ({
    setMode: (mode) => { wallpaper.setMode(mode) },
    setValue: (value) => { wallpaper.setValue(value) },
    setBlur: (value) => { wallpaper.setBlur(value) },
    setDim: (value) => { wallpaper.setDim(value) },
    setSurfaceAlpha: (value) => { wallpaper.setSurfaceAlpha(value) },
    setTextFont: (font) => { wallpaper.setTextFont(font) },
    setTextWeight: (weight) => { wallpaper.setTextWeight(weight) },
    setTextColor: (color) => { wallpaper.setTextColor(color) },
    setTextOpacity: (opacity) => { wallpaper.setTextOpacity(opacity) },
    setTextOutline: (outline) => { wallpaper.setTextOutline(outline) },
    setCodeBackground: (on) => { wallpaper.setCodeBackground(on) },
    applyImageFile: file => applyImageFile(file),
    applyWeWallpaper: key => applyWeWallpaper(key).then(result => result.ok),
    setWeKey: (key) => { wallpaper.setWeKey(key) },
  })

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'wallpaper',
    order: 30,
    store: rowStore,
    locale: SETTINGS_NS,
    inject: (actions: BoundActions<typeof rowStore>): WallpaperRowInjected => {
      rowBound = actions
      // Re-sync from the getter so no event is lost between registration and
      // first render (the store's revision guard drops stale duplicates).
      sync(wallpaper.getWallpaper())
      return face()
    },
  }, WallpaperRow))

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'wallpaper',
    order: 30,
    store: headerStore,
    locale: SETTINGS_NS,
    inject: (_sessionId: SessionId, actions: BakedActions<WallpaperRowState, WallpaperRowActions>): WallpaperRowInjected => {
      headerBound = actions
      sync(wallpaper.getWallpaper())
      return face()
    },
  }, WallpaperButton))

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'transparent-desktop',
    order: 31,
    store: headerStore,
    locale: SETTINGS_NS,
    inject: (_sessionId: SessionId, actions: BakedActions<WallpaperRowState, WallpaperRowActions>): TransparentDesktopButtonInjected => {
      headerBound = actions
      sync(wallpaper.getWallpaper())
      return { setMode: (mode) => { wallpaper.setMode(mode) } }
    },
  }, TransparentDesktopButton))

  // Browser-style window controls, only when running inside the transparent
  // shell (window.desktopShell). Registered last so they sit at the far right
  // of the header utilities row, like a normal browser's title-bar buttons.
  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'window-controls',
    order: 32,
    store: headerStore,
    locale: SETTINGS_NS,
    inject: (_sessionId: SessionId, actions: BakedActions<WallpaperRowState, WallpaperRowActions>): WindowControlsInjected => {
      headerBound = actions
      sync(wallpaper.getWallpaper())
      return {}
    },
  }, WindowControls))

  ctx.effect(() => () => { presenter.dispose() }, 'ui-wallpaper: presenter disposal')
}
