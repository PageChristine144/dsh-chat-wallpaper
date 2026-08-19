/** Wallpaper preferences stored in the Host user-settings document. */
import z from '@deepseek-ai/schemastery';
/** Built-in wallpaper sources accepted at the registry and settings boundaries. */
export declare const WALLPAPER_MODES: readonly ["none", "image", "url", "desktop"];
/** Settings namespace owned by the wallpaper plugin. */
export declare const WALLPAPER_SETTINGS_NAMESPACE = "ui-wallpaper";
/** Field names of the durable wallpaper section. */
export declare const WALLPAPER_SETTINGS_FIELDS: {
    readonly MODE: "mode";
    readonly VALUE: "value";
    readonly BLUR: "blur";
    readonly DIM: "dim";
    readonly SURFACE_ALPHA: "surfaceAlpha";
    readonly WE_KEY: "weKey";
    readonly TEXT_FONT: "textFont";
    readonly TEXT_WEIGHT: "textWeight";
    readonly TEXT_COLOR: "textColor";
    readonly TEXT_OPACITY: "textOpacity";
    readonly TEXT_OUTLINE: "textOutline";
    readonly CODE_BACKGROUND: "codeBackground";
};
/** Wallpaper source discriminant. */
export type WallpaperMode = typeof WALLPAPER_MODES[number];
/** Built-in chat font families (high-contrast, wallpaper-friendly). */
export declare const TEXT_FONTS: readonly ["system", "serif", "mono", "rounded"];
/** Chat font family preset id. */
export type TextFont = typeof TEXT_FONTS[number];
/** Chat font weight presets (400–800). */
export declare const TEXT_WEIGHTS: readonly [400, 500, 600, 700, 800];
/** Chat font weight preset. */
export type TextWeight = typeof TEXT_WEIGHTS[number];
/** Durable wallpaper section shared by the Host schema and the browser scope. */
export interface WallpaperSettings {
    /** Source: none / local image data URL / remote image URL / desktop-transparent. */
    mode: WallpaperMode;
    /** Image data URL or remote URL; empty while mode is `none` or `desktop`. */
    value: string;
    /** Wallpaper blur in pixels (0–40). */
    blur: number;
    /** Dim overlay opacity over the wallpaper (0–0.8). */
    dim: number;
    /** Surface opacity against the wallpaper (0.5–1; 1 = opaque surfaces). */
    surfaceAlpha: number;
    /** Live Wallpaper Engine wallpaper key (`workshop/<id>` or `project/<name>`),
     *  remembered so the WE gallery can mark the applied wallpaper. */
    weKey: string;
    /** Chat font family preset id. */
    textFont: TextFont;
    /** Chat font weight (400–800; higher = more legible over busy wallpapers). */
    textWeight: TextWeight;
    /** Manual text color id (text-colors.ts). */
    textColor: string;
    /** Text opacity in percent (0 = fully transparent, 100 = opaque); the
     *  chosen ink AND its white outline fade together toward transparent. */
    textOpacity: number;
    /** White outline thickness around all text (0 = off, 5 = thick, fine
     *  0.25 steps), so chat text stays readable over any wallpaper regardless
     *  of the text color. */
    textOutline: number;
    /** Show the markdown code chip/block background (true); when off the
     *  backgrounds go transparent, handy over a live desktop wallpaper. */
    codeBackground: boolean;
}
/** Default wallpaper section when the user-settings document has no override. */
export declare const DEFAULT_WALLPAPER_SETTINGS: WallpaperSettings;
/** Numeric field bounds shared by the schema and the runtime write clamp. */
export declare const WALLPAPER_BLUR_MAX = 40;
export declare const WALLPAPER_DIM_MAX = 0.8;
export declare const WALLPAPER_ALPHA_MIN = 0.5;
export declare const WALLPAPER_ALPHA_MAX = 1;
export declare const TEXT_OUTLINE_MAX = 5;
export declare const TEXT_OPACITY_MAX = 100;
/** Durable wallpaper schema; also the wire envelope the browser scope validates against. */
export declare const WallpaperSettingsSchema: z<WallpaperSettings>;
/**
 * Narrow one wire or registry value to a persistable wallpaper source.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in wallpaper mode.
 */
export declare function isWallpaperMode(value: unknown): value is WallpaperMode;
/**
 * Narrow one wire or registry value to a built-in chat font preset.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in font preset.
 */
export declare function isTextFont(value: unknown): value is TextFont;
/**
 * Narrow one wire or registry value to a built-in chat font weight.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in font weight.
 */
export declare function isTextWeight(value: unknown): value is TextWeight;
/**
 * Clamp a numeric wallpaper field to its schema range.
 * @param field - the numeric field being written.
 * @param value - raw caller value.
 * @returns the value clamped to the field's documented bounds.
 */
export declare function clampWallpaperNumber(field: 'blur' | 'dim' | 'surfaceAlpha' | 'textOutline' | 'textOpacity', value: number): number;
//# sourceMappingURL=wallpaper-settings.d.ts.map