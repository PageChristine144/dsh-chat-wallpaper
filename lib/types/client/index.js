import { WALLPAPER_SETTINGS_NAMESPACE } from "../wallpaper-settings.js";
import { applyImageFile } from "./image.js";
import { en, zh } from "./locales.js";
import { WallpaperPresenter } from "./presenter.js";
import { WallpaperRuntime } from "./runtime.js";
import { createWallpaperStore } from "./store.js";
import { applyWeWallpaper } from "./we.js";
import { WallpaperButton } from "./WallpaperButton.js";
import { WallpaperRow } from "./WallpaperRow.js";
import { TransparentDesktopButton } from "./TransparentDesktopButton.js";
import { WindowControls } from "./WindowControls.js";
export { WallpaperRuntime } from "./runtime.js";
export { WallpaperPresenter } from "./presenter.js";
/** Namespace owning this feature's settings-row copy. */
export const SETTINGS_NS = 'settings.wallpaper';
/**
 * Required services: settings transport, slots/locale/theme, plus the
 * forwarded settings invalidation that `bindSettingsScope` subscribes to on
 * this context.
 */
export const inject = ['slots', 'locale', 'theme', 'connection', 'remote', 'settingsScope'];
/**
 * Client plugin body: provide the wallpaper service, drive the presenter, and
 * register the feature-owned settings row and header quick-switch button.
 * @param ctx - client cordis context.
 */
export function apply(ctx) {
    const host = ctx.settingsScope.bind({ namespace: WALLPAPER_SETTINGS_NAMESPACE });
    const wallpaper = new WallpaperRuntime(ctx, host);
    ctx.provide('wallpaper', wallpaper);
    const presenter = new WallpaperPresenter(ctx.theme);
    const applySnapshot = (snapshot) => {
        presenter.apply(snapshot, ctx.theme.getTheme());
    };
    ctx.on('wallpaper/change', applySnapshot);
    ctx.on('theme/change', (snapshot) => { presenter.onThemeChange(snapshot); });
    applySnapshot(wallpaper.getWallpaper());
    ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), 'ui-wallpaper: settings dictionaries');
    // One store per mount scope: the settings row lives at root scope, the
    // header button at session scope, and a store handle mounts under exactly
    // one scope. Both mirrors are fed from the same wallpaper/change stream.
    const rowStore = createWallpaperStore();
    const headerStore = createWallpaperStore();
    let rowBound;
    let headerBound;
    const sync = (snapshot) => {
        rowBound?.sync(snapshot.settings, snapshot.revision);
        headerBound?.sync(snapshot.settings, snapshot.revision);
    };
    ctx.on('wallpaper/change', sync);
    const face = () => ({
        setMode: (mode) => { wallpaper.setMode(mode); },
        setValue: (value) => { wallpaper.setValue(value); },
        setBlur: (value) => { wallpaper.setBlur(value); },
        setDim: (value) => { wallpaper.setDim(value); },
        setSurfaceAlpha: (value) => { wallpaper.setSurfaceAlpha(value); },
        setTextFont: (font) => { wallpaper.setTextFont(font); },
        setTextWeight: (weight) => { wallpaper.setTextWeight(weight); },
        setTextColor: (color) => { wallpaper.setTextColor(color); },
        setTextOpacity: (opacity) => { wallpaper.setTextOpacity(opacity); },
        setTextOutline: (outline) => { wallpaper.setTextOutline(outline); },
        setCodeBackground: (on) => { wallpaper.setCodeBackground(on); },
        applyImageFile: file => applyImageFile(file),
        applyWeWallpaper: key => applyWeWallpaper(key).then(result => result.ok),
        setWeKey: (key) => { wallpaper.setWeKey(key); },
    });
    ctx.slots.inject('settings.general.item', () => ctx.slots.register({
        name: 'settings.general.item',
        id: 'wallpaper',
        order: 30,
        store: rowStore,
        locale: SETTINGS_NS,
        inject: (actions) => {
            rowBound = actions;
            // Re-sync from the getter so no event is lost between registration and
            // first render (the store's revision guard drops stale duplicates).
            sync(wallpaper.getWallpaper());
            return face();
        },
    }, WallpaperRow));
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
        name: 'conversation.session.header.utilities',
        id: 'wallpaper',
        order: 30,
        store: headerStore,
        locale: SETTINGS_NS,
        inject: (_sessionId, actions) => {
            headerBound = actions;
            sync(wallpaper.getWallpaper());
            return face();
        },
    }, WallpaperButton));
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
        name: 'conversation.session.header.utilities',
        id: 'transparent-desktop',
        order: 31,
        store: headerStore,
        locale: SETTINGS_NS,
        inject: (_sessionId, actions) => {
            headerBound = actions;
            sync(wallpaper.getWallpaper());
            return { setMode: (mode) => { wallpaper.setMode(mode); } };
        },
    }, TransparentDesktopButton));
    // Browser-style window controls, only when running inside the transparent
    // shell (window.desktopShell). Registered last so they sit at the far right
    // of the header utilities row, like a normal browser's title-bar buttons.
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
        name: 'conversation.session.header.utilities',
        id: 'window-controls',
        order: 32,
        store: headerStore,
        locale: SETTINGS_NS,
        inject: (_sessionId, actions) => {
            headerBound = actions;
            sync(wallpaper.getWallpaper());
            // Closing the shell leaves desktop mode: reset the durable mode so the
            // regular chat window never keeps the fully-transparent surfaces.
            return { setMode: (mode) => { wallpaper.setMode(mode); } };
        },
    }, WindowControls));
    ctx.effect(() => () => { presenter.dispose(); }, 'ui-wallpaper: presenter disposal');
}
//# sourceMappingURL=index.js.map