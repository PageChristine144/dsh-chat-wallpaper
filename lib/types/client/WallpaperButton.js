import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Session-header wallpaper quick switch: an icon button in the right-aligned
 * header utilities row that toggles a compact wallpaper panel (WE gallery,
 * readability sliders, text color, turn-off). The full source management
 * (upload / URL) lives in the General-settings row; this is the fast path.
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { IconFullscreenOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import { WallpaperPanel } from "./WallpaperPanel.js";
import css from './WallpaperButton.module.css';
/**
 * Render the header quick-switch button and its panel.
 * @param props - composed slot props.
 * @returns the button (plus the portaled panel while open).
 */
export function WallpaperButton(props) {
    const [open, setOpen] = useState(false);
    const close = () => { setOpen(false); };
    return (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.button, title: props.t('switch'), "aria-label": props.t('switch'), "aria-expanded": open, onClick: () => { setOpen(current => !current); }, children: _jsx(IconFullscreenOutline16, { size: 16 }) }), open && createPortal(_jsx(WallpaperPanel, { ...props, onClose: close }), document.body)] }));
}
//# sourceMappingURL=WallpaperButton.js.map