import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type WallpaperKey } from './locales.ts';
export type { WallpaperRowInjected, WallpaperRowComponentProps } from './WallpaperRow.tsx';
export type { WallpaperButtonComponentProps } from './WallpaperButton.tsx';
export type { TransparentDesktopButtonInjected, TransparentDesktopButtonProps } from './TransparentDesktopButton.tsx';
export type { WindowControlsInjected, WindowControlsProps, DesktopShellBridge } from './WindowControls.tsx';
export type { WallpaperPanelProps } from './WallpaperPanel.tsx';
export type { WallpaperRowState, WallpaperRowActions } from './store.ts';
export type { WallpaperKey } from './locales.ts';
export { WallpaperRuntime } from './runtime.ts';
export type { WallpaperSnapshot } from './runtime.ts';
export { WallpaperPresenter } from './presenter.ts';
export type { WallpaperMode, WallpaperSettings } from '../wallpaper-settings.ts';
/** Namespace owning this feature's settings-row copy. */
export declare const SETTINGS_NS = "settings.wallpaper";
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The Chat-background row's copy. */
        'settings.wallpaper': WallpaperKey;
    }
}
/**
 * Required services: settings transport, slots/locale/theme, plus the
 * forwarded settings invalidation that `bindSettingsScope` subscribes to on
 * this context.
 */
export declare const inject: string[];
/**
 * Client plugin body: provide the wallpaper service, drive the presenter, and
 * register the feature-owned settings row and header quick-switch button.
 * @param ctx - client cordis context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map