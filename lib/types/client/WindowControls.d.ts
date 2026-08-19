import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createWallpaperStore } from './store.ts';
/** Window-control bridge injected by the transparent shell's preload. */
export interface DesktopShellBridge {
    /** Re-run the one-click clear screen (hide every other window + icons). */
    clearDesktop?: () => void;
    minimize: () => void;
    toggleMaximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
    onMaximizedChange: (callback: (maximized: boolean) => void) => () => void;
}
declare global {
    interface Window {
        /** Present only inside the transparent Electron shell (preload bridge). */
        desktopShell?: DesktopShellBridge;
    }
}
/** Injected face: window controls need no business surface. */
export interface WindowControlsInjected {
}
/** Full component props: runtime share + store share + locale seat. */
export type WindowControlsProps = PropsRuntime<'conversation.session.header.utilities'> & PropsStore<ReturnType<typeof createWallpaperStore>> & PropsLocale<'settings.wallpaper'> & WindowControlsInjected;
/**
 * Render the window control buttons (shell environment only).
 * @param props - composed slot props.
 * @returns the button group, or null outside the transparent shell.
 */
export declare function WindowControls({ t }: WindowControlsProps): import("react").JSX.Element | null;
//# sourceMappingURL=WindowControls.d.ts.map