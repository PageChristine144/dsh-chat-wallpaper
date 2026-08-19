import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Compact wallpaper popover for the header quick switch: the Wallpaper Engine
 * gallery, the wallpaper-layer sliders, and the chat typography controls
 * (text color palette, font family, weight). Rendered in a portal over a
 * transparent backdrop; closes on backdrop click or Escape.
 */
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { IconCloseOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import { TEXT_COLORS } from "../text-colors.js";
import { WeGallery } from "./WeGallery.js";
import { FONT_TIERS, Slider, WEIGHT_TIERS } from "./wallpaper-controls.js";
import css from './WallpaperPanel.module.css';
/**
 * Render the wallpaper popover.
 * @param props - composed slot props plus close callback.
 * @returns the popover element tree.
 */
export function WallpaperPanel({ t, useStore, onClose, setMode, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight, setTextColor, setTextOpacity, setTextOutline, setCodeBackground, applyWeWallpaper, setWeKey, }) {
    const settings = useStore(state => state.settings);
    const backdrop = useRef(null);
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => { document.removeEventListener('keydown', onKeyDown); };
    }, [onClose]);
    const active = settings.mode !== 'none';
    return (_jsx("div", { ref: backdrop, className: css.backdrop, onMouseDown: (event) => { if (event.target === backdrop.current)
            onClose(); }, children: _jsxs("div", { className: css.panel, role: "dialog", "aria-label": t('title'), children: [_jsxs("div", { className: css.header, children: [_jsx("span", { className: css.title, children: t('title') }), _jsx("button", { type: "button", className: css.close, "aria-label": "Close", onClick: onClose, children: _jsx(IconCloseOutline16, { size: 14 }) })] }), _jsxs("div", { className: css.weBlock, children: [_jsx("span", { className: css.weTitle, children: t('we.title') }), _jsx(WeGallery, { t: t, currentKey: settings.weKey, onApply: async (key) => {
                                const ok = await applyWeWallpaper(key);
                                if (!ok)
                                    return;
                                setWeKey(key);
                                setMode('desktop');
                            } })] }), active && (_jsxs(_Fragment, { children: [settings.mode !== 'desktop' && (_jsxs("div", { className: css.sliderGroup, children: [_jsx(Slider, { css: css, label: t('blur'), min: 0, max: 40, value: settings.blur, onChange: setBlur }), _jsx(Slider, { css: css, label: t('dim'), min: 0, max: 0.8, value: settings.dim, onChange: setDim }), _jsx(Slider, { css: css, label: t('translucency'), min: 0.5, max: 1, value: settings.surfaceAlpha, onChange: setSurfaceAlpha })] })), _jsx("div", { className: css.swatchGrid, children: TEXT_COLORS.map(entry => (_jsxs("button", { type: "button", className: clsx(css.swatch, settings.textColor === entry.id && css.swatchSelected), "aria-pressed": settings.textColor === entry.id, title: t(entry.nameKey), onClick: () => { setTextColor(entry.id); }, children: [_jsx("span", { className: css.swatchColor, style: { background: entry.css } }), _jsx("span", { className: css.swatchName, children: t(entry.nameKey) })] }, entry.id))) }), _jsxs("div", { className: css.sliderGroup, children: [_jsx(Slider, { css: css, label: t('opacity'), min: 0, max: 100, value: settings.textOpacity, onChange: setTextOpacity }), _jsx(Slider, { css: css, label: t('outline'), min: 0, max: 5, value: settings.textOutline, onChange: setTextOutline })] }), _jsx("div", { className: css.tierRow, children: _jsx("button", { type: "button", className: clsx(css.tier, settings.codeBackground && css.tierSelected), "aria-pressed": settings.codeBackground, onClick: () => { setCodeBackground(!settings.codeBackground); }, children: t(settings.codeBackground ? 'codeBackground.on' : 'codeBackground.off') }) }), _jsx("div", { className: css.tierRow, children: FONT_TIERS.map(({ id, labelKey }) => (_jsx("button", { type: "button", className: clsx(css.tier, settings.textFont === id && css.tierSelected), "aria-pressed": settings.textFont === id, onClick: () => { setTextFont(id); }, children: t(labelKey) }, id))) }), _jsx("div", { className: css.tierRow, children: WEIGHT_TIERS.map(({ id, labelKey }) => (_jsx("button", { type: "button", className: clsx(css.tier, settings.textWeight === id && css.tierSelected), "aria-pressed": settings.textWeight === id, onClick: () => { setTextWeight(id); }, children: labelKey }, id))) }), _jsx("div", { className: css.tierRow, children: _jsx("button", { type: "button", className: clsx(css.tier, settings.mode === 'desktop' && css.tierSelected), "aria-pressed": settings.mode === 'desktop', onClick: () => { setMode(settings.mode === 'desktop' ? 'none' : 'desktop'); }, children: t('mode.desktop') }) }), _jsx("button", { type: "button", className: css.turnOff, onClick: () => { setMode('none'); }, children: t('turnOff') })] }))] }) }));
}
//# sourceMappingURL=WallpaperPanel.js.map