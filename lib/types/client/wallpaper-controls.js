import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Shared controls for the wallpaper settings surfaces (the General row and the
 * header popover): the labeled range slider, the font chips, and the weight
 * chips. Both surfaces render the same controls, so the definitions live here
 * instead of being duplicated per surface. The slider receives its CSS module
 * class map as a prop because each surface styles its own copy.
 */
import { useState } from 'react';
import { TEXT_FONTS, TEXT_WEIGHTS } from "../wallpaper-settings.js";
/** One labeled range slider bound to a numeric wallpaper field. While the
 *  user drags, the thumb and readout follow the pointer directly (a local
 *  draft), so the control never snaps back against the async settings write;
 *  on release it settles onto the persisted value. Continuous by default
 *  (step 'any'); values are rounded to 0.01 to avoid float noise. */
export function Slider(props) {
    const css = props.css;
    const [draft, setDraft] = useState(null);
    const step = props.step ?? 'any';
    const shown = draft ?? props.value;
    const commit = (raw) => {
        const value = step === 'any' ? Math.round(raw * 100) / 100 : raw;
        setDraft(value);
        props.onChange(value);
    };
    const settle = () => { setDraft(null); };
    return (_jsxs("label", { className: css.sliderRow, children: [_jsx("span", { className: css.sliderLabel, children: props.label }), _jsx("input", { type: "range", className: css.slider, min: props.min, max: props.max, step: step, value: shown, onChange: (event) => { commit(Number(event.target.value)); }, onPointerUp: settle, onPointerCancel: settle, onBlur: settle }), _jsx("span", { className: css.sliderValue, children: shown })] }));
}
/** Chat font family presets in display order. */
export const FONT_TIERS = TEXT_FONTS.map(id => ({ id, labelKey: `font.${id}` }));
/** Chat font weights in display order (higher = more legible). */
export const WEIGHT_TIERS = TEXT_WEIGHTS.map(weight => ({
    id: weight,
    labelKey: String(weight),
}));
//# sourceMappingURL=wallpaper-controls.js.map