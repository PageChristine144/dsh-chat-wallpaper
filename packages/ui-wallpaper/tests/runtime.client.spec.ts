// @vitest-environment jsdom
/** WallpaperRuntime behavior: defaults, typed writes through the scope,
 * clamping, multi-field gestures, durable adoption, and wire sanitization. */
import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { stubSettingsScope, type StubSettingsScope } from '@deepseek-ai/dsh-client-test-runtime'
import type { WallpaperSettings } from '@deepseek-ai/dsh-client-ui-wallpaper/client'
import { WallpaperRuntime, type WallpaperSnapshot } from '@deepseek-ai/dsh-client-ui-wallpaper/client'
import { DEFAULT_WALLPAPER_SETTINGS } from '../src/wallpaper-settings.ts'

const make = (host = stubSettingsScope<WallpaperSettings>()): {
  ctx: Context
  wallpaper: WallpaperRuntime
  events: WallpaperSnapshot[]
  host: StubSettingsScope<WallpaperSettings>
} => {
  const ctx = new Context()
  const events: WallpaperSnapshot[] = []
  ctx.on('wallpaper/change', (snapshot) => { events.push(snapshot) })
  return { ctx, wallpaper: new WallpaperRuntime(ctx, host.scope), events, host }
}

describe('WallpaperRuntime', () => {
  it('defaults to the built-in settings and emits nothing before any write', () => {
    const { wallpaper, events } = make()
    expect(wallpaper.getWallpaper().settings).toEqual({ ...DEFAULT_WALLPAPER_SETTINGS })
    expect(wallpaper.getWallpaper().revision).toBe(0)
    expect(events).toHaveLength(0)
  })

  it('typed setters write through the scope, republish, and keep DOM untouched', () => {
    const { wallpaper, events, host } = make()
    wallpaper.setMode('image')
    wallpaper.setValue('data:image/jpeg;base64,AA==')
    wallpaper.setBlur(8)
    wallpaper.setDim(0.2)
    wallpaper.setSurfaceAlpha(0.9)
    wallpaper.setTextColor('azure')
    wallpaper.setTextOpacity(70)
    wallpaper.setTextOutline(3)
    wallpaper.setCodeBackground(false)
    expect(host.set).toHaveBeenNthCalledWith(1, 'mode', 'image')
    expect(host.set).toHaveBeenNthCalledWith(2, 'value', 'data:image/jpeg;base64,AA==')
    expect(host.set).toHaveBeenNthCalledWith(3, 'blur', 8)
    expect(host.set).toHaveBeenNthCalledWith(4, 'dim', 0.2)
    expect(host.set).toHaveBeenNthCalledWith(5, 'surfaceAlpha', 0.9)
    expect(host.set).toHaveBeenNthCalledWith(6, 'textColor', 'azure')
    expect(host.set).toHaveBeenNthCalledWith(7, 'textOpacity', 70)
    expect(host.set).toHaveBeenNthCalledWith(8, 'textOutline', 3)
    expect(host.set).toHaveBeenNthCalledWith(9, 'codeBackground', false)
    expect(events).toHaveLength(9)
    expect(wallpaper.getWallpaper().settings).toMatchObject({
      mode: 'image', value: 'data:image/jpeg;base64,AA==', blur: 8, dim: 0.2, surfaceAlpha: 0.9,
      textColor: 'azure', textOpacity: 70, textOutline: 3, codeBackground: false,
    })
    expect(wallpaper.getWallpaper().revision).toBe(9)
  })

  it('clamps numeric fields to their schema bounds and ignores unchanged writes', () => {
    const { wallpaper, host } = make()
    wallpaper.setBlur(200)
    expect(wallpaper.getWallpaper().settings.blur).toBe(40)
    wallpaper.setDim(-1)
    expect(wallpaper.getWallpaper().settings.dim).toBe(0)
    wallpaper.setSurfaceAlpha(0.1)
    expect(wallpaper.getWallpaper().settings.surfaceAlpha).toBe(0.5)
    wallpaper.setTextOutline(9)
    expect(wallpaper.getWallpaper().settings.textOutline).toBe(5)
    wallpaper.setTextOutline(-2)
    expect(wallpaper.getWallpaper().settings.textOutline).toBe(0)
    // Fine 0.25 steps pass through unrounded.
    wallpaper.setTextOutline(1.75)
    expect(wallpaper.getWallpaper().settings.textOutline).toBe(1.75)
    wallpaper.setTextOpacity(150)
    expect(wallpaper.getWallpaper().settings.textOpacity).toBe(100)
    wallpaper.setTextOpacity(-10)
    expect(wallpaper.getWallpaper().settings.textOpacity).toBe(0)
    const calls = host.set.mock.calls.length
    wallpaper.setBlur(40)
    expect(host.set.mock.calls.length).toBe(calls)
  })

  it('setWallpaper applies a mode+value gesture in one publish with per-field writes', () => {
    const { wallpaper, events, host } = make()
    wallpaper.setWallpaper({ mode: 'image', value: 'data:image/jpeg;base64,AA==' })
    expect(host.set).toHaveBeenCalledWith('mode', 'image')
    expect(host.set).toHaveBeenCalledWith('value', 'data:image/jpeg;base64,AA==')
    expect(events).toHaveLength(1)
  })

  it('falls back to defaults for unknown modes and passes any manual color id through', () => {
    const { wallpaper } = make()
    wallpaper.setMode('sepia' as never)
    expect(wallpaper.getWallpaper().settings.mode).toBe('none')
    wallpaper.setTextColor('sepia')
    expect(wallpaper.getWallpaper().settings.textColor).toBe('sepia')
  })

  it('adopts the durable section when the scope publishes, without writing back', () => {
    const { wallpaper, events, host } = make()
    host.publish({ value: {
      mode: 'image', value: 'data:image/jpeg;base64,AA==', blur: 4, dim: 0.1, surfaceAlpha: 1,
      weKey: '', textFont: 'serif', textWeight: 700, textColor: 'rosegold', textOpacity: 55, textOutline: 1,
      codeBackground: false,
    } })
    expect(wallpaper.getWallpaper().settings).toMatchObject({ mode: 'image', blur: 4, textColor: 'rosegold', textOpacity: 55, textOutline: 1, codeBackground: false })
    expect(events.at(-1)?.revision).toBe(1)
    expect(host.set).not.toHaveBeenCalled()
  })

  it('sanitizes a hostile wire section before adoption', () => {
    const { wallpaper, host } = make()
    host.publish({
      value: {
        mode: 'sepia', value: 42, blur: -5, dim: 9, surfaceAlpha: 0, textColor: 42,
      } as never,
    })
    // Enums fall back to defaults; numbers clamp to their schema bounds;
    // non-string manual colors fall back to the default ink.
    expect(wallpaper.getWallpaper().settings).toEqual({
      mode: 'none', value: '', blur: 0, dim: 0.8, surfaceAlpha: 0.5, weKey: '', textFont: 'system',
      textWeight: 400, textColor: 'ink', textOpacity: 100, textOutline: 2, codeBackground: true,
    })
  })

  it('releases its scope subscription on fiber dispose', async () => {
    const { ctx, host } = make()
    expect(host.listenerCount()).toBe(1)
    await ctx.fiber.dispose()
    expect(host.listenerCount()).toBe(0)
  })
})
