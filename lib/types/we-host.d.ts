/** One browseable wallpaper from the local library. */
export interface WeListItem {
    /** Stable identity, `workshop/<id>` or `project/<name>`. */
    key: string;
    /** Wallpaper title from project.json (best-effort). */
    title: string;
    /** Wallpaper Engine type (`video`, `scene`, `web`, `image`, …). */
    type: string;
    /** Raw URL of the preview image (may be a GIF). */
    previewUrl: string;
    /** Raw URL of the main file, only when it is a directly renderable image/video. */
    fileUrl: string | null;
}
/** Whitelisted raw extensions the raw route will serve (images + videos only). */
export declare const WE_RAW_EXTENSIONS: Set<string>;
/** Content types for the whitelisted raw extensions. */
export declare const WE_MIME: Record<string, string>;
/** Default workshop roots: every existing Steam library's workshop content dir. */
export declare function defaultWorkshopRoots(): string[];
/** Default local project roots: every existing wallpaper_engine projects dir. */
export declare function defaultProjectRoots(): string[];
/**
 * Scan every wallpaper in the configured roots into a browseable list.
 * @param workshopRoots - workshop content roots (subdirectories are items).
 * @param projectRoots - local project roots (subdirectories are projects).
 * @returns the browseable wallpaper list.
 */
export declare function scanWallpapers(workshopRoots: readonly string[], projectRoots: readonly string[]): WeListItem[];
/**
 * Resolve a raw request path against a root with strict containment: the
 * resolved absolute path must stay inside the root, and the extension must be
 * whitelisted.
 * @param root - the configured base directory (workshop or projects root).
 * @param rel - the relative path from the URL (already decoded).
 * @returns the safe absolute file path, or undefined when outside the root or not whitelisted.
 */
export declare function resolveRaw(root: string, rel: string): string | undefined;
/** Decode a project.json buffer: UTF-8 first, GBK fallback for Chinese systems. */
export declare function decodeProjectJson(buffer: Buffer): Record<string, unknown> | undefined;
/**
 * Locate the Wallpaper Engine install directory: any existing parent of a
 * known projects root that contains one of the WE executables. The projects
 * roots are `<engine>/projects/myprojects`, so the engine root is two levels
 * up; both the resolved parent and every ancestor up to the Steam library are
 * probed so a custom layout still matches.
 * @param projectRoots - configured local project roots (subdirs are projects).
 * @returns the engine install directory, or undefined when not found.
 */
export declare function resolveEngineRoot(projectRoots: readonly string[]): string | undefined;
/**
 * Resolve a browseable key (`workshop/<id>` or `project/<name>`) to the
 * wallpaper's project directory (the folder holding project.json), strictly
 * contained in the configured roots.
 * @param workshopRoots - workshop content roots (subdirs are workshop items).
 * @param projectRoots - local project roots (subdirs are projects).
 * @param key - the item key from the browseable list.
 * @returns the project directory, or undefined when unknown or outside the roots.
 */
export declare function resolveProjectDir(workshopRoots: readonly string[], projectRoots: readonly string[], key: string): string | undefined;
//# sourceMappingURL=we-host.d.ts.map