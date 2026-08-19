import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Wallpaper Engine gallery: loads the host-scanned local library and renders a
 * thumbnail grid. Picking an item asks the host to switch the LIVE Wallpaper
 * Engine wallpaper (`/wallpaper-engine/apply`); the transparent chat shell then
 * shows the engine's real-time rendering through. Every item is selectable —
 * scene/web wallpapers included, since they render in the engine, not in the
 * browser. The busy state disables the grid while a switch is in flight.
 */
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { loadWeList } from "./we.js";
import css from './WeGallery.module.css';
/**
 * Render the Wallpaper Engine gallery.
 * @param props - copy, apply callback, current key.
 * @returns the gallery element tree.
 */
export function WeGallery({ t, onApply, currentKey }) {
    const [state, setState] = useState({ status: 'loading' });
    const [busyKey, setBusyKey] = useState(undefined);
    useEffect(() => {
        let alive = true;
        void loadWeList().then((items) => {
            if (alive)
                setState({ status: 'ready', items });
        }).catch(() => {
            if (alive)
                setState({ status: 'error' });
        });
        return () => { alive = false; };
    }, []);
    if (state.status === 'loading')
        return _jsx("div", { className: css.status, children: t('we.loading') });
    if (state.status === 'error')
        return _jsx("div", { className: css.status, children: t('we.error') });
    if (state.items.length === 0)
        return _jsx("div", { className: css.status, children: t('we.empty') });
    return (_jsx("div", { className: css.grid, children: state.items.map((item) => {
            const selected = currentKey !== undefined && item.key === currentKey;
            return (_jsxs("button", { type: "button", className: clsx(css.cell, selected && css.cellSelected), "aria-pressed": selected, disabled: busyKey !== undefined, title: item.title, onClick: () => {
                    setBusyKey(item.key);
                    void onApply(item.key).finally(() => { setBusyKey(undefined); });
                }, children: [_jsx("span", { className: css.thumb, style: item.previewUrl === '' ? undefined : { backgroundImage: `url("${item.previewUrl}")` } }), item.type === 'video' && _jsx("span", { className: css.videoBadge, children: "\u25B6" }), _jsx("span", { className: css.title, children: busyKey === item.key ? t('we.applying') : item.title })] }, item.key));
        }) }));
}
//# sourceMappingURL=WeGallery.js.map