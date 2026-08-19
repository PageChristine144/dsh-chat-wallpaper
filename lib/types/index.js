/**
 * Host registration for the browser wallpaper preference plus the Wallpaper
 * Engine library surface and the transparent chat desktop control: a
 * browseable list of the local wallpapers, strictly contained raw image/video
 * serving, and open/close routes for the transparent Electron shell that the
 * chat's Desktop-transparent button drives.
 */
import { createReadStream, statSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import z from '@deepseek-ai/schemastery';
import { WALLPAPER_SETTINGS_NAMESPACE, WallpaperSettingsSchema } from "./wallpaper-settings.js";
import { closeShell, openShell } from "./chat-desktop-host.js";
import { defaultProjectRoots, defaultWorkshopRoots, resolveEngineRoot, resolveProjectDir, resolveRaw, scanWallpapers, WE_MIME, } from "./we-host.js";
import { applyWeProject, setWeAudio } from "./we-apply.js";
export { DEFAULT_WALLPAPER_SETTINGS, WALLPAPER_MODES, WALLPAPER_SETTINGS_FIELDS, WALLPAPER_SETTINGS_NAMESPACE, } from "./wallpaper-settings.js";
export { decodeProjectJson, defaultProjectRoots, defaultWorkshopRoots, resolveEngineRoot, resolveProjectDir, resolveRaw, scanWallpapers, } from "./we-host.js";
export { applyWeProject, defaultWeApplySeam, setWeAudio } from "./we-apply.js";
export { closeShell, isPidAlive, openShell, readShellPid, resolveAppDir, resolveElectronPath, shellPidFile } from "./chat-desktop-host.js";
const WALLPAPER_NAMESPACE = settingsNamespace(WALLPAPER_SETTINGS_NAMESPACE);
/** Auto-discovered library roots (snapshot at module load; cheap stat calls). */
const DEFAULT_WORKSHOP_ROOTS = defaultWorkshopRoots();
const DEFAULT_PROJECT_ROOTS = defaultProjectRoots();
export const Config = z.object({
    workshopRoots: z.array(z.string()).default(DEFAULT_WORKSHOP_ROOTS),
    projectRoots: z.array(z.string()).default(DEFAULT_PROJECT_ROOTS),
    chatDesktop: z.object({
        appDir: z.string().required(false),
        electronPath: z.string().required(false),
    }).required(false),
});
/**
 * Register the durable wallpaper section and the Wallpaper Engine routes when
 * their optional Host services are composed.
 * @param ctx - Host context that may acquire the settings and HTTP services.
 * @param config - validated {@link Config}.
 */
export function apply(ctx, config = { workshopRoots: DEFAULT_WORKSHOP_ROOTS, projectRoots: DEFAULT_PROJECT_ROOTS }) {
    ctx.inject(['settings'], (settingsCtx) => {
        settingsCtx.settings.register(WALLPAPER_NAMESPACE, WallpaperSettingsSchema);
    });
    ctx.inject(['webServer'], (httpCtx) => {
        const workshopRoots = [...config.workshopRoots];
        const projectRoots = [...config.projectRoots];
        const resolveRoot = (kind) => kind === 'workshop' ? workshopRoots.find(exists) : projectRoots.find(exists);
        /** GET/HEAD /wallpaper-engine/list → the browseable library as JSON. */
        const serveList = (req, res) => {
            if (req.method !== 'GET' && req.method !== 'HEAD') {
                res.writeHead(405);
                res.end();
                return;
            }
            const items = scanWallpapers(workshopRoots, projectRoots);
            const body = JSON.stringify({ items });
            res.writeHead(200, {
                'content-type': 'application/json; charset=utf-8',
                'cache-control': 'no-store',
            });
            res.end(req.method === 'HEAD' ? undefined : body);
        };
        /** GET/HEAD /wallpaper-engine/raw/<kind>/<path> → a whitelisted image/video with Range support. */
        const serveRaw = async (req, res) => {
            if (req.method !== 'GET' && req.method !== 'HEAD') {
                res.writeHead(405);
                res.end();
                return;
            }
            const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
            const prefix = '/wallpaper-engine/raw/';
            if (!pathname.startsWith(prefix)) {
                res.writeHead(404);
                res.end();
                return;
            }
            const rest = pathname.slice(prefix.length);
            const slash = rest.indexOf('/');
            if (slash <= 0) {
                res.writeHead(404);
                res.end();
                return;
            }
            const kind = rest.slice(0, slash);
            const root = resolveRoot(kind);
            if (root === undefined) {
                res.writeHead(404);
                res.end();
                return;
            }
            const target = resolveRaw(root, rest.slice(slash + 1));
            if (target === undefined) {
                res.writeHead(403);
                res.end();
                return;
            }
            let size;
            try {
                size = (await stat(target)).size;
            }
            catch {
                res.writeHead(404);
                res.end();
                return;
            }
            const contentType = WE_MIME[extname(target).toLowerCase()] ?? 'application/octet-stream';
            const range = req.headers.range;
            if (range !== undefined) {
                const match = /^bytes=(\d*)-(\d*)$/.exec(range);
                if (match === null || (match[1] === '' && match[2] === '')) {
                    res.writeHead(416);
                    res.end();
                    return;
                }
                let start = match[1] === '' ? undefined : Number(match[1]);
                let end = match[2] === '' ? undefined : Number(match[2]);
                if (start === undefined) {
                    // Suffix range: last N bytes.
                    const suffix = Number(match[2]);
                    start = Math.max(0, size - suffix);
                    end = size - 1;
                }
                else {
                    end = end === undefined ? size - 1 : Math.min(end, size - 1);
                }
                if (start > end || start >= size) {
                    res.writeHead(416, { 'content-range': `bytes */${size}` });
                    res.end();
                    return;
                }
                res.writeHead(206, {
                    'content-type': contentType,
                    'accept-ranges': 'bytes',
                    'content-range': `bytes ${start}-${end}/${size}`,
                    'content-length': String(end - start + 1),
                    'cache-control': 'no-store',
                });
                if (req.method === 'HEAD') {
                    res.end();
                    return;
                }
                await streamRange(target, start, end, res);
                return;
            }
            res.writeHead(200, {
                'content-type': contentType,
                'accept-ranges': 'bytes',
                'content-length': String(size),
                'cache-control': 'no-store',
            });
            if (req.method === 'HEAD') {
                res.end();
                return;
            }
            await streamRange(target, 0, size - 1, res);
        };
        httpCtx.effect(() => httpCtx.webServer.register({ kind: 'exact', path: '/wallpaper-engine/list', handler: serveList }), 'ui-wallpaper: Wallpaper Engine list route');
        httpCtx.effect(() => httpCtx.webServer.register({ kind: 'prefix', path: '/wallpaper-engine/raw', handler: serveRaw }), 'ui-wallpaper: Wallpaper Engine raw route');
        /** POST /wallpaper-engine/apply → switch the live desktop wallpaper through WE. */
        const serveWeApply = async (req, res) => {
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end();
                return;
            }
            let key = '';
            try {
                const body = JSON.parse(await readRequestBody(req));
                if (typeof body === 'object' && body !== null && typeof body.key === 'string') {
                    key = body.key;
                }
            }
            catch {
                // malformed body → key stays empty → rejected below
            }
            const engineDir = resolveEngineRoot(projectRoots);
            const projectDir = key !== '' ? resolveProjectDir(workshopRoots, projectRoots, key) : undefined;
            const result = engineDir !== undefined && projectDir !== undefined
                ? applyWeProject(engineDir, projectDir)
                : { ok: false, reason: engineDir === undefined ? 'engine-not-found' : 'project-not-found' };
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        };
        httpCtx.effect(() => httpCtx.webServer.register({ kind: 'exact', path: '/wallpaper-engine/apply', handler: serveWeApply }), 'ui-wallpaper: Wallpaper Engine apply route');
        /** POST /wallpaper-engine/audio → mute or unmute all WE wallpapers. */
        const serveWeAudio = async (req, res) => {
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end();
                return;
            }
            let muted = false;
            try {
                const body = JSON.parse(await readRequestBody(req));
                if (typeof body === 'object' && body !== null && typeof body.muted === 'boolean') {
                    muted = body.muted;
                }
            }
            catch {
                // malformed body → muted stays false → unmute
            }
            const engineDir = resolveEngineRoot(projectRoots);
            const result = engineDir !== undefined
                ? setWeAudio(engineDir, muted)
                : { ok: false, reason: 'engine-not-found' };
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        };
        httpCtx.effect(() => httpCtx.webServer.register({ kind: 'exact', path: '/wallpaper-engine/audio', handler: serveWeAudio }), 'ui-wallpaper: Wallpaper Engine audio route');
        /** POST /chat-desktop/open → spawn the transparent shell (idempotent). */
        const serveDesktopOpen = (req, res) => {
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end();
                return;
            }
            const result = openShell(ctx.baseUrl, config.chatDesktop ?? {});
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        };
        /** POST /chat-desktop/close → kill the transparent shell (idempotent). */
        const serveDesktopClose = (req, res) => {
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end();
                return;
            }
            const result = closeShell(ctx.baseUrl, config.chatDesktop ?? {});
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        };
        httpCtx.effect(() => httpCtx.webServer.register({ kind: 'exact', path: '/chat-desktop/open', handler: serveDesktopOpen }), 'ui-wallpaper: transparent desktop open route');
        httpCtx.effect(() => httpCtx.webServer.register({ kind: 'exact', path: '/chat-desktop/close', handler: serveDesktopClose }), 'ui-wallpaper: transparent desktop close route');
    });
}
function exists(path) {
    try {
        return statSync(path).isDirectory();
    }
    catch {
        return false;
    }
}
/** Read a small request body as a string (empty when none). */
async function readRequestBody(req) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        const buffer = chunk;
        chunks.push(buffer);
        size += buffer.length;
        if (size > 64 * 1024)
            break;
    }
    return Buffer.concat(chunks).toString('utf8');
}
/**
 * Stream one byte range of a file into the response. A mid-stream read error
 * ends the connection — the browser treats it as an interrupted load.
 */
function streamRange(path, start, end, res) {
    return new Promise((resolvePromise) => {
        const stream = createReadStream(path, { start, end });
        stream.on('error', () => { res.destroy(); });
        stream.on('end', () => { resolvePromise(); });
        res.on('close', () => { stream.destroy(); resolvePromise(); });
        stream.pipe(res);
    });
}
//# sourceMappingURL=index.js.map