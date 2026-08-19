import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createWallpaperStore } from './store.ts';
import type { WallpaperRowInjected } from './WallpaperRow.tsx';
/** Full component props: runtime share + store share + locale seat + injected face. */
export type WallpaperButtonComponentProps = PropsRuntime<'conversation.session.header.utilities'> & PropsStore<ReturnType<typeof createWallpaperStore>> & PropsLocale<'settings.wallpaper'> & WallpaperRowInjected;
/**
 * Render the header quick-switch button and its panel.
 * @param props - composed slot props.
 * @returns the button (plus the portaled panel while open).
 */
export declare function WallpaperButton(props: WallpaperButtonComponentProps): import("react").JSX.Element;
//# sourceMappingURL=WallpaperButton.d.ts.map