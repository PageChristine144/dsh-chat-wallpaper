/**
 * Shared controls for the wallpaper settings surfaces (the General row and the
 * header popover): the labeled range slider, the font chips, and the weight
 * chips. Both surfaces render the same controls, so the definitions live here
 * instead of being duplicated per surface. The slider receives its CSS module
 * class map as a prop because each surface styles its own copy.
 */
import { useState } from 'react'
import type { TextFont } from '../wallpaper-settings.ts'
import { TEXT_FONTS, TEXT_WEIGHTS } from '../wallpaper-settings.ts'
import type { WallpaperKey } from './locales.ts'

/** One labeled range slider bound to a numeric wallpaper field. While the
 *  user drags, the thumb and readout follow the pointer directly (a local
 *  draft), so the control never snaps back against the async settings write;
 *  on release it settles onto the persisted value. Continuous by default
 *  (step 'any'); values are rounded to 0.01 to avoid float noise. */
export function Slider(props: {
  css: Record<string, string>
  label: string
  min: number
  max: number
  value: number
  step?: number | 'any'
  onChange: (value: number) => void
}) {
  const css = props.css
  const [draft, setDraft] = useState<number | null>(null)
  const step = props.step ?? 'any'
  const shown = draft ?? props.value
  const commit = (raw: number): void => {
    const value = step === 'any' ? Math.round(raw * 100) / 100 : raw
    setDraft(value)
    props.onChange(value)
  }
  const settle = (): void => { setDraft(null) }
  return (
    <label className={css.sliderRow}>
      <span className={css.sliderLabel}>{props.label}</span>
      <input
        type="range"
        className={css.slider}
        min={props.min}
        max={props.max}
        step={step}
        value={shown}
        onChange={(event) => { commit(Number(event.target.value)) }}
        onPointerUp={settle}
        onPointerCancel={settle}
        onBlur={settle}
      />
      <span className={css.sliderValue}>{shown}</span>
    </label>
  )
}

/** Chat font family presets in display order. */
export const FONT_TIERS: readonly { id: TextFont; labelKey: WallpaperKey }[] = TEXT_FONTS.map(id => ({ id, labelKey: `font.${id}` as WallpaperKey }))

/** Chat font weights in display order (higher = more legible). */
export const WEIGHT_TIERS: readonly { id: number; labelKey: string }[] = TEXT_WEIGHTS.map(weight => ({
  id: weight,
  labelKey: String(weight),
}))
