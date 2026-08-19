import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { TextFont, TextWeight, WallpaperMode } from '../wallpaper-settings.ts';
import type { ImageApplyResult } from './image.ts';
import type { createWallpaperStore } from './store.ts';
/** Injected business face: the runtime write surface plus the file decode path. */
export interface WallpaperRowInjected {
    /** Select the wallpaper source. */
    setMode: (mode: WallpaperMode) => void;
    /** Set the source value (image data URL / remote URL). */
    setValue: (value: string) => void;
    /** Set the wallpaper blur in pixels. */
    setBlur: (value: number) => void;
    /** Set the dim overlay opacity. */
    setDim: (value: number) => void;
    /** Set the surface translucency (1 = opaque). */
    setSurfaceAlpha: (value: number) => void;
    /** Set the chat font family preset. */
    setTextFont: (font: TextFont) => void;
    /** Set the chat font weight. */
    setTextWeight: (weight: TextWeight) => void;
    /** Set the manual text color id. */
    setTextColor: (color: string) => void;
    /** Set the text opacity in percent (0 = fully transparent). */
    setTextOpacity: (opacity: number) => void;
    /** Set the white text-outline thickness (0 = off). */
    setTextOutline: (outline: number) => void;
    /** Show or hide the markdown code chip/block backgrounds. */
    setCodeBackground: (on: boolean) => void;
    /** Decode a picked file into a persisted wallpaper value. */
    applyImageFile: (file: File) => Promise<ImageApplyResult>;
    /** Switch the live Wallpaper Engine wallpaper (host apply route). */
    applyWeWallpaper: (key: string) => Promise<boolean>;
    /** Remember the applied Wallpaper Engine wallpaper key. */
    setWeKey: (key: string) => void;
}
/** Full component props: runtime share + store share + locale seat + injected face. */
export type WallpaperRowComponentProps = PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createWallpaperStore>> & PropsLocale<'settings.wallpaper'> & WallpaperRowInjected;
/**
 * Render the Chat-background row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export declare function WallpaperRow({ t, useStore, setMode, setValue, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight, setTextColor, setTextOpacity, setTextOutline, setCodeBackground, applyImageFile, applyWeWallpaper, setWeKey, }: WallpaperRowComponentProps): import("react").JSX.Element;
//# sourceMappingURL=WallpaperRow.d.ts.map