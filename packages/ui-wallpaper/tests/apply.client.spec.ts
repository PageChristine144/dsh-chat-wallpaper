// @vitest-environment jsdom
/** ui-wallpaper apply wiring: service provision, settings dictionaries riding
 * the locale service, declaration-aware row and header-button registration,
 * snapshot projection into the shared store, and presenter drive. */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { TestRemote, usePinnedBrowserLanguages } from '@deepseek-ai/dsh-client-test-runtime'
import { SettingsScopeBinder } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'
import { apply, inject, SETTINGS_NS } from '@deepseek-ai/dsh-client-ui-wallpaper/client'
import { WALLPAPER_SETTINGS_NAMESPACE, WallpaperSettingsSchema } from '../src/wallpaper-settings.ts'
import { WallpaperRow } from '../src/client/WallpaperRow.tsx'
import { WallpaperButton } from '../src/client/WallpaperButton.tsx'

// The service reads its initial locale from the browser; these specs assert
// the shipped Chinese copy, so they state the browser they assume.
usePinnedBrowserLanguages('zh-CN')

const ITEM_SLOT = 'settings.general.item'
const HEADER_SLOT = 'conversation.session.header.utilities'

/** Surface token bases both palettes, so the presenter's default token read
 * (getComputedStyle probe) finds values under jsdom and pushes real overrides. */
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

async function bench(isLoopback = true) {
  // The presenter reads the pure cascade through getComputedStyle; feed it the
  // fixture bases (dark attribute toggles between the two palettes).
  vi.stubGlobal('getComputedStyle', () => ({
    getPropertyValue: (name: string) =>
      (document.body.hasAttribute('data-ds-dark-theme') ? BASE.dark : BASE.light)[name as keyof typeof BASE.light] ?? '',
  }))
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  let settings = {}
  const namespace = () => ({
    ns: WALLPAPER_SETTINGS_NAMESPACE,
    schema: WallpaperSettingsSchema.toJSON(),
    value: settings,
    applies: 'live' as const,
    secrets: [],
    revision: 0,
  })
  const describe = vi.fn(() => Promise.resolve({
    rpcId: 'wallpaper-describe' as never,
    result: {
      ok: true as const,
      value: { writable: true, hasDocument: true, namespaces: [namespace()] },
    },
  }))
  const mutate = vi.fn((request: { ops: { path: string[]; value: unknown }[] }) => {
    for (const op of request.ops) {
      settings = { ...settings, [op.path[0]!]: op.value }
    }
    return Promise.resolve({
      rpcId: 'wallpaper-mutate' as never,
      result: { ok: true as const, value: namespace() },
    })
  })
  ctx.provide('connection', { api: { settings: { describe, mutate } }, isLoopback } as never)
  new TestRemote(ctx)
  await ctx.plugin(SettingsScopeBinder).await()

  let themeRevision = 0
  const overrideLayers = new Map<string, ThemeTokenOverrides>()
  ctx.provide('theme', {
    overrideTokens: vi.fn((source: string, tokens: ThemeTokenOverrides) => {
      overrideLayers.set(source, tokens)
      themeRevision += 1
      return () => {
        overrideLayers.delete(source)
        themeRevision += 1
      }
    }),
    getTheme: () => ({
      preference: 'light',
      active: { id: 'light', colorScheme: 'light', tokens: {} },
      themes: [],
      revision: themeRevision,
    }),
  })
  return {
    ctx, slots: ctx.get('slots') as SlotRegistry, locale, describe, mutate, overrideLayers,
    setHostSettings: (next: Record<string, unknown>) => { settings = next },
  }
}

/** Stand in for the settings shell and the conversation surface slot trees. */
function declareSlots(slots: SlotRegistry): () => void {
  return slots.register(
    {
      name: 'root',
      children: {
        [ITEM_SLOT]: { kind: 'list', scope: 'root' },
        conversation: { kind: 'single', scope: 'root' },
      },
    } as never,
    () => null,
  )
}

function declareHeader(slots: SlotRegistry): () => void {
  return slots.register(
    {
      name: 'conversation',
      children: { [HEADER_SLOT]: { kind: 'list', scope: 'session' } },
    } as never,
    () => null,
  )
}

