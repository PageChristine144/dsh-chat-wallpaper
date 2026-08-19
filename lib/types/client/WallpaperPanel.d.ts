import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createWallpaperStore } from './store.ts';
import type { WallpaperRowInjected } from './WallpaperRow.tsx';
/** Panel props: the button's composed props plus the close callback. */
export type WallpaperPanelProps = PropsRuntime<'conversation.session.header.utilities'> & PropsStore<ReturnType<typeof createWallpaperStore>> & PropsLocale<'settings.wallpaper'> & WallpaperRowInjected & {
    onClose: () => void;
};
/**
 * Render the wallpaper popover.
 * @param props - composed slot props plus close callback.
 * @returns the popover element tree.
 */
export declare function WallpaperPanel({ t, useStore, onClose, setMode, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight, setTextColor, setTextOpacity, setTextOutline, setCodeBackground, applyWeWallpaper, setWeKey, }: WallpaperPanelProps): import("react").JSX.Element;
//# sourceMappingURL=WallpaperPanel.d.ts.map