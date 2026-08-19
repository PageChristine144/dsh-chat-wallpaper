/**
 * Host registration for the browser wallpaper preference plus the Wallpaper
 * Engine library surface and the transparent chat desktop control: a
 * browseable list of the local wallpapers, strictly contained raw image/video
 * serving, and open/close routes for the transparent Electron shell that the
 * chat's Desktop-transparent button drives.
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type ChatDesktopConfig } from './chat-desktop-host.ts';
export { DEFAULT_WALLPAPER_SETTINGS, WALLPAPER_MODES, WALLPAPER_SETTINGS_FIELDS, WALLPAPER_SETTINGS_NAMESPACE, type WallpaperMode, type WallpaperSettings, } from './wallpaper-settings.ts';
export type { WeListItem } from './we-host.ts';
export { decodeProjectJson, defaultProjectRoots, defaultWorkshopRoots, resolveEngineRoot, resolveProjectDir, resolveRaw, scanWallpapers, } from './we-host.ts';
export { applyWeProject, defaultWeApplySeam, setWeAudio, type WeApplySeam } from './we-apply.ts';
export { closeShell, isPidAlive, openShell, readShellPid, resolveAppDir, resolveElectronPath, shellPidFile } from './chat-desktop-host.ts';
/** Plugin config: Wallpaper Engine library roots (defaults auto-discover them). */
export interface Config {
    /** Workshop content roots (subdirectories are workshop items). */
    workshopRoots: string[];
    /** Local project roots (subdirectories are user projects). */
    projectRoots: string[];
    /** Transparent chat desktop shell (optional; defaults locate it under the repo). */
    chatDesktop?: ChatDesktopConfig;
}
export declare const Config: z<Config>;
/**
 * Register the durable wallpaper section and the Wallpaper Engine routes when
 * their optional Host services are composed.
 * @param ctx - Host context that may acquire the settings and HTTP services.
 * @param config - validated {@link Config}.
 */
export declare function apply(ctx: Context, config?: Config): void;
//# sourceMappingURL=index.d.ts.map