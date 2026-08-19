/**
 * Browser-side Wallpaper Engine surface: loads the host-scanned wallpaper list
 * and decides whether a wallpaper URL is a video (rendered in the video layer
 * instead of the image layer).
 */
/** Video extensions the presenter renders in the wallpaper video layer. */
const VIDEO_EXTENSION = /\.(mp4|webm|m4v)(\?|#|$)/i;
/**
 * Whether a wallpaper value is a video URL (render in the video layer).
 * @param value - the wallpaper settings value (a URL for image/url modes).
 * @returns whether the value points at a playable video.
 */
export function isVideoUrl(value) {
    return VIDEO_EXTENSION.test(value);
}
/**
 * Load the host-scanned Wallpaper Engine library.
 * @returns the browseable wallpaper list.
 */
export async function loadWeList() {
    const response = await fetch('/wallpaper-engine/list', { cache: 'no-store' });
    if (!response.ok)
        throw new Error(`wallpaper-engine list failed: ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.items))
        throw new Error('wallpaper-engine list malformed');
    return payload.items;
}
/**
 * Ask the host to apply one wallpaper through Wallpaper Engine (the live
 * desktop wallpaper switches; the transparent chat shell shows it through).
 * @param key - the browseable item key (`workshop/<id>` or `project/<name>`).
 * @returns the apply result from the host.
 */
export async function applyWeWallpaper(key) {
    const response = await fetch('/wallpaper-engine/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key }),
    });
    if (!response.ok)
        return { ok: false, reason: `apply-failed:${response.status}` };
    const payload = await response.json().catch(() => null);
    if (payload === null || typeof payload.ok !== 'boolean')
        return { ok: false, reason: 'apply-malformed' };
    return payload;
}
/**
 * Mute or unmute all Wallpaper Engine wallpapers through the host route.
 * @param muted - true to mute, false to play.
 * @returns whether the audio control was accepted.
 */
export async function setWeAudio(muted) {
    const response = await fetch('/wallpaper-engine/audio', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ muted }),
    });
    if (!response.ok)
        return { ok: false, reason: `audio-failed:${response.status}` };
    const payload = await response.json().catch(() => null);
    if (payload === null || typeof payload.ok !== 'boolean')
        return { ok: false, reason: 'audio-malformed' };
    return payload;
}
//# sourceMappingURL=we.js.map