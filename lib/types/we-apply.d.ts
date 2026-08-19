/**
 * The Wallpaper Engine CLI invocation seam (injectable for specs): returns the
 * engine executable to run, or undefined when WE is not installed.
 */
export interface WeApplySeam {
    /** Probe whether a Wallpaper Engine process is already running. */
    isWeRunning: () => boolean;
    /** Spawn the engine detached (returns immediately; used to wake a dead WE). */
    startEngine: (engineDir: string) => void;
    /** Run one WE control command synchronously; resolved status + output. */
    runControl: (engineDir: string, args: readonly string[]) => {
        status: number | null;
    };
}
/** Default seam: real process probing and spawning. */
export declare const defaultWeApplySeam: WeApplySeam;
/**
 * Apply one wallpaper project through Wallpaper Engine. The engine is started
 * first when it is not running, then the control command is sent. The call
 * never throws: every failure becomes a `{ ok: false, reason }` result.
 * @param engineDir - Wallpaper Engine install directory (resolveEngineRoot).
 * @param projectDir - the wallpaper project directory (contains project.json).
 * @param seam - injectable process seam (defaults to the real engine).
 * @returns whether the wallpaper was applied, plus a machine-readable reason.
 */
export declare function applyWeProject(engineDir: string, projectDir: string, seam?: WeApplySeam): {
    ok: boolean;
    reason?: string;
};
/**
 * Mute or unmute all Wallpaper Engine wallpapers (`-control mute` /
 * `-control unmute`). The engine must be running for the control message to
 * reach it; a dead engine is started first (it resumes its last wallpaper).
 * @param engineDir - Wallpaper Engine install directory (resolveEngineRoot).
 * @param muted - true to mute, false to unmute.
 * @param seam - injectable process seam (defaults to the real engine).
 * @returns whether the audio control command was accepted.
 */
export declare function setWeAudio(engineDir: string, muted: boolean, seam?: WeApplySeam): {
    ok: boolean;
    reason?: string;
};
//# sourceMappingURL=we-apply.d.ts.map