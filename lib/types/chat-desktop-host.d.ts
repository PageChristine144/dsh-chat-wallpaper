/** Plugin config for the transparent chat desktop. */
export interface ChatDesktopConfig {
    /** Absolute path of the shell app directory (contains package.json + main.js). */
    appDir?: string;
    /** Absolute path of the electron executable (defaults to the app's node_modules). */
    electronPath?: string;
}
/**
 * Default shell app directory: walk up from the working directory and the
 * config root looking for `<root>/tools/chat-desktop` (with a main.js). The
 * config root (`ctx.baseUrl`) is the profile dir, not the repo, so the repo
 * root is found by walking up from cwd.
 */
export declare function resolveAppDir(baseUrl: string | undefined, config: ChatDesktopConfig): string;
/** Default electron executable inside the shell app. */
export declare function resolveElectronPath(appDir: string, config: ChatDesktopConfig): string;
/** Temp pid file the shell writes at startup (same value as its app.getPath('temp')). */
export declare function shellPidFile(): string;
/** Whether a pid names a live process (Windows-compatible existence probe). */
export declare function isPidAlive(pid: number): boolean;
/** The shell's main-process pid, or undefined when the shell is not running. */
export declare function readShellPid(): number | undefined;
/** Read a shell pid file: the pid when it names a live process, else undefined. */
export declare function readShellPidFromFile(pidFile: string): number | undefined;
/**
 * Open the transparent shell (idempotent): if its pid file names a live
 * process, it is already open. Otherwise spawn the electron app detached.
 * @param baseUrl - config tree root used to locate the shell app by default.
 * @param config - plugin chat-desktop config.
 * @returns whether the shell is open, and the reason when it cannot start.
 */
export declare function openShell(baseUrl: string | undefined, config: ChatDesktopConfig): {
    ok: boolean;
    alreadyOpen?: boolean;
    reason?: string;
    electronPath?: string;
};
/**
 * Close the transparent shell (idempotent): first restore the desktop state
 * the clear-screen changed (un-minimize the recorded windows — the opaque
 * chat window returns — and show desktop icons), then kill the shell process
 * tree and clear its pid file.
 * @param baseUrl - config tree root used to locate the shell app by default.
 * @param config - plugin chat-desktop config.
 * @returns whether the shell is closed, and the reason when it cannot be.
 */
export declare function closeShell(baseUrl: string | undefined, config: ChatDesktopConfig): {
    ok: boolean;
    alreadyClosed?: boolean;
    reason?: string;
};
//# sourceMappingURL=chat-desktop-host.d.ts.map