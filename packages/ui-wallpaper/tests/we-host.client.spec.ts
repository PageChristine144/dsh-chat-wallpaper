/** Host-side Wallpaper Engine library: scanning, GBK decoding, raw containment,
 *  engine-root discovery, and project-key resolution. */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  decodeProjectJson, resolveEngineRoot, resolveProjectDir, resolveRaw, scanWallpapers,
} from '../src/we-host.ts'

/** Temporary tree roots created per test run. */
const trees: string[] = []

function makeTree(): { workshop: string; projects: string } {
  const root = mkdtempSync(join(tmpdir(), 'ui-wallpaper-we-'))
  trees.push(root)
  const workshop = join(root, 'workshop')
  const projects = join(root, 'projects')
  mkdirSync(join(workshop, 'video-item'), { recursive: true })
  mkdirSync(join(workshop, 'gbk-item'), { recursive: true })
  mkdirSync(join(workshop, 'no-json'), { recursive: true })
  mkdirSync(join(workshop, 'scene-item'), { recursive: true })
  mkdirSync(join(projects, 'my-project'), { recursive: true })
  return { workshop, projects }
}

/** A GBK-encoded project.json: '测试' is B2E2 CAD4 in GBK. */
function gbkProjectJson(): Buffer {
  const head = Buffer.from('{"title":"', 'latin1')
  const title = Buffer.from([0xB2, 0xE2, 0xCA, 0xD4])
  const tail = Buffer.from('","type":"video","file":"clip.mp4","preview":"preview.jpg"}', 'latin1')
  return Buffer.concat([head, title, tail])
}

afterEach(() => {
  for (const root of trees) rmSync(root, { recursive: true, force: true })
  trees.length = 0
})

describe('we-host scanWallpapers', () => {
  it('lists video items with preview and file URLs, and skips items without project.json', () => {
    const { workshop, projects } = makeTree()
    writeFileSync(join(workshop, 'video-item', 'project.json'), JSON.stringify({
      title: 'Floating In Space', type: 'video', file: 'a.mp4', preview: 'preview.gif',
    }))
    writeFileSync(join(projects, 'my-project', 'project.json'), JSON.stringify({
      title: 'My Art', type: 'image', file: 'art.png', preview: 'art.png',
    }))
    const items = scanWallpapers([workshop], [projects])
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      key: 'workshop/video-item',
      title: 'Floating In Space',
      type: 'video',
      fileUrl: '/wallpaper-engine/raw/workshop/video-item/a.mp4',
      previewUrl: '/wallpaper-engine/raw/workshop/video-item/preview.gif',
    })
    expect(items[1]).toMatchObject({
      key: 'project/my-project',
      fileUrl: '/wallpaper-engine/raw/project/my-project/art.png',
    })
  })

  it('decodes GBK project.json (Chinese systems) and URL-encodes file names', () => {
    const { workshop } = makeTree()
    writeFileSync(join(workshop, 'gbk-item', 'project.json'), gbkProjectJson())
    const items = scanWallpapers([workshop], [])
    expect(items).toHaveLength(1)
    expect(items[0]!.title).toBe('测试')
    expect(items[0]!.fileUrl).toBe('/wallpaper-engine/raw/workshop/gbk-item/clip.mp4')
  })

  it('marks non-renderable scene/web wallpapers with a null fileUrl', () => {
    const { workshop } = makeTree()
    writeFileSync(join(workshop, 'scene-item', 'project.json'), JSON.stringify({
      title: 'Particles', type: 'scene', file: 'scene.pkg', preview: 'preview.jpg',
    }))
    const items = scanWallpapers([workshop], [])
    expect(items).toHaveLength(1)
    expect(items[0]!.fileUrl).toBeNull()
    expect(items[0]!.previewUrl).toBe('/wallpaper-engine/raw/workshop/scene-item/preview.jpg')
  })

  it('lists loose video files in project roots as recordable wallpaper items', () => {
    const { workshop, projects } = makeTree()
    writeFileSync(join(projects, 'three-body-recorded.mp4'), 'x')
    writeFileSync(join(projects, 'notes.txt'), 'ignored')
    const items = scanWallpapers([workshop], [projects])
    const loose = items.find(item => item.key === 'project/three-body-recorded.mp4')
    expect(loose).toMatchObject({
      title: 'three-body-recorded',
      type: 'video',
      fileUrl: '/wallpaper-engine/raw/project/three-body-recorded.mp4',
      previewUrl: '',
    })
    expect(items.some(item => item.title === 'notes')).toBe(false)
  })

  it('tolerates missing roots', () => {
    expect(scanWallpapers([], [join(tmpdir(), 'ui-wallpaper-does-not-exist')])).toEqual([])
  })
})

