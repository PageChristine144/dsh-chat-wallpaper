/** Locale dictionaries: every key resolves in both zh and en, and en matches
 * the zh key set exactly. */
import { describe, expect, it } from 'vitest'
import { en, zh, type WallpaperKey } from '../src/client/locales.ts'

describe('ui-wallpaper locales', () => {
  it('en covers every zh key', () => {
    const zhKeys = Object.keys(zh) as WallpaperKey[]
    const enKeys = Object.keys(en)
    expect(enKeys).toEqual(expect.arrayContaining(zhKeys))
    expect(zhKeys).toEqual(expect.arrayContaining(enKeys))
  })

  it('resolves every key in both locales', () => {
    for (const key of Object.keys(zh) as WallpaperKey[]) {
      expect(zh[key]).toBeTruthy()
      expect(en[key]).toBeTruthy()
    }
  })

  it('exposes the mode, opacity, outline, code-background, and palette name keys used by the UI', () => {
    for (const key of [
      'mode.none', 'mode.image', 'mode.url', 'mode.desktop', 'opacity', 'outline',
      'codeBackground.on', 'codeBackground.off',
      'color.ink', 'color.snow', 'color.silver', 'color.rosegold', 'color.champagne',
      'color.azure', 'color.violet', 'color.mint', 'color.coral', 'color.lemon',
      'color.seablue', 'color.blossom', 'color.grape',
    ] as const) {
      expect(zh[key]).toBeTruthy()
    }
  })
})
