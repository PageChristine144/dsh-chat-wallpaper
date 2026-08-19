/** Wallpaper preferences stored in the Host user-settings document. */
import z from '@deepseek-ai/schemastery';
/** Built-in wallpaper sources accepted at the registry and settings boundaries. */
export const WALLPAPER_MODES = ['none', 'image', 'url', 'desktop'];
/** Settings namespace owned by the wallpaper plugin. */
export const WALLPAPER_SETTINGS_NAMESPACE = 'ui-wallpaper';
/** Field names of the durable wallpaper section. */
export const WALLPAPER_SETTINGS_FIELDS = {
    MODE: 'mode',
    VALUE: 'value',
    BLUR: 'blur',
    DIM: 'dim',
    SURFACE_ALPHA: 'surfaceAlpha',
    WE_KEY: 'weKey',
    TEXT_FONT: 'textFont',
    TEXT_WEIGHT: 'textWeight',
    TEXT_COLOR: 'textColor',
    TEXT_OPACITY: 'textOpacity',
    TEXT_OUTLINE: 'textOutline',
    CODE_BACKGROUND: 'codeBackground',
};
/** Built-in chat font families (high-contrast, wallpaper-friendly). */
export const TEXT_FONTS = ['system', 'serif', 'mono', 'rounded'];
/** Chat font weight presets (400–800). */
export const TEXT_WEIGHTS = [400, 500, 600, 700, 800];
/** Default wallpaper section when the user-settings document has no override. */
export const DEFAULT_WALLPAPER_SETTINGS = {
    mode: 'none',
    value: '',
    blur: 0,
    dim: 0.35,
    surfaceAlpha: 0.82,
    weKey: '',
    textFont: 'system',
    textWeight: 400,
    textColor: 'ink',
    textOpacity: 100,
    textOutline: 2,
    codeBackground: true,
};
/** Numeric field bounds shared by the schema and the runtime write clamp. */
export const WALLPAPER_BLUR_MAX = 40;
export const WALLPAPER_DIM_MAX = 0.8;
export const WALLPAPER_ALPHA_MIN = 0.5;
export const WALLPAPER_ALPHA_MAX = 1;
export const TEXT_OUTLINE_MAX = 5;
export const TEXT_OPACITY_MAX = 100;
/** Durable wallpaper schema; also the wire envelope the browser scope validates against. */
export const WallpaperSettingsSchema = z.object({
    [WALLPAPER_SETTINGS_FIELDS.MODE]: z.union([...WALLPAPER_MODES]).default(DEFAULT_WALLPAPER_SETTINGS.mode),
    [WALLPAPER_SETTINGS_FIELDS.VALUE]: z.string().default(DEFAULT_WALLPAPER_SETTINGS.value),
    [WALLPAPER_SETTINGS_FIELDS.BLUR]: z.number().min(0).max(WALLPAPER_BLUR_MAX).default(DEFAULT_WALLPAPER_SETTINGS.blur),
    [WALLPAPER_SETTINGS_FIELDS.DIM]: z.number().min(0).max(WALLPAPER_DIM_MAX).default(DEFAULT_WALLPAPER_SETTINGS.dim),
    [WALLPAPER_SETTINGS_FIELDS.SURFACE_ALPHA]: z.number()
        .min(WALLPAPER_ALPHA_MIN).max(WALLPAPER_ALPHA_MAX).default(DEFAULT_WALLPAPER_SETTINGS.surfaceAlpha),
    [WALLPAPER_SETTINGS_FIELDS.WE_KEY]: z.string().default(DEFAULT_WALLPAPER_SETTINGS.weKey),
    [WALLPAPER_SETTINGS_FIELDS.TEXT_FONT]: z.union([...TEXT_FONTS]).default(DEFAULT_WALLPAPER_SETTINGS.textFont),
    [WALLPAPER_SETTINGS_FIELDS.TEXT_WEIGHT]: z.union([...TEXT_WEIGHTS]).default(DEFAULT_WALLPAPER_SETTINGS.textWeight),
    [WALLPAPER_SETTINGS_FIELDS.TEXT_COLOR]: z.string().default(DEFAULT_WALLPAPER_SETTINGS.textColor),
    [WALLPAPER_SETTINGS_FIELDS.TEXT_OPACITY]: z.number()
        .min(0).max(TEXT_OPACITY_MAX).default(DEFAULT_WALLPAPER_SETTINGS.textOpacity),
    [WALLPAPER_SETTINGS_FIELDS.TEXT_OUTLINE]: z.number()
        .min(0).max(TEXT_OUTLINE_MAX).default(DEFAULT_WALLPAPER_SETTINGS.textOutline),
    [WALLPAPER_SETTINGS_FIELDS.CODE_BACKGROUND]: z.boolean().default(DEFAULT_WALLPAPER_SETTINGS.codeBackground),
});
/**
 * Narrow one wire or registry value to a persistable wallpaper source.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in wallpaper mode.
 */
export function isWallpaperMode(value) {
    return WALLPAPER_MODES.some(mode => mode === value);
}
/**
 * Narrow one wire or registry value to a built-in chat font preset.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in font preset.
 */
export function isTextFont(value) {
    return TEXT_FONTS.some(font => font === value);
}
/**
 * Narrow one wire or registry value to a built-in chat font weight.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in font weight.
 */
export function isTextWeight(value) {
    return TEXT_WEIGHTS.some(weight => weight === value);
}
/**
 * Clamp a numeric wallpaper field to its schema range.
 * @param field - the numeric field being written.
 * @param value - raw caller value.
 * @returns the value clamped to the field's documented bounds.
 */
export function clampWallpaperNumber(field, value) {
    switch (field) {
        case 'blur': return Math.min(Math.max(value, 0), WALLPAPER_BLUR_MAX);
        case 'dim': return Math.min(Math.max(value, 0), WALLPAPER_DIM_MAX);
        case 'surfaceAlpha': return Math.min(Math.max(value, WALLPAPER_ALPHA_MIN), WALLPAPER_ALPHA_MAX);
        case 'textOutline': return Math.min(Math.max(value, 0), TEXT_OUTLINE_MAX);
        case 'textOpacity': return Math.min(Math.max(value, 0), TEXT_OPACITY_MAX);
    }
}
//# sourceMappingURL=wallpaper-settings.js.map