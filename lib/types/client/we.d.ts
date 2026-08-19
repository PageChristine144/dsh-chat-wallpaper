/**
 * Browser-side Wallpaper Engine surface: loads the host-scanned wallpaper list
 * and decides whether a wallpaper URL is a video (rendered in the video layer
 * instead of the image layer).
 */
/** One browseable wallpaper as the host list route reports it. */
export interface WeItem {
    /** Stable identity, `workshop/<id>` or `project/<name>`. */
    key: string;
    /** Wallpaper title from project.json. */
    title: string;
    /** Wallpaper Engine type (`video`, `scene`, `web`, `image`, …). */
    type: string;
    /** Raw URL of the preview image (may be an animated GIF). */
    previewUrl: string;
    /** Raw URL of the main file, or null when it is not directly renderable. */
    fileUrl: string | null;
}
/**
 * Whether a wallpaper value is a video URL (render in the video layer).
 * @param value - the wallpaper settings value (a URL for image/url modes).
 * @returns whether the value points at a playable video.
 */
export declare function isVideoUrl(value: string): boolean;
/**
 * Load the host-scanned Wallpaper Engine library.
 * @returns the browseable wallpaper list.
 */
export declare function loadWeList(): Promise<WeItem[]>;
/** Result of asking the host to switch the live Wallpaper Engine wallpaper. */
export interface WeApplyResult {
    /** Whether the live wallpaper switched successfully. */
    ok: boolean;
    /** Machine-readable failure reason (engine-not-found / project-not-found / …). */
    reason?: string;
}
/**
 * Ask the host to apply one wallpaper through Wallpaper Engine (the live
 * desktop wallpaper switches; the transparent chat shell shows it through).
 * @param key - the browseable item key (`workshop/<id>` or `project/<name>`).
 * @returns the apply result from the host.
 */
export declare function applyWeWallpaper(key: string): Promise<WeApplyResult>;
/**
 * Mute or unmute all Wallpaper Engine wallpapers through the host route.
 * @param muted - true to mute, false to play.
 * @returns whether the audio control was accepted.
 */
export declare function setWeAudio(muted: boolean): Promise<WeApplyResult>;
//# sourceMappingURL=we.d.ts.map