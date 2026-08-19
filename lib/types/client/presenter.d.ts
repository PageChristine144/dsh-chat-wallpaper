/**
 * Global wallpaper DOM applier: projects a WallpaperSnapshot plus the current
 * ThemeSnapshot onto the document. It owns two fixed layers on `body` — the
 * wallpaper layer and the dim overlay — both behind the app (z-index -1), and
 * rides the theme plugin's official `theme.overrideTokens` extension point to
 * make the surface tokens translucent and retune the label colors. The
 * presenter only ever retracts what it wrote itself: layers it created, the
 * override layer it pushed, the body background it forced transparent, and
 * the body attribute it owns.
 *
 * Override values are concrete per-palette pairs, so a palette switch (or a
 * third-party theme) needs a recompute: on `theme/change` the presenter drops
 * its override layer first (the theme presenter re-applies the pure cascade),
 * re-reads the surface token bases for both palettes, and pushes a fresh
 * layer. Re-entrant publishes from those operations are absorbed by a guard
 * and a self-echo revision match.
 */
import type { ThemeSnapshot, ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client';
import type { WallpaperSnapshot } from './runtime.ts';
/** The theme service surface this presenter consumes (ctx.theme in the app). */
export interface ThemeFace {
    /** Stack a token override layer; the disposer removes exactly this layer. */
    overrideTokens(source: string, tokens: ThemeTokenOverrides): () => void;
    /** Current immutable theme snapshot (for self-echo revision matching). */
    getTheme(): ThemeSnapshot;
}
/** Pure surface token values for both palettes, read before any wallpaper override. */
export interface SurfaceTokenBase {
    /** Token → declared value while the light base palette is active. */
    light: Readonly<Record<string, string>>;
    /** Token → declared value while the dark base palette is active. */
    dark: Readonly<Record<string, string>>;
}
/** Presenter seams; every one is injectable for specs and defaulted for the app. */
export interface WallpaperPresenterOptions {
    /** Read the pure surface token bases (default: computed-style read with a palette probe). */
    readTokenBase?: () => SurfaceTokenBase;
}
/**
 * Read the pure surface token bases for both palettes from the live cascade:
 * the current palette as-is, the other palette by briefly toggling the dark
 * attribute (synchronous reads; the browser cannot paint mid-function, so the
 * probe is invisible).
 * @returns token bases keyed by palette.
 */
export declare function defaultReadTokenBase(): SurfaceTokenBase;
/**
 * Applies wallpaper snapshots to the document; one instance per plugin fiber.
 */
export declare class WallpaperPresenter {
    private readonly theme;
    private readonly layer;
    private readonly videoLayer;
    private readonly dimLayer;
    private readonly readTokenBase;
    private overrideDisposer;
    private appliedThemeRevision;
    private current;
    private handlingThemeChange;
    private ownsBodyBackground;
    private textStyleTag;
    /**
     * @param theme - theme service face (overrideTokens + getTheme).
     * @param options - injectable seams for specs.
     */
    constructor(theme: ThemeFace, options?: WallpaperPresenterOptions);
    /**
     * Project a wallpaper snapshot onto the document: show/hide the layers,
     * apply blur/dim, force the body background transparent, and push the
     * surface/color override layer through the theme service.
     * @param wallpaper - resolved wallpaper snapshot from ctx.wallpaper.
     * @param theme - current theme snapshot from ctx.theme.
     */
    apply(wallpaper: WallpaperSnapshot, theme: ThemeSnapshot): void;
    /**
     * Recompute the override layer after a palette switch (theme/change). Drops
     * the stale layer, re-reads the pure bases, and pushes a fresh layer.
     * Self-echo publishes (from this presenter's own overrideTokens) and
     * re-entrant cascades are skipped.
     * @param snapshot - the theme snapshot that changed.
     */
    onThemeChange(snapshot: ThemeSnapshot): void;
    /** Retract every DOM write this presenter made. */
    dispose(): void;
    private showLayers;
    /** Blur/scale the active media layer (blur bleeds at edges; scale hides the margin). */
    private applyMediaEffects;
    private hideLayers;
    /** Stop playback and release the source (stops the network stream). */
    private pauseVideo;
    private pushOverride;
    /**
     * Apply the chat typography on the document root: font family through the
     * theme's --dsw-font-family variable (so EVERY text node — historical and
     * new — inherits it) plus the chosen weight, and the label color policy.
     *
     * The chosen palette color becomes --dsw-text-ink and every label tier
     * derives from it (whole-app, both palettes), so the text color applies
     * globally; the opacity (--dsw-text-opacity, 0–1) fades the ink AND its
     * white outline together toward transparent. The outline is only rendered
     * while body[data-dsw-outline] is set to a non-zero value, so thickness 0
     * leaves no shadow at all (a zero-offset shadow would still hint at the
     * glyph edges through antialiasing).
     *
     * Inside the transparent shell the palette color is used (legibility over
     * the wallpaper is the point of the white outline); outside it (the regular
     * chat window after leaving desktop mode) the ink is forced to the default
     * black so the chat reads normally on the browser's own background.
     */
    private applyText;
    private releaseOverride;
}
//# sourceMappingURL=presenter.d.ts.map