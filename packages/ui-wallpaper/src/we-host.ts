/**
 * Host-side Wallpaper Engine library access for the wallpaper plugin: discovers
 * the Steam workshop item roots and local project roots, scans each wallpaper's
 * `project.json` (UTF-8 with a GBK fallback — Wallpaper Engine writes GBK on
 * Chinese systems) into a browseable list, and resolves raw image/video files
 * with strict path containment. Also locates the Wallpaper Engine install and
 * applies a wallpaper through its command-line control. Everything here is
 * host-half code: the browser only ever fetches the JSON list and the
 * whitelisted raw URLs, and asks the host to switch wallpapers by key.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'

/** One browseable wallpaper from the local library. */
export interface WeListItem {
  /** Stable identity, `workshop/<id>` or `project/<name>`. */
  key: string
  /** Wallpaper title from project.json (best-effort). */
  title: string
  /** Wallpaper Engine type (`video`, `scene`, `web`, `image`, …). */
  type: string
  /** Raw URL of the preview image (may be a GIF). */
  previewUrl: string
  /** Raw URL of the main file, only when it is a directly renderable image/video. */
  fileUrl: string | null
}

/** Whitelisted raw extensions the raw route will serve (images + videos only). */
export const WE_RAW_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.m4v'])

/** Content types for the whitelisted raw extensions. */
export const WE_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.m4v': 'video/mp4',
}

/** Default workshop roots: every existing Steam library's workshop content dir. */
export function defaultWorkshopRoots(): string[] {
  const roots: string[] = []
  for (const candidate of candidateSteamLibraries()) {
    const root = join(candidate, 'steamapps', 'workshop', 'content', '431960')
    if (isDirectory(root)) roots.push(root)
  }
  return roots
}

/** Default local project roots: every existing wallpaper_engine projects dir. */
export function defaultProjectRoots(): string[] {
  const roots: string[] = []
  for (const candidate of candidateSteamLibraries()) {
    const root = join(candidate, 'steamapps', 'common', 'wallpaper_engine', 'projects', 'myprojects')
    if (isDirectory(root)) roots.push(root)
  }
  return roots
}

/** Steam library candidates: the two standard install dirs plus every drive's SteamLibrary. */
function candidateSteamLibraries(): string[] {
  const candidates = [
    process.env.ProgramFiles ? join(process.env.ProgramFiles, 'Steam') : '',
    process.env['ProgramFiles(x86)'] ? join(process.env['ProgramFiles(x86)'], 'Steam') : '',
  ].filter(Boolean)
  const seen = new Set(candidates.map(candidate => candidate.toLowerCase()))
  for (const drive of 'CDEFGHIJKLMNOPQRSTUVWXYZ') {
    const candidate = `${drive}:\\SteamLibrary`
    if (!seen.has(candidate.toLowerCase())) {
      seen.add(candidate.toLowerCase())
      candidates.push(candidate)
    }
  }
  return candidates
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/**
 * Scan every wallpaper in the configured roots into a browseable list.
 * @param workshopRoots - workshop content roots (subdirectories are items).
 * @param projectRoots - local project roots (subdirectories are projects).
 * @returns the browseable wallpaper list.
 */
export function scanWallpapers(workshopRoots: readonly string[], projectRoots: readonly string[]): WeListItem[] {
  const items: WeListItem[] = []
  for (const root of workshopRoots) scanItems(root, 'workshop', items)
  for (const root of projectRoots) scanItems(root, 'project', items)
  return items
}

/** Scan one root: each subdirectory with a project.json becomes an item, and
 * loose video files directly in a project root (recorded scene wallpapers)
 * become video items without needing a project.json. */
function scanItems(root: string, kind: 'workshop' | 'project', out: WeListItem[]): void {
  let directories: string[]
  let files: string[]
  try {
    const entries = readdirSync(root, { withFileTypes: true })
    directories = entries.filter(entry => entry.isDirectory()).map(entry => entry.name)
    files = kind === 'project'
      ? entries.filter(entry => entry.isFile()).map(entry => entry.name)
      : []
  } catch {
    return
  }
  for (const name of directories) {
    const projectJson = join(root, name, 'project.json')
    let raw: Buffer
    try {
      raw = readFileSync(projectJson)
    } catch {
      continue
    }
    const json = decodeProjectJson(raw)
    if (json === undefined) continue
    const title = typeof json.title === 'string' ? json.title : name
    const type = typeof json.type === 'string' ? json.type : ''
    const file = typeof json.file === 'string' ? json.file : ''
    const preview = typeof json.preview === 'string' ? json.preview : ''
    const dir = `${kind}/${name}`
    const fileUrl = file !== '' && WE_RAW_EXTENSIONS.has(extname(file).toLowerCase())
      ? `/wallpaper-engine/raw/${dir}/${encodeURIComponent(file)}`
      : null
    out.push({
      key: `${kind}/${name}`,
      title,
      type,
      previewUrl: preview !== '' ? `/wallpaper-engine/raw/${dir}/${encodeURIComponent(preview)}` : '',
      fileUrl,
    })
  }
  // Loose recordings dropped into a project root: title = file stem.
  for (const name of files) {
    const extension = extname(name).toLowerCase()
    if (!VIDEO_EXTENSIONS.has(extension)) continue
    const dir = `${kind}/${name}`
    out.push({
      key: dir,
      title: name.slice(0, -extension.length),
      type: 'video',
      previewUrl: '',
      fileUrl: `/wallpaper-engine/raw/${dir}`,
    })
  }
}

/** Video extensions accepted as loose recordings. */
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.m4v'])

/**
 * Resolve a raw request path against a root with strict containment: the
 * resolved absolute path must stay inside the root, and the extension must be
 * whitelisted.
 * @param root - the configured base directory (workshop or projects root).
 * @param rel - the relative path from the URL (already decoded).
 * @returns the safe absolute file path, or undefined when outside the root or not whitelisted.
 */
export function resolveRaw(root: string, rel: string): string | undefined {
  if (rel.startsWith('/') || rel.startsWith('\\')) return undefined
  const target = resolve(normalize(join(root, rel)))
  const rootAbs = resolve(normalize(root))
  // `sep`, not '/': resolve() emits backslash paths on Windows.
  if (target !== rootAbs && !target.startsWith(rootAbs + sep)) return undefined
  if (!WE_RAW_EXTENSIONS.has(extname(target).toLowerCase())) return undefined
  return target
}

/** Decode a project.json buffer: UTF-8 first, GBK fallback for Chinese systems. */
export function decodeProjectJson(buffer: Buffer): Record<string, unknown> | undefined {
  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    text = new TextDecoder('gbk').decode(buffer)
  }
  try {
    const parsed = JSON.parse(text) as unknown
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : undefined
  } catch {
    return undefined
  }
}

