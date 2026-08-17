// @vitest-environment jsdom
/** Image pipeline: oversize rejection, decode path, downscale dimensions,
 * and data-URL detection. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyImageFile, downscaleToDataUrl, isDataUrl, loadImageSource,
} from '../src/client/image.ts'

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

interface CanvasStub {
  /** Canvas instances the stubbed HTMLCanvasElement created, in order. */
  instances: { width: number; height: number }[]
  drawImage: ReturnType<typeof vi.fn>
  toDataURL: ReturnType<typeof vi.fn>
}

/** Stub canvas creation (jsdom has no 2d context) and the Image element; the
 * Image fires its load/error on src set. */
function stubCanvas(failLoad = false): CanvasStub {
  const instances: { width: number; height: number }[] = []
  const drawImage = vi.fn()
  const toDataURL = vi.fn(() => 'data:image/jpeg;base64,STUB')
  const context = { drawImage, toDataURL }
  const XHTML = 'http://www.w3.org/1999/xhtml'
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag !== 'canvas') return document.createElementNS(XHTML, tag)
    const canvas = {
      width: 0,
      height: 0,
      toDataURL,
      getContext: vi.fn(() => context),
    }
    instances.push(canvas)
    return canvas as unknown as HTMLCanvasElement
  })
  vi.stubGlobal('Image', class {
    private rawSrc = ''
    onload: (() => void) | undefined
    onerror: (() => void) | undefined
    naturalWidth = 400
    naturalHeight = 300
    get src() { return this.rawSrc }
    set src(value: string) {
      this.rawSrc = value
      queueMicrotask(() => {
        if (failLoad) this.onerror?.()
        else this.onload?.()
      })
    }
  })
  return { instances, drawImage, toDataURL }
}

describe('image pipeline', () => {
  it('rejects oversized files before decoding', async () => {
    const result = await applyImageFile({ size: 11 * 1024 * 1024 } as File, 10 * 1024 * 1024)
    expect(result).toEqual({ ok: false, reason: 'too-large' })
  })

  it('returns a structured decode failure for unreadable blobs', async () => {
    stubCanvas(true)
    const file = { size: 100 } as File
    const result = await applyImageFile(file, 1024)
    expect(result).toEqual({ ok: false, reason: 'decode-failed' })
  })

  it('downscales to the max edge and returns a JPEG data URL', async () => {
    const stub = stubCanvas()
    const image = { naturalWidth: 4000, naturalHeight: 2000 } as HTMLImageElement
    const dataUrl = downscaleToDataUrl(image, 1920)
    expect(dataUrl).toBe('data:image/jpeg;base64,STUB')
    expect(stub.instances).toHaveLength(1)
    expect(stub.instances[0]!.width).toBe(1920)
    expect(stub.instances[0]!.height).toBe(960)
    expect(stub.drawImage).toHaveBeenCalledWith(image, 0, 0, 1920, 960)
  })

  it('detects data URLs', () => {
    expect(isDataUrl('data:image/jpeg;base64,AA==')).toBe(true)
    expect(isDataUrl('https://example.com/a.png')).toBe(false)
    expect(isDataUrl('')).toBe(false)
  })

  it('loadImageSource resolves an image and revokes the object URL for blobs', async () => {
    stubCanvas()
    const revoke = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:stub'), revokeObjectURL: revoke })
    const image = await loadImageSource(new Blob(['x'], { type: 'image/png' }))
    expect(image).toBeDefined()
    expect(revoke).toHaveBeenCalledWith('blob:stub')
  })
})
