import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Browser-style window controls for the transparent chat shell: clear-screen,
 * minimize / maximize-restore / close buttons rendered in the session header
 * utilities row, exactly where a normal browser puts them. The controls only
 * exist when the page runs inside the Electron shell (window.desktopShell,
 * injected by the shell's preload bridge) — a regular browser tab never sees
 * them. The clear-screen button re-runs the shell's one-click clear (hides
 * windows opened since the last clear, e.g. apps summoned mid-chat); the
 * close button routes through the shell's close path, which restores the
 * desktop chat window before quitting.
 */
import { useEffect, useState } from 'react';
import { IconCloseOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './WindowControls.module.css';
/** Minimize glyph: a single horizontal bar. */
function MinimizeGlyph() {
    return (_jsx("svg", { width: 14, height: 14, viewBox: "0 0 14 14", "aria-hidden": "true", children: _jsx("path", { d: "M3 7h8", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" }) }));
}
/** Clear-screen glyph: a window with a down arrow — tuck the windows away. */
function ClearScreenGlyph() {
    return (_jsxs("svg", { width: 14, height: 14, viewBox: "0 0 14 14", "aria-hidden": "true", children: [_jsx("rect", { x: 2.5, y: 2.5, width: 9, height: 9, fill: "none", stroke: "currentColor", strokeWidth: 1.4, rx: 1.5 }), _jsx("path", { d: "M7 5v3.2", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" }), _jsx("path", { d: "m5.4 7.2 1.6 1.6 1.6-1.6", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" })] }));
}
/** Maximize glyph: an empty square. */
function MaximizeGlyph() {
    return (_jsx("svg", { width: 14, height: 14, viewBox: "0 0 14 14", "aria-hidden": "true", children: _jsx("rect", { x: 3, y: 3, width: 8, height: 8, fill: "none", stroke: "currentColor", strokeWidth: 1.4, rx: 1.5 }) }));
}
/** Restore glyph: two overlapping squares (the lower one filled). */
function RestoreGlyph() {
    return (_jsxs("svg", { width: 14, height: 14, viewBox: "0 0 14 14", "aria-hidden": "true", children: [_jsx("path", { d: "M5 6h3.5A2.5 2.5 0 0 1 11 8.5V12H8.5A2.5 2.5 0 0 1 6 9.5V6Z", fill: "currentColor", opacity: 0.45 }), _jsx("rect", { x: 3, y: 3, width: 7, height: 7, fill: "none", stroke: "currentColor", strokeWidth: 1.4, rx: 1.5 })] }));
}
/**
 * Render the window control buttons (shell environment only).
 * @param props - composed slot props.
 * @returns the button group, or null outside the transparent shell.
 */
export function WindowControls({ t }) {
    const shell = typeof window !== 'undefined' ? window.desktopShell : undefined;
    const [maximized, setMaximized] = useState(false);
    useEffect(() => {
        if (shell === undefined)
            return;
        let alive = true;
        void shell.isMaximized().then((value) => { if (alive)
            setMaximized(value); }).catch(() => { });
        const unsubscribe = shell.onMaximizedChange((value) => { if (alive)
            setMaximized(value); });
        return () => { alive = false; unsubscribe(); };
    }, [shell]);
    if (shell === undefined)
        return null;
    return (_jsxs("div", { className: css.group, role: "group", "aria-label": t('window.controls'), children: [typeof shell.clearDesktop === 'function' && (_jsx("button", { type: "button", className: css.button, title: t('clearScreen'), "aria-label": t('clearScreen'), onClick: () => { shell.clearDesktop?.(); }, children: _jsx(ClearScreenGlyph, {}) })), _jsx("button", { type: "button", className: css.button, title: t('window.minimize'), "aria-label": t('window.minimize'), onClick: () => { shell.minimize(); }, children: _jsx(MinimizeGlyph, {}) }), _jsx("button", { type: "button", className: css.button, title: maximized ? t('window.restore') : t('window.maximize'), "aria-label": maximized ? t('window.restore') : t('window.maximize'), onClick: () => { shell.toggleMaximize(); }, children: maximized ? _jsx(RestoreGlyph, {}) : _jsx(MaximizeGlyph, {}) }), _jsx("button", { type: "button", className: css.close, title: t('window.close'), "aria-label": t('window.close'), onClick: () => { shell.close(); }, children: _jsx(IconCloseOutline16, { size: 14 }) })] }));
}
//# sourceMappingURL=WindowControls.js.map