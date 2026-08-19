import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Transparent-desktop toggle in the session header's right-aligned utilities
 * row: one click spawns the transparent Electron shell and switches the
 * wallpaper to Desktop-transparent mode (the OS desktop shows through the
 * chat); clicking again closes the shell and turns the mode off. The shell is
 * managed by the host's /chat-desktop routes, so this feels like a plain
 * plugin toggle.
 */
import { useState } from 'react';
import { IconSparkle16 } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './WallpaperButton.module.css';
/**
 * Render the transparent-desktop toggle button.
 * @param props - composed slot props.
 * @returns the button element.
 */
export function TransparentDesktopButton({ t, useStore, setMode }) {
    const settings = useStore(state => state.settings);
    const [busy, setBusy] = useState(false);
    const active = settings.mode === 'desktop';
    const toggle = async () => {
        if (busy)
            return;
        setBusy(true);
        try {
            if (active) {
                await fetch('/chat-desktop/close', { method: 'POST' });
                setMode('none');
            }
            else {
                const response = await fetch('/chat-desktop/open', { method: 'POST' });
                const payload = await response.json().catch(() => null);
                // Switch the page into desktop mode only when the shell actually opened.
                if (payload?.ok !== false)
                    setMode('desktop');
            }
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsx("button", { type: "button", className: css.button, title: t('desktop.transparent'), "aria-label": t('desktop.transparent'), "aria-pressed": active, onClick: () => { void toggle(); }, children: _jsx(IconSparkle16, { size: 16 }) }));
}
//# sourceMappingURL=TransparentDesktopButton.js.map