/** Wallpaper Engine CLI executable names (32-bit ships on every install). */
const WE_EXECUTABLES = ['wallpaper64.exe', 'wallpaper32.exe']

/**
 * Locate the Wallpaper Engine install directory: any existing parent of a
 * known projects root that contains one of the WE executables. The projects
 * roots are `<engine>/projects/myprojects`, so the engine root is two levels
 * up; both the resolved parent and every ancestor up to the Steam library are
 * probed so a custom layout still matches.
 * @param projectRoots - configured local project roots (subdirs are projects).
 * @returns the engine install directory, or undefined when not found.
 */
export function resolveEngineRoot(projectRoots: readonly string[]): string | undefined {
  const seen = new Set<string>()
  for (const root of projectRoots) {
    for (let dir = dirname(dirname(root)); ; dir = dirname(dir)) {
      if (seen.has(dir)) break
      seen.add(dir)
      if (WE_EXECUTABLES.some(name => existsSync(join(dir, name)))) return dir
      const parent = dirname(dir)
      if (parent === dir) break
    }
  }
  return undefined
}

/**
 * Resolve a browseable key (`workshop/<id>` or `project/<name>`) to the
 * wallpaper's project directory (the folder holding project.json), strictly
 * contained in the configured roots.
 * @param workshopRoots - workshop content roots (subdirs are workshop items).
 * @param projectRoots - local project roots (subdirs are projects).
 * @param key - the item key from the browseable list.
 * @returns the project directory, or undefined when unknown or outside the roots.
 */
export function resolveProjectDir(
  workshopRoots: readonly string[],
  projectRoots: readonly string[],
  key: string,
): string | undefined {
  const slash = key.indexOf('/')
  if (slash <= 0) return undefined
  const kind = key.slice(0, slash)
  const name = key.slice(slash + 1)
  const roots = kind === 'workshop' ? workshopRoots : kind === 'project' ? projectRoots : []
  for (const root of roots) {
    const target = normalize(join(root, name))
    const rootAbs = normalize(root)
    if (target !== rootAbs && !target.startsWith(rootAbs + sep)) continue
    if (!isDirectory(target)) continue
    if (!existsSync(join(target, 'project.json'))) continue
    return target
  }
  return undefined
}
