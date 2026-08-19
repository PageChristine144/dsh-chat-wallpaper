import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Chat-background row registered into the General section item slot: source
 * mode control (off / image / URL / desktop), upload and URL fields, the
 * wallpaper-layer sliders, and the chat typography controls (text color
 * palette, font family, weight). Registered by this package — the
 * wallpaper feature owns its settings surface. Selection follows the
 * persisted settings, never a local draft.
 */
import { useRef, useState } from 'react';
import clsx from 'clsx';
import { TEXT_COLORS } from "../text-colors.js";
import { WeGallery } from "./WeGallery.js";
import { FONT_TIERS, Slider, WEIGHT_TIERS } from "./wallpaper-controls.js";
import css from './WallpaperRow.module.css';
/** Mode chips in display order. */
const MODES = [
    { id: 'none', labelKey: 'mode.none' },
    { id: 'image', labelKey: 'mode.image' },
    { id: 'url', labelKey: 'mode.url' },
    { id: 'desktop', labelKey: 'mode.desktop' },
];
/**
 * Render the Chat-background row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WallpaperRow({ t, useStore, setMode, setValue, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight, setTextColor, setTextOpacity, setTextOutline, setCodeBackground, applyImageFile, applyWeWallpaper, setWeKey, }) {
    const settings = useStore(state => state.settings);
    const [urlDraft, setUrlDraft] = useState('');
    const [imageError, setImageError] = useState(null);
    const fileInput = useRef(null);
    const active = settings.mode !== 'none';
    const pickFile = async (file) => {
        if (file === undefined)
            return;
        const result = await applyImageFile(file);
        if (result.ok) {
            setImageError(null);
            setValue(result.dataUrl);
            setMode('image');
        }
        else {
            setImageError(result.reason === 'too-large' ? 'error.tooLarge' : 'error.decode');
        }
        if (fileInput.current !== null)
            fileInput.current.value = '';
    };
    const applyUrl = () => {
        const value = urlDraft.trim();
        if (value === '')
            return;
        setValue(value);
        setMode('url');
    };
    /** Switch the live Wallpaper Engine wallpaper and show it through the
     *  transparent chat shell (desktop mode). */
    const applyWe = async (key) => {
        const ok = await applyWeWallpaper(key);
        if (!ok)
            return;
        setWeKey(key);
        setMode('desktop');
    };
    return (_jsxs("div", { className: css.group, children: [_jsx("div", { className: css.title, children: t('title') }), _jsx("div", { className: css.modeRow, children: MODES.map(({ id, labelKey }) => (_jsx("button", { type: "button", className: clsx(css.chip, settings.mode === id && css.chipSelected), "aria-pressed": settings.mode === id, onClick: () => { setMode(id); }, children: t(labelKey) }, id))) }), active && settings.mode === 'desktop' ? (_jsxs(_Fragment, { children: [_jsx("span", { className: css.hint, children: t('desktop.hint') }), _jsx("button", { type: "button", className: css.turnOff, onClick: () => { setMode('none'); }, children: t('turnOff') })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: css.preview, role: "img", "aria-label": t('title'), style: previewStyle(settings) }), settings.mode === 'image' && (_jsxs("div", { className: css.sourceRow, children: [_jsx("button", { type: "button", className: css.sourceButton, onClick: () => { fileInput.current?.click(); }, children: t('upload') }), _jsx("span", { className: css.hint, children: t('uploadHint') }), _jsx("input", { ref: fileInput, type: "file", accept: "image/*", hidden: true, onChange: (event) => { void pickFile(event.target.files?.[0]); } }), imageError !== null && _jsx("span", { className: css.error, children: t(imageError) })] })), settings.mode === 'url' && (_jsxs("div", { className: css.sourceRow, children: [_jsx("input", { type: "text", className: css.textInput, placeholder: t('urlPlaceholder'), value: urlDraft, onChange: (event) => { setUrlDraft(event.target.value); }, onKeyDown: (event) => { if (event.key === 'Enter')
                                    applyUrl(); } }), _jsx("button", { type: "button", className: css.sourceButton, onClick: applyUrl, children: t('apply') })] })), _jsxs("div", { className: css.weBlock, children: [_jsx("span", { className: css.weTitle, children: t('we.title') }), _jsx(WeGallery, { t: t, currentKey: settings.weKey, onApply: applyWe })] }), settings.mode !== 'desktop' && (_jsxs("div", { className: css.sliderGroup, children: [_jsx(Slider, { css: css, label: t('blur'), min: 0, max: 40, value: settings.blur, onChange: setBlur }), _jsx(Slider, { css: css, label: t('dim'), min: 0, max: 0.8, value: settings.dim, onChange: setDim }), _jsx(Slider, { css: css, label: t('translucency'), min: 0.5, max: 1, value: settings.surfaceAlpha, onChange: setSurfaceAlpha })] })), _jsx("div", { className: css.swatchGrid, children: TEXT_COLORS.map(entry => (_jsxs("button", { type: "button", className: clsx(css.swatch, settings.textColor === entry.id && css.swatchSelected), "aria-pressed": settings.textColor === entry.id, title: t(entry.nameKey), onClick: () => { setTextColor(entry.id); }, children: [_jsx("span", { className: css.swatchColor, style: { background: entry.css } }), _jsx("span", { className: css.swatchName, children: t(entry.nameKey) })] }, entry.id))) }), _jsxs("div", { className: css.sliderGroup, children: [_jsx(Slider, { css: css, label: t('opacity'), min: 0, max: 100, value: settings.textOpacity, onChange: setTextOpacity }), _jsx(Slider, { css: css, label: t('outline'), min: 0, max: 5, value: settings.textOutline, onChange: setTextOutline })] }), _jsx("div", { className: css.modeRow, children: _jsx("button", { type: "button", className: clsx(css.chip, settings.codeBackground && css.chipSelected), "aria-pressed": settings.codeBackground, onClick: () => { setCodeBackground(!settings.codeBackground); }, children: t(settings.codeBackground ? 'codeBackground.on' : 'codeBackground.off') }) }), _jsx("div", { className: css.modeRow, children: FONT_TIERS.map(({ id, labelKey }) => (_jsx("button", { type: "button", className: clsx(css.chip, settings.textFont === id && css.chipSelected), "aria-pressed": settings.textFont === id, onClick: () => { setTextFont(id); }, children: t(labelKey) }, id))) }), _jsx("div", { className: css.modeRow, children: WEIGHT_TIERS.map(({ id, labelKey }) => (_jsx("button", { type: "button", className: clsx(css.chip, settings.textWeight === id && css.chipSelected), "aria-pressed": settings.textWeight === id, onClick: () => { setTextWeight(id); }, children: labelKey }, id))) }), _jsx("button", { type: "button", className: css.turnOff, onClick: () => { setMode('none'); }, children: t('turnOff') })] }))] }));
}
/** CSS background value of the current wallpaper for the preview box. */
function previewStyle(settings) {
    if (settings.mode === 'image' || settings.mode === 'url') {
        return { background: `url("${settings.value}") center / cover no-repeat` };
    }
    return {};
}
//# sourceMappingURL=WallpaperRow.js.map