/** Host-half route registration: apply must register the Wallpaper Engine
 * list/raw routes and the transparent desktop open/close routes (regression:
 * the WE handlers were once referenced before their const declarations, which
 * threw in the inject callback and left the routes unregistered). */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { apply, type Config } from '@deepseek-ai/dsh-client-ui-wallpaper'

describe('ui-wallpaper host routes', () => {
  it('registers the Wallpaper Engine and transparent-desktop routes when webServer is composed', async () => {
    const ctx = new Context()
    const routes: { kind: string; path: string }[] = []
    ctx.provide('webServer', {
      register: vi.fn((route: { kind: string; path: string }) => {
        routes.push(route)
        return () => undefined
      }),
    })
    ctx.provide('settings', { register: vi.fn() })
    const fiber = ctx.plugin({ apply })
    await fiber.await()
    expect(routes.map(route => `${route.kind} ${route.path}`)).toEqual([
      'exact /wallpaper-engine/list',
      'prefix /wallpaper-engine/raw',
      'exact /wallpaper-engine/apply',
      'exact /wallpaper-engine/audio',
      'exact /chat-desktop/open',
      'exact /chat-desktop/close',
    ])
    await fiber.dispose()
  })

  it('accepts explicit config roots', async () => {
    const ctx = new Context()
    const routes: { kind: string; path: string }[] = []
    ctx.provide('webServer', {
      register: vi.fn((route: { kind: string; path: string }) => {
        routes.push(route)
        return () => undefined
      }),
    })
    ctx.provide('settings', { register: vi.fn() })
    const config: Config = { workshopRoots: ['D:\\w'], projectRoots: ['D:\\p'] }
    const fiber = ctx.plugin({ apply, config })
    await fiber.await()
    expect(routes).toHaveLength(6)
    await fiber.dispose()
  })
})
