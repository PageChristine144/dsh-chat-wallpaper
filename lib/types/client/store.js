/**
 * Wallpaper row/panel slot store: a mirror of the wallpaper service snapshot.
 * The plugin's apply-world change listener is the only writer; components read
 * via props.useStore.
 */
import { defineStore } from '@deepseek-ai/dsh-client-runtime/client';
import { DEFAULT_WALLPAPER_SETTINGS } from "../wallpaper-settings.js";
/**
 * Declares the wallpaper row/panel state and write surface.
 * @returns the store handle.
 */
export function createWallpaperStore() {
    return defineStore({
        init: () => ({ settings: { ...DEFAULT_WALLPAPER_SETTINGS }, revision: -1 }),
        actions: {
            sync: (d, settings, revision) => {
                if (revision <= d.revision)
                    return;
                d.settings = settings;
                d.revision = revision;
            },
        },
    });
}
//# sourceMappingURL=store.js.map