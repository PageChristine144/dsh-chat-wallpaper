/**
 * Browser image pipeline for the wallpaper plugin: decode a user-chosen file
 * and downscale it to a bounded data URL for durable settings storage.
 */

/** Hard cap for user-uploaded wallpaper files (rejected before reading). */
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024
/** Longest edge after downscaling (settings document stays lean). */
export const IMAGE_MAX_EDGE = 1920
/** JPEG quality for the downscaled data URL. */
export const IMAGE_QUALITY = 0.85

/** Result of turning a user file into a persisted wallpaper. */
export type ImageApplyResult =
  | { ok: true; dataUrl: string }
  | { ok: false; reason: 'too-large' | 'decode-failed' }

/**
 * Turn a user-picked file into a bounded JPEG data URL.
 * @param file - the picked image file.
 * @param maxBytes - file-size cap; oversize files are rejected before reading.
 * @returns the data URL, or a structured failure reason.
 */
export async function applyImageFile(file: File, maxBytes = IMAGE_MAX_BYTES): Promise<ImageApplyResult> {
  if (file.size > maxBytes) return { ok: false, reason: 'too-large' }
  try {
    const image = await loadImageSource(file)
    const dataUrl = downscaleToDataUrl(image)
    return { ok: true, dataUrl }
  } catch {
    return { ok: false, reason: 'decode-failed' }
  }
}

/**
 * Load an image from a Blob/File or a URL/data URL string.
 * @param source - blob or addressable image source.
 * @returns the decoded image element.
 */
export function loadImageSource(source: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = typeof source === 'string' ? source : URL.createObjectURL(source)
    const cleanup = (): void => {
      if (typeof source !== 'string') URL.revokeObjectURL(url)
    }
    image.onload = () => {
      cleanup()
      resolve(image)
    }
    image.onerror = () => {
      cleanup()
      reject(new Error('image decode failed'))
    }
    image.src = url
  })
}

/**
 * Downscale an image to a bounded JPEG data URL, preserving aspect ratio.
 * @param image - decoded source image.
 * @param maxEdge - longest edge after downscaling.
 * @param quality - JPEG quality.
 * @returns the data URL.
 */
export function downscaleToDataUrl(
  image: HTMLImageElement,
  maxEdge = IMAGE_MAX_EDGE,
  quality = IMAGE_QUALITY,
): string {
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('canvas 2d context unavailable')
  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Whether a stored wallpaper value is an embedded data URL (local image mode).
 * @param value - wallpaper settings `value` field.
 * @returns whether the value is a `data:` URL.
 */
export function isDataUrl(value: string): boolean {
  return value.startsWith('data:')
}
