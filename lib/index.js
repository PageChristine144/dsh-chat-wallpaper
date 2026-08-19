import { createReadStream, existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
import { spawn, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
//#region lib/types/wallpaper-settings.js
/** Wallpaper preferences stored in the Host user-settings document. */
/** Built-in wallpaper sources accepted at the registry and settings boundaries. */
const WALLPAPER_MODES = [
	"none",
	"image",
	"url",
	"desktop"
];
/** Settings namespace owned by the wallpaper plugin. */
const WALLPAPER_SETTINGS_NAMESPACE = "ui-wallpaper";
/** Field names of the durable wallpaper section. */
const WALLPAPER_SETTINGS_FIELDS = {
	MODE: "mode",
	VALUE: "value",
	BLUR: "blur",
	DIM: "dim",
	SURFACE_ALPHA: "surfaceAlpha",
	WE_KEY: "weKey",
	TEXT_FONT: "textFont",
	TEXT_WEIGHT: "textWeight",
	TEXT_COLOR: "textColor",
	TEXT_OPACITY: "textOpacity",
	TEXT_OUTLINE: "textOutline",
	CODE_BACKGROUND: "codeBackground"
};
/** Built-in chat font families (high-contrast, wallpaper-friendly). */
const TEXT_FONTS = [
	"system",
	"serif",
	"mono",
	"rounded"
];
/** Chat font weight presets (400–800). */
const TEXT_WEIGHTS = [
	400,
	500,
	600,
	700,
	800
];
/** Default wallpaper section when the user-settings document has no override. */
const DEFAULT_WALLPAPER_SETTINGS = {
	mode: "none",
	value: "",
	blur: 0,
	dim: .35,
	surfaceAlpha: .82,
	weKey: "",
	textFont: "system",
	textWeight: 400,
	textColor: "ink",
	textOpacity: 100,
	textOutline: 2,
	codeBackground: true
};
const WALLPAPER_DIM_MAX = .8;
const WALLPAPER_ALPHA_MIN = .5;
/** Durable wallpaper schema; also the wire envelope the browser scope validates against. */
const WallpaperSettingsSchema = z.object({
	[WALLPAPER_SETTINGS_FIELDS.MODE]: z.union([...WALLPAPER_MODES]).default(DEFAULT_WALLPAPER_SETTINGS.mode),
	[WALLPAPER_SETTINGS_FIELDS.VALUE]: z.string().default(DEFAULT_WALLPAPER_SETTINGS.value),
	[WALLPAPER_SETTINGS_FIELDS.BLUR]: z.number().min(0).max(40).default(DEFAULT_WALLPAPER_SETTINGS.blur),
	[WALLPAPER_SETTINGS_FIELDS.DIM]: z.number().min(0).max(WALLPAPER_DIM_MAX).default(DEFAULT_WALLPAPER_SETTINGS.dim),
	[WALLPAPER_SETTINGS_FIELDS.SURFACE_ALPHA]: z.number().min(WALLPAPER_ALPHA_MIN).max(1).default(DEFAULT_WALLPAPER_SETTINGS.surfaceAlpha),
	[WALLPAPER_SETTINGS_FIELDS.WE_KEY]: z.string().default(DEFAULT_WALLPAPER_SETTINGS.weKey),
	[WALLPAPER_SETTINGS_FIELDS.TEXT_FONT]: z.union([...TEXT_FONTS]).default(DEFAULT_WALLPAPER_SETTINGS.textFont),
	[WALLPAPER_SETTINGS_FIELDS.TEXT_WEIGHT]: z.union([...TEXT_WEIGHTS]).default(DEFAULT_WALLPAPER_SETTINGS.textWeight),
	[WALLPAPER_SETTINGS_FIELDS.TEXT_COLOR]: z.string().default(DEFAULT_WALLPAPER_SETTINGS.textColor),
	[WALLPAPER_SETTINGS_FIELDS.TEXT_OPACITY]: z.number().min(0).max(100).default(DEFAULT_WALLPAPER_SETTINGS.textOpacity),
	[WALLPAPER_SETTINGS_FIELDS.TEXT_OUTLINE]: z.number().min(0).max(5).default(DEFAULT_WALLPAPER_SETTINGS.textOutline),
	[WALLPAPER_SETTINGS_FIELDS.CODE_BACKGROUND]: z.boolean().default(DEFAULT_WALLPAPER_SETTINGS.codeBackground)
});
//#endregion
//#region lib/types/chat-desktop-host.js
/**
* Host-side transparent-chat-desktop control: locate the shell app (the
* Electron transparent window), spawn/close it from the webserver routes the
* browser button calls, and track its main-process pid through a temp pid file
* the shell writes at startup. The shell itself is a plain Electron app that
* loads the chat GUI; this seam makes it feel like a plugin toggle.
*/
/**
* Default shell app directory: walk up from the working directory and the
* config root looking for `<root>/tools/chat-desktop` (with a main.js). The
* config root (`ctx.baseUrl`) is the profile dir, not the repo, so the repo
* root is found by walking up from cwd.
*/
function resolveAppDir(baseUrl, config) {
	if (config.appDir !== void 0) return config.appDir;
	const roots = [process.cwd(), ...baseUrl !== void 0 ? [stripFileUrl(baseUrl)] : []];
	for (const root of roots) for (let dir = root;;) {
		const candidate = join(dir, "tools", "chat-desktop");
		if (existsSync(join(candidate, "main.js"))) return candidate;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return join(stripFileUrl(baseUrl ?? process.cwd()), "tools", "chat-desktop");
}
/** Normalize a `file:///` URL into a plain absolute path (ctx.baseUrl form). */
function stripFileUrl(value) {
	if (value.startsWith("file:///")) return value.slice(8);
	return value;
}
/** Default electron executable inside the shell app. */
function resolveElectronPath(appDir, config) {
	return config.electronPath ?? join(appDir, "node_modules", "electron", "dist", "electron.exe");
}
/** Temp pid file the shell writes at startup (same value as its app.getPath('temp')). */
function shellPidFile() {
	return join(tmpdir(), "dsh-chat-desktop.pid");
}
/** Whether a pid names a live process (Windows-compatible existence probe). */
function isPidAlive(pid) {
	if (!Number.isInteger(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return error.code === "EPERM";
	}
}
/** The shell's main-process pid, or undefined when the shell is not running. */
function readShellPid() {
	return readShellPidFromFile(shellPidFile());
}
/** Read a shell pid file: the pid when it names a live process, else undefined. */
function readShellPidFromFile(pidFile) {
	try {
		const pid = Number.parseInt(readFileSync(pidFile, "utf8").trim(), 10);
		return isPidAlive(pid) ? pid : void 0;
	} catch {
		return;
	}
}
/**
* Open the transparent shell (idempotent): if its pid file names a live
* process, it is already open. Otherwise spawn the electron app detached.
* @param baseUrl - config tree root used to locate the shell app by default.
* @param config - plugin chat-desktop config.
* @returns whether the shell is open, and the reason when it cannot start.
*/
function openShell(baseUrl, config) {
	if (readShellPid() !== void 0) return {
		ok: true,
		alreadyOpen: true
	};
	const appDir = resolveAppDir(baseUrl, config);
	const electronPath = resolveElectronPath(appDir, config);
	if (!existsSync(electronPath)) return {
		ok: false,
		reason: "electron-not-installed",
		electronPath
	};
	if (!existsSync(join(appDir, "main.js"))) return {
		ok: false,
		reason: "shell-app-missing",
		electronPath
	};
	spawn(electronPath, ["."], {
		cwd: appDir,
		detached: true,
		stdio: "ignore"
	}).unref();
	return { ok: true };
}
/**
* Close the transparent shell (idempotent): first restore the desktop state
* the clear-screen changed (un-minimize the recorded windows — the opaque
* chat window returns — and show desktop icons), then kill the shell process
* tree and clear its pid file.
* @param baseUrl - config tree root used to locate the shell app by default.
* @param config - plugin chat-desktop config.
* @returns whether the shell is closed, and the reason when it cannot be.
*/
function closeShell(baseUrl, config) {
	const pid = readShellPid();
	if (pid === void 0) return {
		ok: true,
		alreadyClosed: true
	};
	const script = join(resolveAppDir(baseUrl, config), "clear-screen.ps1");
	if (existsSync(script)) spawnSync("powershell.exe", [
		"-NoProfile",
		"-ExecutionPolicy",
		"Bypass",
		"-File",
		script,
		"restore-chat",
		String(pid),
		join(tmpdir(), "dsh-chat-desktop-state.json")
	], { stdio: "ignore" });
	const result = spawnSync("taskkill", [
		"/PID",
		String(pid),
		"/T",
		"/F"
	], { stdio: "ignore" });
	if (result.status !== 0 && result.status !== null) return {
		ok: false,
		reason: `taskkill-failed:${result.status}`
	};
	try {
		rmSync(shellPidFile(), { force: true });
	} catch {}
	return { ok: true };
}
//#endregion
//#region lib/types/we-host.js
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
/** Whitelisted raw extensions the raw route will serve (images + videos only). */
const WE_RAW_EXTENSIONS = new Set([
	".jpg",
	".jpeg",
	".png",
	".gif",
	".webp",
	".mp4",
	".webm",
	".m4v"
]);
/** Content types for the whitelisted raw extensions. */
const WE_MIME = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".webp": "image/webp",
	".mp4": "video/mp4",
	".webm": "video/webm",
	".m4v": "video/mp4"
};
/** Default workshop roots: every existing Steam library's workshop content dir. */
function defaultWorkshopRoots() {
	const roots = [];
	for (const candidate of candidateSteamLibraries()) {
		const root = join(candidate, "steamapps", "workshop", "content", "431960");
		if (isDirectory(root)) roots.push(root);
	}
	return roots;
}
/** Default local project roots: every existing wallpaper_engine projects dir. */
function defaultProjectRoots() {
	const roots = [];
	for (const candidate of candidateSteamLibraries()) {
		const root = join(candidate, "steamapps", "common", "wallpaper_engine", "projects", "myprojects");
		if (isDirectory(root)) roots.push(root);
	}
	return roots;
}
/** Steam library candidates: the two standard install dirs plus every drive's SteamLibrary. */
function candidateSteamLibraries() {
	const candidates = [process.env.ProgramFiles ? join(process.env.ProgramFiles, "Steam") : "", process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Steam") : ""].filter(Boolean);
	const seen = new Set(candidates.map((candidate) => candidate.toLowerCase()));
	for (const drive of "CDEFGHIJKLMNOPQRSTUVWXYZ") {
		const candidate = `${drive}:\\SteamLibrary`;
		if (!seen.has(candidate.toLowerCase())) {
			seen.add(candidate.toLowerCase());
			candidates.push(candidate);
		}
	}
	return candidates;
}
function isDirectory(path) {
	try {
		return statSync(path).isDirectory();
	} catch {
		return false;
	}
}
/**
* Scan every wallpaper in the configured roots into a browseable list.
* @param workshopRoots - workshop content roots (subdirectories are items).
* @param projectRoots - local project roots (subdirectories are projects).
* @returns the browseable wallpaper list.
*/
function scanWallpapers(workshopRoots, projectRoots) {
	const items = [];
	for (const root of workshopRoots) scanItems(root, "workshop", items);
	for (const root of projectRoots) scanItems(root, "project", items);
	return items;
}
/** Scan one root: each subdirectory with a project.json becomes an item, and
* loose video files directly in a project root (recorded scene wallpapers)
* become video items without needing a project.json. */
function scanItems(root, kind, out) {
	let directories;
	let files;
	try {
		const entries = readdirSync(root, { withFileTypes: true });
		directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
		files = kind === "project" ? entries.filter((entry) => entry.isFile()).map((entry) => entry.name) : [];
	} catch {
		return;
	}
	for (const name of directories) {
		const projectJson = join(root, name, "project.json");
		let raw;
		try {
			raw = readFileSync(projectJson);
		} catch {
			continue;
		}
		const json = decodeProjectJson(raw);
		if (json === void 0) continue;
		const title = typeof json.title === "string" ? json.title : name;
		const type = typeof json.type === "string" ? json.type : "";
		const file = typeof json.file === "string" ? json.file : "";
		const preview = typeof json.preview === "string" ? json.preview : "";
		const dir = `${kind}/${name}`;
		const fileUrl = file !== "" && WE_RAW_EXTENSIONS.has(extname(file).toLowerCase()) ? `/wallpaper-engine/raw/${dir}/${encodeURIComponent(file)}` : null;
		out.push({
			key: `${kind}/${name}`,
			title,
			type,
			previewUrl: preview !== "" ? `/wallpaper-engine/raw/${dir}/${encodeURIComponent(preview)}` : "",
			fileUrl
		});
	}
	for (const name of files) {
		const extension = extname(name).toLowerCase();
		if (!VIDEO_EXTENSIONS.has(extension)) continue;
		const dir = `${kind}/${name}`;
		out.push({
			key: dir,
			title: name.slice(0, -extension.length),
			type: "video",
			previewUrl: "",
			fileUrl: `/wallpaper-engine/raw/${dir}`
		});
	}
}
/** Video extensions accepted as loose recordings. */
const VIDEO_EXTENSIONS = new Set([
	".mp4",
	".webm",
	".m4v"
]);
/**
* Resolve a raw request path against a root with strict containment: the
* resolved absolute path must stay inside the root, and the extension must be
* whitelisted.
* @param root - the configured base directory (workshop or projects root).
* @param rel - the relative path from the URL (already decoded).
* @returns the safe absolute file path, or undefined when outside the root or not whitelisted.
*/
function resolveRaw(root, rel) {
	if (rel.startsWith("/") || rel.startsWith("\\")) return void 0;
	const target = resolve(normalize(join(root, rel)));
	const rootAbs = resolve(normalize(root));
	if (target !== rootAbs && !target.startsWith(rootAbs + sep)) return void 0;
	if (!WE_RAW_EXTENSIONS.has(extname(target).toLowerCase())) return void 0;
	return target;
}
/** Decode a project.json buffer: UTF-8 first, GBK fallback for Chinese systems. */
function decodeProjectJson(buffer) {
	let text;
	try {
		text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
	} catch {
		text = new TextDecoder("gbk").decode(buffer);
	}
	try {
		const parsed = JSON.parse(text);
		return typeof parsed === "object" && parsed !== null ? parsed : void 0;
	} catch {
		return;
	}
}
/** Wallpaper Engine CLI executable names (32-bit ships on every install). */
const WE_EXECUTABLES$1 = ["wallpaper64.exe", "wallpaper32.exe"];
/**
* Locate the Wallpaper Engine install directory: any existing parent of a
* known projects root that contains one of the WE executables. The projects
* roots are `<engine>/projects/myprojects`, so the engine root is two levels
* up; both the resolved parent and every ancestor up to the Steam library are
* probed so a custom layout still matches.
* @param projectRoots - configured local project roots (subdirs are projects).
* @returns the engine install directory, or undefined when not found.
*/
function resolveEngineRoot(projectRoots) {
	const seen = /* @__PURE__ */ new Set();
	for (const root of projectRoots) for (let dir = dirname(dirname(root));; dir = dirname(dir)) {
		if (seen.has(dir)) break;
		seen.add(dir);
		if (WE_EXECUTABLES$1.some((name) => existsSync(join(dir, name)))) return dir;
		if (dirname(dir) === dir) break;
	}
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
function resolveProjectDir(workshopRoots, projectRoots, key) {
	const slash = key.indexOf("/");
	if (slash <= 0) return void 0;
	const kind = key.slice(0, slash);
	const name = key.slice(slash + 1);
	const roots = kind === "workshop" ? workshopRoots : kind === "project" ? projectRoots : [];
	for (const root of roots) {
		const target = normalize(join(root, name));
		const rootAbs = normalize(root);
		if (target !== rootAbs && !target.startsWith(rootAbs + sep)) continue;
		if (!isDirectory(target)) continue;
		if (!existsSync(join(target, "project.json"))) continue;
		return target;
	}
}
//#endregion
//#region lib/types/we-apply.js
/**
* Host-side Wallpaper Engine switching: applies a wallpaper project through
* the WE command-line control (`-control openWallpaper -file <project.json>`).
* WE must be running for the control message to reach it, so a dead engine is
* started first (detached, its own window). All spawns are best-effort and
* never block the gateway.
*/
/** Wallpaper Engine CLI executables (64-bit preferred, 32-bit fallback). */
const WE_EXECUTABLES = ["wallpaper64.exe", "wallpaper32.exe"];
/** Default seam: real process probing and spawning. */
const defaultWeApplySeam = {
	isWeRunning: () => {
		const probe = spawnSync("tasklist", ["/FI", "IMAGENAME eq wallpaper64.exe"], {
			stdio: [
				"ignore",
				"pipe",
				"ignore"
			],
			windowsHide: true
		});
		if (probe.status === 0 && /wallpaper64\.exe/i.test(probe.stdout.toString())) return true;
		const probe32 = spawnSync("tasklist", ["/FI", "IMAGENAME eq wallpaper32.exe"], {
			stdio: [
				"ignore",
				"pipe",
				"ignore"
			],
			windowsHide: true
		});
		return probe32.status === 0 && /wallpaper32\.exe/i.test(probe32.stdout.toString());
	},
	startEngine: (engineDir) => {
		const exe = WE_EXECUTABLES.find((name) => existsSync(join(engineDir, name)));
		if (exe === void 0) return;
		spawn(join(engineDir, exe), [], {
			detached: true,
			stdio: "ignore"
		}).unref();
	},
	runControl: (engineDir, args) => {
		const exe = WE_EXECUTABLES.find((name) => existsSync(join(engineDir, name)));
		if (exe === void 0) return { status: null };
		return { status: spawnSync(join(engineDir, exe), args, {
			stdio: [
				"ignore",
				"ignore",
				"ignore"
			],
			windowsHide: true,
			timeout: 2e4
		}).status };
	}
};
/**
* Apply one wallpaper project through Wallpaper Engine. The engine is started
* first when it is not running, then the control command is sent. The call
* never throws: every failure becomes a `{ ok: false, reason }` result.
* @param engineDir - Wallpaper Engine install directory (resolveEngineRoot).
* @param projectDir - the wallpaper project directory (contains project.json).
* @param seam - injectable process seam (defaults to the real engine).
* @returns whether the wallpaper was applied, plus a machine-readable reason.
*/
function applyWeProject(engineDir, projectDir, seam = defaultWeApplySeam) {
	const projectJson = join(projectDir, "project.json");
	if (!existsSync(projectJson)) return {
		ok: false,
		reason: "project-json-missing"
	};
	if (!existsSync(join(engineDir, "wallpaper64.exe")) && !existsSync(join(engineDir, "wallpaper32.exe"))) return {
		ok: false,
		reason: "engine-not-found"
	};
	if (!seam.isWeRunning()) seam.startEngine(engineDir);
	const args = [
		"-control",
		"openWallpaper",
		"-file",
		projectJson
	];
	const result = seam.runControl(engineDir, args);
	if (result.status !== 0) return {
		ok: false,
		reason: `control-failed:${String(result.status)}`
	};
	return { ok: true };
}
/**
* Mute or unmute all Wallpaper Engine wallpapers (`-control mute` /
* `-control unmute`). The engine must be running for the control message to
* reach it; a dead engine is started first (it resumes its last wallpaper).
* @param engineDir - Wallpaper Engine install directory (resolveEngineRoot).
* @param muted - true to mute, false to unmute.
* @param seam - injectable process seam (defaults to the real engine).
* @returns whether the audio control command was accepted.
*/
function setWeAudio(engineDir, muted, seam = defaultWeApplySeam) {
	if (!existsSync(join(engineDir, "wallpaper64.exe")) && !existsSync(join(engineDir, "wallpaper32.exe"))) return {
		ok: false,
		reason: "engine-not-found"
	};
	if (!seam.isWeRunning()) seam.startEngine(engineDir);
	const args = ["-control", muted ? "mute" : "unmute"];
	const result = seam.runControl(engineDir, args);
	if (result.status !== 0) return {
		ok: false,
		reason: `control-failed:${String(result.status)}`
	};
	return { ok: true };
}
//#endregion
//#region lib/types/index.js
/**
* Host registration for the browser wallpaper preference plus the Wallpaper
* Engine library surface and the transparent chat desktop control: a
* browseable list of the local wallpapers, strictly contained raw image/video
* serving, and open/close routes for the transparent Electron shell that the
* chat's Desktop-transparent button drives.
*/
const WALLPAPER_NAMESPACE = settingsNamespace(WALLPAPER_SETTINGS_NAMESPACE);
/** Auto-discovered library roots (snapshot at module load; cheap stat calls). */
const DEFAULT_WORKSHOP_ROOTS = defaultWorkshopRoots();
const DEFAULT_PROJECT_ROOTS = defaultProjectRoots();
const Config = z.object({
	workshopRoots: z.array(z.string()).default(DEFAULT_WORKSHOP_ROOTS),
	projectRoots: z.array(z.string()).default(DEFAULT_PROJECT_ROOTS),
	chatDesktop: z.object({
		appDir: z.string().required(false),
		electronPath: z.string().required(false)
	}).required(false)
});
/**
* Register the durable wallpaper section and the Wallpaper Engine routes when
* their optional Host services are composed.
* @param ctx - Host context that may acquire the settings and HTTP services.
* @param config - validated {@link Config}.
*/
function apply(ctx, config = {
	workshopRoots: DEFAULT_WORKSHOP_ROOTS,
	projectRoots: DEFAULT_PROJECT_ROOTS
}) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(WALLPAPER_NAMESPACE, WallpaperSettingsSchema);
	});
	ctx.inject(["webServer"], (httpCtx) => {
		const workshopRoots = [...config.workshopRoots];
		const projectRoots = [...config.projectRoots];
		const resolveRoot = (kind) => kind === "workshop" ? workshopRoots.find(exists) : projectRoots.find(exists);
		/** GET/HEAD /wallpaper-engine/list → the browseable library as JSON. */
		const serveList = (req, res) => {
			if (req.method !== "GET" && req.method !== "HEAD") {
				res.writeHead(405);
				res.end();
				return;
			}
			const items = scanWallpapers(workshopRoots, projectRoots);
			const body = JSON.stringify({ items });
			res.writeHead(200, {
				"content-type": "application/json; charset=utf-8",
				"cache-control": "no-store"
			});
			res.end(req.method === "HEAD" ? void 0 : body);
		};
		/** GET/HEAD /wallpaper-engine/raw/<kind>/<path> → a whitelisted image/video with Range support. */
		const serveRaw = async (req, res) => {
			if (req.method !== "GET" && req.method !== "HEAD") {
				res.writeHead(405);
				res.end();
				return;
			}
			const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
			if (!pathname.startsWith("/wallpaper-engine/raw/")) {
				res.writeHead(404);
				res.end();
				return;
			}
			const rest = pathname.slice(22);
			const slash = rest.indexOf("/");
			if (slash <= 0) {
				res.writeHead(404);
				res.end();
				return;
			}
			const root = resolveRoot(rest.slice(0, slash));
			if (root === void 0) {
				res.writeHead(404);
				res.end();
				return;
			}
			const target = resolveRaw(root, rest.slice(slash + 1));
			if (target === void 0) {
				res.writeHead(403);
				res.end();
				return;
			}
			let size;
			try {
				size = (await stat(target)).size;
			} catch {
				res.writeHead(404);
				res.end();
				return;
			}
			const contentType = WE_MIME[extname(target).toLowerCase()] ?? "application/octet-stream";
			const range = req.headers.range;
			if (range !== void 0) {
				const match = /^bytes=(\d*)-(\d*)$/.exec(range);
				if (match === null || match[1] === "" && match[2] === "") {
					res.writeHead(416);
					res.end();
					return;
				}
				let start = match[1] === "" ? void 0 : Number(match[1]);
				let end = match[2] === "" ? void 0 : Number(match[2]);
				if (start === void 0) {
					const suffix = Number(match[2]);
					start = Math.max(0, size - suffix);
					end = size - 1;
				} else end = end === void 0 ? size - 1 : Math.min(end, size - 1);
				if (start > end || start >= size) {
					res.writeHead(416, { "content-range": `bytes */${size}` });
					res.end();
					return;
				}
				res.writeHead(206, {
					"content-type": contentType,
					"accept-ranges": "bytes",
					"content-range": `bytes ${start}-${end}/${size}`,
					"content-length": String(end - start + 1),
					"cache-control": "no-store"
				});
				if (req.method === "HEAD") {
					res.end();
					return;
				}
				await streamRange(target, start, end, res);
				return;
			}
			res.writeHead(200, {
				"content-type": contentType,
				"accept-ranges": "bytes",
				"content-length": String(size),
				"cache-control": "no-store"
			});
			if (req.method === "HEAD") {
				res.end();
				return;
			}
			await streamRange(target, 0, size - 1, res);
		};
		httpCtx.effect(() => httpCtx.webServer.register({
			kind: "exact",
			path: "/wallpaper-engine/list",
			handler: serveList
		}), "ui-wallpaper: Wallpaper Engine list route");
		httpCtx.effect(() => httpCtx.webServer.register({
			kind: "prefix",
			path: "/wallpaper-engine/raw",
			handler: serveRaw
		}), "ui-wallpaper: Wallpaper Engine raw route");
		/** POST /wallpaper-engine/apply → switch the live desktop wallpaper through WE. */
		const serveWeApply = async (req, res) => {
			if (req.method !== "POST") {
				res.writeHead(405);
				res.end();
				return;
			}
			let key = "";
			try {
				const body = JSON.parse(await readRequestBody(req));
				if (typeof body === "object" && body !== null && typeof body.key === "string") key = body.key;
			} catch {}
			const engineDir = resolveEngineRoot(projectRoots);
			const projectDir = key !== "" ? resolveProjectDir(workshopRoots, projectRoots, key) : void 0;
			const result = engineDir !== void 0 && projectDir !== void 0 ? applyWeProject(engineDir, projectDir) : {
				ok: false,
				reason: engineDir === void 0 ? "engine-not-found" : "project-not-found"
			};
			res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
			res.end(JSON.stringify(result));
		};
		httpCtx.effect(() => httpCtx.webServer.register({
			kind: "exact",
			path: "/wallpaper-engine/apply",
			handler: serveWeApply
		}), "ui-wallpaper: Wallpaper Engine apply route");
		/** POST /wallpaper-engine/audio → mute or unmute all WE wallpapers. */
		const serveWeAudio = async (req, res) => {
			if (req.method !== "POST") {
				res.writeHead(405);
				res.end();
				return;
			}
			let muted = false;
			try {
				const body = JSON.parse(await readRequestBody(req));
				if (typeof body === "object" && body !== null && typeof body.muted === "boolean") muted = body.muted;
			} catch {}
			const engineDir = resolveEngineRoot(projectRoots);
			const result = engineDir !== void 0 ? setWeAudio(engineDir, muted) : {
				ok: false,
				reason: "engine-not-found"
			};
			res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
			res.end(JSON.stringify(result));
		};
		httpCtx.effect(() => httpCtx.webServer.register({
			kind: "exact",
			path: "/wallpaper-engine/audio",
			handler: serveWeAudio
		}), "ui-wallpaper: Wallpaper Engine audio route");
		/** POST /chat-desktop/open → spawn the transparent shell (idempotent). */
		const serveDesktopOpen = (req, res) => {
			if (req.method !== "POST") {
				res.writeHead(405);
				res.end();
				return;
			}
			const result = openShell(ctx.baseUrl, config.chatDesktop ?? {});
			res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
			res.end(JSON.stringify(result));
		};
		/** POST /chat-desktop/close → kill the transparent shell (idempotent). */
		const serveDesktopClose = (req, res) => {
			if (req.method !== "POST") {
				res.writeHead(405);
				res.end();
				return;
			}
			const result = closeShell(ctx.baseUrl, config.chatDesktop ?? {});
			res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
			res.end(JSON.stringify(result));
		};
		httpCtx.effect(() => httpCtx.webServer.register({
			kind: "exact",
			path: "/chat-desktop/open",
			handler: serveDesktopOpen
		}), "ui-wallpaper: transparent desktop open route");
		httpCtx.effect(() => httpCtx.webServer.register({
			kind: "exact",
			path: "/chat-desktop/close",
			handler: serveDesktopClose
		}), "ui-wallpaper: transparent desktop close route");
	});
}
function exists(path) {
	try {
		return statSync(path).isDirectory();
	} catch {
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
		if (size > 64 * 1024) break;
	}
	return Buffer.concat(chunks).toString("utf8");
}
/**
* Stream one byte range of a file into the response. A mid-stream read error
* ends the connection — the browser treats it as an interrupted load.
*/
function streamRange(path, start, end, res) {
	return new Promise((resolvePromise) => {
		const stream = createReadStream(path, {
			start,
			end
		});
		stream.on("error", () => {
			res.destroy();
		});
		stream.on("end", () => {
			resolvePromise();
		});
		res.on("close", () => {
			stream.destroy();
			resolvePromise();
		});
		stream.pipe(res);
	});
}
//#endregion
export { Config, DEFAULT_WALLPAPER_SETTINGS, WALLPAPER_MODES, WALLPAPER_SETTINGS_FIELDS, WALLPAPER_SETTINGS_NAMESPACE, apply, applyWeProject, closeShell, decodeProjectJson, defaultProjectRoots, defaultWeApplySeam, defaultWorkshopRoots, isPidAlive, openShell, readShellPid, resolveAppDir, resolveElectronPath, resolveEngineRoot, resolveProjectDir, resolveRaw, scanWallpapers, setWeAudio, shellPidFile };
