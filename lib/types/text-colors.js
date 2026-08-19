/**
 * Chat text color palette: a curated set of stylish, high-contrast ink colors
 * for the manual text-color picker. Each color is chosen to stay legible on
 * both light and dark wallpapers (mid-saturation, tuned luminance). Used only
 * when the automatic per-surface adaptation is turned off.
 */
/** Shipped text colors in display order. */
export const TEXT_COLORS = Object.freeze([
    Object.freeze({ id: 'ink', nameKey: 'color.ink', css: '#1f2430' }),
    Object.freeze({ id: 'snow', nameKey: 'color.snow', css: '#f5f6fa' }),
    Object.freeze({ id: 'silver', nameKey: 'color.silver', css: '#c0c7d1' }),
    Object.freeze({ id: 'rosegold', nameKey: 'color.rosegold', css: '#e0a98f' }),
    Object.freeze({ id: 'champagne', nameKey: 'color.champagne', css: '#e8d5a8' }),
    Object.freeze({ id: 'azure', nameKey: 'color.azure', css: '#5ea8f0' }),
    Object.freeze({ id: 'violet', nameKey: 'color.violet', css: '#a78bfa' }),
    Object.freeze({ id: 'mint', nameKey: 'color.mint', css: '#5fd6a8' }),
    Object.freeze({ id: 'coral', nameKey: 'color.coral', css: '#ff7f6b' }),
    Object.freeze({ id: 'lemon', nameKey: 'color.lemon', css: '#f2d94e' }),
    Object.freeze({ id: 'seablue', nameKey: 'color.seablue', css: '#46c6d8' }),
    Object.freeze({ id: 'blossom', nameKey: 'color.blossom', css: '#f3a7c2' }),
    Object.freeze({ id: 'grape', nameKey: 'color.grape', css: '#b06ad9' }),
]);
/**
 * Resolve one text color by id.
 * @param id - color id stored in settings.
 * @returns the color option, or undefined for an unknown id.
 */
export function textColorById(id) {
    return TEXT_COLORS.find(color => color.id === id);
}
//# sourceMappingURL=text-colors.js.map