describe('ui-wallpaper apply', () => {
  it('declares the services it uses', () => {
    expect(inject).toEqual(['slots', 'locale', 'theme', 'connection', 'remote', 'settingsScope'])
  })

  it('provides the service, registers localized copy, and registers row + header button', async () => {
    const before = await bench()
    const root = declareSlots(before.slots)
    declareHeader(before.slots)
    await before.ctx.plugin({ inject: [...inject], apply }).await()
    expect(before.locale.bind(SETTINGS_NS)('title')).toBe('聊天背景')
    before.locale.setLocale('en')
    expect(before.locale.bind(SETTINGS_NS)('title')).toBe('Chat background')
    const row = before.slots.entries(ITEM_SLOT).find(e => e.component === WallpaperRow)!
    expect(row.options).toMatchObject({ id: 'wallpaper', order: 30 })
    const button = before.slots.entries(HEADER_SLOT).find(e => e.component === WallpaperButton)!
    expect(button.options).toMatchObject({ id: 'wallpaper', order: 30 })
    expect(before.ctx.get('wallpaper')).toBeDefined()
    root()

    const after = await bench()
    const fiber = after.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(after.slots.entries(ITEM_SLOT)).toHaveLength(0)
    declareSlots(after.slots)
    declareHeader(after.slots)
    await Promise.resolve()
    expect(after.slots.entries(ITEM_SLOT).some(e => e.component === WallpaperRow)).toBe(true)
  })

  it('routes writes to the runtime and drives the presenter through the theme face', async () => {
    const b = await bench()
    declareSlots(b.slots)
    declareHeader(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const wallpaper = b.ctx.get('wallpaper') as {
      setMode: (mode: string) => void
      setValue: (value: string) => void
    }

    wallpaper.setMode('image')
    wallpaper.setValue('data:image/jpeg;base64,AA==')
    await vi.waitFor(() => {
      expect(b.overrideLayers.has('ui-wallpaper')).toBe(true)
    })
    // Surface tokens are pushed; label ink is derived by the stylesheet.
    expect(b.overrideLayers.get('ui-wallpaper')!['--dsw-alias-bg-base']).toBeDefined()
    expect(b.overrideLayers.get('ui-wallpaper')!['--dsw-alias-label-primary']).toBeUndefined()

    wallpaper.setMode('none')
    await vi.waitFor(() => {
      expect(b.overrideLayers.has('ui-wallpaper')).toBe(false)
    })
  })

  it('loads Host settings at boot and keeps remote browsers process-local', async () => {
    const b = await bench()
    b.setHostSettings({ mode: 'image', value: 'data:image/jpeg;base64,AA==', blur: 0, dim: 0.35, surfaceAlpha: 0.82, textColor: 'rosegold' })
    declareSlots(b.slots)
    declareHeader(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const wallpaper = b.ctx.get('wallpaper') as { getWallpaper: () => { settings: { mode: string } } }
    await vi.waitFor(() => { expect(wallpaper.getWallpaper().settings.mode).toBe('image') })

    const remote = await bench(false)
    declareSlots(remote.slots)
    declareHeader(remote.slots)
    await remote.ctx.plugin({ inject: [...inject], apply }).await()
    const remoteWallpaper = remote.ctx.get('wallpaper') as { setMode: (mode: string) => void }
    remoteWallpaper.setMode('image')
    await Promise.resolve()
    expect(remote.describe).not.toHaveBeenCalled()
    expect(remote.mutate).not.toHaveBeenCalled()
  })

  it('teardown disposes the presenter and removes the registrations', async () => {
    const b = await bench()
    declareSlots(b.slots)
    declareHeader(b.slots)
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.slots.entries(ITEM_SLOT)).toHaveLength(1)
    // The header utilities row hosts the wallpaper switch, the
    // transparent-desktop toggle, and the shell window controls.
    expect(b.slots.entries(HEADER_SLOT)).toHaveLength(3)
    await fiber.dispose()
    expect(b.slots.entries(ITEM_SLOT)).toHaveLength(0)
    expect(b.slots.entries(HEADER_SLOT)).toHaveLength(0)
    expect(b.locale.bind(SETTINGS_NS)('title')).toBe('title')
  })
})
