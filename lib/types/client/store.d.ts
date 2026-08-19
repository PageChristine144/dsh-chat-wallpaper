/**
 * Wallpaper row/panel slot store: a mirror of the wallpaper service snapshot.
 * The plugin's apply-world change listener is the only writer; components read
 * via props.useStore.
 */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client';
import { type WallpaperSettings } from '../wallpaper-settings.ts';
/** Store state mirrored from the wallpaper snapshot. */
export interface WallpaperRowState {
    /** Durable wallpaper settings (selection state reads this). */
    settings: WallpaperSettings;
    /** Service revision; -1 until first sync so revision 0 lands as a change. */
    revision: number;
}
/** Declared action shape giving the exported factory a stable return type. */
export type WallpaperRowActions = {
    sync: (draft: WallpaperRowState, settings: WallpaperSettings, revision: number) => void;
};
/**
 * Declares the wallpaper row/panel state and write surface.
 * @returns the store handle.
 */
export declare function createWallpaperStore(): EngineStoreHandle<WallpaperRowState, WallpaperRowActions>;
//# sourceMappingURL=store.d.ts.map