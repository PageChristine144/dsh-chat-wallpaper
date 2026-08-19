/**
 * Browser image pipeline for the wallpaper plugin: decode a user-chosen file
 * and downscale it to a bounded data URL for durable settings storage.
 */
/** Hard cap for user-uploaded wallpaper files (rejected before reading). */
export declare const IMAGE_MAX_BYTES: number;
/** Longest edge after downscaling (settings document stays lean). */
export declare const IMAGE_MAX_EDGE = 1920;
/** JPEG quality for the downscaled data URL. */
export declare const IMAGE_QUALITY = 0.85;
/** Result of turning a user file into a persisted wallpaper. */
export type ImageApplyResult = {
    ok: true;
    dataUrl: string;
} | {
    ok: false;
    reason: 'too-large' | 'decode-failed';
};
/**
 * Turn a user-picked file into a bounded JPEG data URL.
 * @param file - the picked image file.
 * @param maxBytes - file-size cap; oversize files are rejected before reading.
 * @returns the data URL, or a structured failure reason.
 */
export declare function applyImageFile(file: File, maxBytes?: number): Promise<ImageApplyResult>;
/**
 * Load an image from a Blob/File or a URL/data URL string.
 * @param source - blob or addressable image source.
 * @returns the decoded image element.
 */
export declare function loadImageSource(source: Blob | string): Promise<HTMLImageElement>;
/**
 * Downscale an image to a bounded JPEG data URL, preserving aspect ratio.
 * @param image - decoded source image.
 * @param maxEdge - longest edge after downscaling.
 * @param quality - JPEG quality.
 * @returns the data URL.
 */
export declare function downscaleToDataUrl(image: HTMLImageElement, maxEdge?: number, quality?: number): string;
/**
 * Whether a stored wallpaper value is an embedded data URL (local image mode).
 * @param value - wallpaper settings `value` field.
 * @returns whether the value is a `data:` URL.
 */
export declare function isDataUrl(value: string): boolean;
//# sourceMappingURL=image.d.ts.map