/**
 * Chat text color palette: a curated set of stylish, high-contrast ink colors
 * for the manual text-color picker. Each color is chosen to stay legible on
 * both light and dark wallpapers (mid-saturation, tuned luminance). Used only
 * when the automatic per-surface adaptation is turned off.
 */
/** One selectable text color. */
export interface TextColorOption {
    /** Color id stored in the wallpaper settings `textColor` field. */
    id: string;
    /** Localized display name key (resolved through the wallpaper locale). */
    nameKey: string;
    /** CSS color value applied to the chat labels. */
    css: string;
}
/** Shipped text colors in display order. */
export declare const TEXT_COLORS: readonly TextColorOption[];
/**
 * Resolve one text color by id.
 * @param id - color id stored in settings.
 * @returns the color option, or undefined for an unknown id.
 */
export declare function textColorById(id: string): TextColorOption | undefined;
//# sourceMappingURL=text-colors.d.ts.map