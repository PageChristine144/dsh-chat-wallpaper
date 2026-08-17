import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { SettingsProvider, settingsNamespace, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import {
  DEFAULT_WALLPAPER_SETTINGS, WALLPAPER_SETTINGS_NAMESPACE, apply,
} from '@deepseek-ai/dsh-client-ui-wallpaper'

class MemorySettings extends SettingsProvider {
  readonly writable = true
  protected load(): Promise<Record<string, unknown>> { return Promise.resolve({}) }
  protected persist(_ns: SettingsNamespace, _section: Record<string, unknown>): Promise<void> {
    return Promise.resolve()
  }
}

describe('ui-wallpaper host', () => {
  it('registers, validates, and disposes the durable wallpaper namespace with its fiber', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings).await()
    const fiber = ctx.plugin({ apply })
    await fiber.await()
    const ns = settingsNamespace(WALLPAPER_SETTINGS_NAMESPACE)
    expect(ctx.settings.get(ns)).toEqual({ ...DEFAULT_WALLPAPER_SETTINGS })
    await ctx.settings.update(ns, { mode: 'image', value: 'data:image/jpeg;base64,AA==', blur: 8 })
    expect(ctx.settings.get(ns)).toMatchObject({ mode: 'image', value: 'data:image/jpeg;base64,AA==', blur: 8 })
    await expect(ctx.settings.update(ns, { mode: 'sepia' })).rejects.toThrow()
    await fiber.dispose()
    expect(ctx.settings.describe().map(row => row.ns)).not.toContain(ns)
  })
})
