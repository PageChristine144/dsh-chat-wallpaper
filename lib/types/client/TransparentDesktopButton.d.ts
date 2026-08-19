import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { WallpaperMode } from '../wallpaper-settings.ts';
import type { createWallpaperStore } from './store.ts';
/** Injected business face: the wallpaper mode write. */
export interface TransparentDesktopButtonInjected {
    /** Switch the wallpaper mode (desktop on / none off). */
    setMode: (mode: WallpaperMode) => void;
}
/** Full component props: runtime share + store share + locale seat + injected face. */
export type TransparentDesktopButtonProps = PropsRuntime<'conversation.session.header.utilities'> & PropsStore<ReturnType<typeof createWallpaperStore>> & PropsLocale<'settings.wallpaper'> & TransparentDesktopButtonInjected;
/**
 * Render the transparent-desktop toggle button.
 * @param props - composed slot props.
 * @returns the button element.
 */
export declare function TransparentDesktopButton({ t, useStore, setMode }: TransparentDesktopButtonProps): import("react").JSX.Element;
//# sourceMappingURL=TransparentDesktopButton.d.ts.map