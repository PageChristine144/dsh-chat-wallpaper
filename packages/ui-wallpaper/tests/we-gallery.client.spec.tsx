// @vitest-environment jsdom
/** WeGallery behavior: loads the host library, renders the grid, marks the
 *  selected cell by key, and asks the host to switch the LIVE Wallpaper Engine
 *  wallpaper on pick (every item is selectable — scenes render in the engine). */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WeGallery, type WeGalleryProps } from '../src/client/WeGallery.tsx'
import type { WeItem } from '../src/client/we.ts'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

const ITEMS: WeItem[] = [
  {
    key: 'workshop/1', title: 'Floating In Space', type: 'video',
    previewUrl: '/wallpaper-engine/raw/workshop/1/preview.gif',
    fileUrl: '/wallpaper-engine/raw/workshop/1/a.mp4',
  },
  {
    key: 'workshop/2', title: 'Particles', type: 'scene',
    previewUrl: '/wallpaper-engine/raw/workshop/2/preview.jpg',
    fileUrl: null,
  },
]

function stubFetch(items: WeItem[]): ReturnType<typeof vi.fn> {
  const fetch = vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ items }),
  } as Response))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

function mount(props: Partial<WeGalleryProps> = {}) {
  const onApply = vi.fn(() => Promise.resolve())
  render(<WeGallery t={key => key} onApply={onApply} {...props} />)
  return { onApply }
}

describe('WeGallery', () => {
  it('loads the host list and renders all cells as selectable (scenes included)', async () => {
    const fetch = stubFetch(ITEMS)
    mount()
    expect(fetch).toHaveBeenCalledWith('/wallpaper-engine/list', { cache: 'no-store' })
    await waitFor(() => { expect(screen.getByText('Floating In Space')).toBeDefined() })
    const cells = screen.getAllByRole('button')
    expect(cells).toHaveLength(2)
    // Scene wallpaper (fileUrl null) is still clickable — the engine renders it.
    expect(cells[1]!.hasAttribute('disabled')).toBe(false)
  })

  it('asks the host to switch the live wallpaper by key', async () => {
    stubFetch(ITEMS)
    const b = mount()
    await waitFor(() => { expect(screen.getByText('Floating In Space')).toBeDefined() })
    fireEvent.click(screen.getByText('Floating In Space'))
    expect(b.onApply).toHaveBeenCalledWith('workshop/1')
  })

  it('switches scene wallpapers too (engine renders them)', async () => {
    stubFetch(ITEMS)
    const b = mount()
    await waitFor(() => { expect(screen.getByText('Particles')).toBeDefined() })
    fireEvent.click(screen.getByText('Particles'))
    expect(b.onApply).toHaveBeenCalledWith('workshop/2')
  })

  it('marks the current key cell as selected', async () => {
    stubFetch(ITEMS)
    mount({ currentKey: 'workshop/1' })
    await waitFor(() => { expect(screen.getByText('Floating In Space')).toBeDefined() })
    const cell = screen.getByText('Floating In Space').closest('button')!
    expect(cell.getAttribute('aria-pressed')).toBe('true')
    const other = screen.getByText('Particles').closest('button')!
    expect(other.getAttribute('aria-pressed')).toBe('false')
  })

  it('disables the grid while a switch is in flight', async () => {
    stubFetch(ITEMS)
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    const onApply = vi.fn(() => gate)
    mount({ onApply })
    await waitFor(() => { expect(screen.getByText('Floating In Space')).toBeDefined() })
    fireEvent.click(screen.getByText('Floating In Space'))
    await Promise.resolve()
    const cells = screen.getAllByRole('button')
    expect(cells.every(cell => cell.hasAttribute('disabled'))).toBe(true)
    release()
    await waitFor(() => {
      expect(screen.getAllByRole('button').every(cell => !cell.hasAttribute('disabled'))).toBe(true)
    })
  })

  it('surfaces a load failure and the empty state', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))))
    mount()
    await waitFor(() => { expect(screen.getByText('we.error')).toBeDefined() })
    cleanup()
    stubFetch([])
    mount()
    await waitFor(() => { expect(screen.getByText('we.empty')).toBeDefined() })
  })
})
