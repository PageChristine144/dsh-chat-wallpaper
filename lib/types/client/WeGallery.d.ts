import type { WallpaperKey } from './locales.ts';
/** Gallery props: copy, the pick callback, and the current key for selection. */
export interface WeGalleryProps {
    /** Locale resolver (the wallpaper copy namespace). */
    t: (key: WallpaperKey) => string;
    /** Switch the live Wallpaper Engine wallpaper and enter desktop mode. */
    onApply: (key: string) => Promise<void>;
    /** Current wallpaper key, to mark the selected cell. */
    currentKey?: string;
}
/**
 * Render the Wallpaper Engine gallery.
 * @param props - copy, apply callback, current key.
 * @returns the gallery element tree.
 */
export declare function WeGallery({ t, onApply, currentKey }: WeGalleryProps): import("react").JSX.Element;
//# sourceMappingURL=WeGallery.d.ts.map