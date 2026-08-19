/**
 * DOM-free wallpaper state owner. The service owns the durable wallpaper
 * settings (mode/value/blur/dim/surfaceAlpha/textColor), writes every user
 * gesture through the settings scope, and publishes immutable
 * `wallpaper/change` snapshots. It never touches the DOM — the presenter
 * consumes the snapshots.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client';
import { type TextFont, type TextWeight, type WallpaperMode, type WallpaperSettings } from '../wallpaper-settings.ts';
/** Immutable wallpaper state published on every change. */
export interface WallpaperSnapshot {
    /** The durable wallpaper settings (schema-resolved). */
    settings: WallpaperSettings;
    /** Monotonic change counter. */
    revision: number;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Wallpaper preference and state owner (provided by this plugin). */
        wallpaper: WallpaperRuntime;
    }
    interface Events {
        /**
         * Wallpaper state changed (any settings field, or the scope adopted a
         * durable section).
         * @param snapshot - Current immutable wallpaper snapshot.
         * @mode emit
         */
        'wallpaper/change'(snapshot: WallpaperSnapshot): void;
    }
}
/**
 * Wallpaper preference owner. Reads go through {@link getWallpaper}; writes
 * only through the typed setters; continuous sync only through the
 * `wallpaper/change` event. Every write routes through the settings scope
 * (durable in the Host settings document; process-local for remote browsers).
 */
export declare class WallpaperRuntime {
    private readonly ctx;
    private readonly host;
    private settings;
    private revision;
    private snapshot;
    /**
     * @param ctx - owning context (change events are emitted on it; the scope
     * listener is released through ctx.effect on dispose).
     * @param host - durable settings scope owned by the same plugin.
     */
    constructor(ctx: Context, host: SettingsScope<WallpaperSettings>);
    /**
     * Read the current immutable wallpaper snapshot.
     * @returns the current snapshot (stable reference until the next change).
     */
    getWallpaper(): WallpaperSnapshot;
    /** Select the wallpaper source; unknown modes fall back to `none`.
     * @param mode - the wallpaper source to select. */
    setMode(mode: WallpaperMode): void;
    /** Set the source value (image data URL / remote URL).
     * @param value - the source value to persist. */
    setValue(value: string): void;
    /** Set the wallpaper blur in pixels (clamped 0–40).
     * @param blur - blur magnitude in pixels. */
    setBlur(blur: number): void;
    /** Set the dim overlay opacity (clamped 0–0.8).
     * @param dim - overlay opacity to apply. */
    setDim(dim: number): void;
    /** Set the surface translucency (clamped 0.5–1; 1 = opaque surfaces).
     * @param alpha - surface opacity against the wallpaper. */
    setSurfaceAlpha(alpha: number): void;
    /** Remember the live Wallpaper Engine wallpaper key (gallery selection).
     * @param key - the WE item key, or '' to forget it. */
    setWeKey(key: string): void;
    /** Set the chat font family preset; unknown fonts fall back to `system`.
     * @param font - the font preset id to select. */
    setTextFont(font: TextFont): void;
    /** Set the chat font weight; unknown weights fall back to 400.
     * @param weight - the font weight to select. */
    setTextWeight(weight: TextWeight): void;
    /** Set the manual text color id.
     * @param color - the text-color palette id to select. */
    setTextColor(color: string): void;
    /** Set the text opacity in percent (clamped 0–100; 0 = fully transparent).
     * @param opacity - text opacity as a percent. */
    setTextOpacity(opacity: number): void;
    /** Set the white text-outline thickness (clamped 0–3; 0 = off).
     * @param thickness - outline thickness in steps. */
    setTextOutline(thickness: number): void;
    /** Show or hide the markdown code chip/block backgrounds.
     * @param on - true to show code backgrounds, false to make them transparent. */
    setCodeBackground(on: boolean): void;
    /**
     * Apply several fields in one gesture (the mode+value pair from an image
     * pick). Fields are clamped/narrowed individually; unchanged fields are not
     * written.
     * @param draft - partial settings to apply.
     */
    setWallpaper(draft: Partial<WallpaperSettings>): void;
    /** Adopt the scope's accepted durable section without writing it back. */
    private adopt;
    private write;
    private buildSnapshot;
    private publish;
}
//# sourceMappingURL=runtime.d.ts.map