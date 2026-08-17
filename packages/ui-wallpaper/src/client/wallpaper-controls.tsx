/**
 * Shared controls for the wallpaper settings surfaces (the General row and the
 * header popover): the labeled range slider, the font chips, and the weight
 * chips. Both surfaces render the same controls, so the definitions live here
 * instead of being duplicated per surface. The slider receives its CSS module
 * class map as a prop because each surface styles its own copy.
 */
import type { TextFont } from '../wallpaper-settings.ts'
import { TEXT_FONTS, TEXT_WEIGHTS } from '../wallpaper-settings.ts'
import type { WallpaperKey } from './locales.ts'

/** One labeled range slider bound to a numeric wallpaper field. */
export function Slider(props: {
  css: Record<string, string>
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}) {
  const css = props.css
  return (
    <label className={css.sliderRow}>
      <span className={css.sliderLabel}>{props.label}</span>
      <input
        type="range"
        className={css.slider}
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(event) => { props.onChange(Number(event.target.value)) }}
      />
      <span className={css.sliderValue}>{props.value}</span>
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
