import type { TextFont } from '../wallpaper-settings.ts';
import type { WallpaperKey } from './locales.ts';
/** One labeled range slider bound to a numeric wallpaper field. While the
 *  user drags, the thumb and readout follow the pointer directly (a local
 *  draft), so the control never snaps back against the async settings write;
 *  on release it settles onto the persisted value. Continuous by default
 *  (step 'any'); values are rounded to 0.01 to avoid float noise. */
export declare function Slider(props: {
    css: Record<string, string>;
    label: string;
    min: number;
    max: number;
    value: number;
    step?: number | 'any';
    onChange: (value: number) => void;
}): import("react").JSX.Element;
/** Chat font family presets in display order. */
export declare const FONT_TIERS: readonly {
    id: TextFont;
    labelKey: WallpaperKey;
}[];
/** Chat font weights in display order (higher = more legible). */
export declare const WEIGHT_TIERS: readonly {
    id: number;
    labelKey: string;
}[];
//# sourceMappingURL=wallpaper-controls.d.ts.map