describe('we-host resolveRaw', () => {
  it('resolves an in-root whitelisted file', () => {
    const { workshop } = makeTree()
    writeFileSync(join(workshop, 'video-item', 'a.mp4'), 'x')
    const target = resolveRaw(workshop, 'video-item/a.mp4')
    expect(target).toBe(join(workshop, 'video-item', 'a.mp4'))
  })

  it('rejects traversal, absolute paths, and non-whitelisted extensions', () => {
    const { workshop } = makeTree()
    writeFileSync(join(workshop, 'secret.txt'), 'x')
    expect(resolveRaw(workshop, '../secret.txt')).toBeUndefined()
    expect(resolveRaw(workshop, '/etc/passwd')).toBeUndefined()
    expect(resolveRaw(workshop, 'secret.txt')).toBeUndefined() // .txt not whitelisted
    expect(resolveRaw(workshop, 'video-item/a.mp4.exe')).toBeUndefined()
  })
})

describe('we-host decodeProjectJson', () => {
  it('decodes UTF-8 and falls back to GBK for invalid UTF-8', () => {
    const utf8 = decodeProjectJson(Buffer.from('{"title":"ok"}', 'utf8'))
    expect(utf8).toEqual({ title: 'ok' })
    const gbk = decodeProjectJson(gbkProjectJson())
    expect(gbk).toMatchObject({ title: '测试', type: 'video' })
  })

  it('returns undefined for undecodable content', () => {
    expect(decodeProjectJson(Buffer.from('not json at all', 'utf8'))).toBeUndefined()
  })
})

describe('we-host resolveEngineRoot', () => {
  it('finds the engine install above a projects root by probing executables', () => {
    const root = mkdtempSync(join(tmpdir(), 'ui-wallpaper-engine-'))
    trees.push(root)
    // engine/<exe>, engine/projects/myprojects as the configured root
    mkdirSync(join(root, 'engine', 'projects', 'myprojects'), { recursive: true })
    writeFileSync(join(root, 'engine', 'wallpaper64.exe'), 'x')
    expect(resolveEngineRoot([join(root, 'engine', 'projects', 'myprojects')])).toBe(join(root, 'engine'))
  })

  it('falls back to wallpaper32.exe and returns undefined when no exe exists', () => {
    const root = mkdtempSync(join(tmpdir(), 'ui-wallpaper-engine-'))
    trees.push(root)
    mkdirSync(join(root, 'engine', 'projects', 'myprojects'), { recursive: true })
    writeFileSync(join(root, 'engine', 'wallpaper32.exe'), 'x')
    expect(resolveEngineRoot([join(root, 'engine', 'projects', 'myprojects')])).toBe(join(root, 'engine'))
    mkdirSync(join(root, 'empty', 'projects'), { recursive: true })
    expect(resolveEngineRoot([join(root, 'empty', 'projects')])).toBeUndefined()
  })
})

describe('we-host resolveProjectDir', () => {
  it('resolves workshop and project keys to their project.json directory', () => {
    const { workshop, projects } = makeTree()
    // project.json presence is required by the resolver (the scan test above
    // writes its own); add the files the resolver checks for.
    writeFileSync(join(workshop, 'video-item', 'project.json'), '{}')
    writeFileSync(join(projects, 'my-project', 'project.json'), '{}')
    expect(resolveProjectDir([workshop], [projects], 'workshop/video-item'))
      .toBe(join(workshop, 'video-item'))
    expect(resolveProjectDir([workshop], [projects], 'project/my-project'))
      .toBe(join(projects, 'my-project'))
  })

  it('rejects unknown kinds, traversal, and directories without project.json', () => {
    const { workshop, projects } = makeTree()
    expect(resolveProjectDir([workshop], [projects], 'other/thing')).toBeUndefined()
    expect(resolveProjectDir([workshop], [projects], 'workshop/../video-item')).toBeUndefined()
    expect(resolveProjectDir([workshop], [projects], 'workshop/no-json')).toBeUndefined()
    expect(resolveProjectDir([workshop], [projects], 'project/three-body-recorded.mp4')).toBeUndefined()
  })
})
