/**
 * Preload bridge for the transparent chat shell: exposes a minimal window
 * control surface (minimize / toggle-maximize / close + maximize state) to
 * the page through contextBridge, so the chat's header utilities can render
 * native-browser-style window buttons. Also marks the page as running inside
 * the shell (window.desktopShell), which the wallpaper plugin uses to decide
 * whether to show those controls.
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktopShell', {
  /** Re-run the one-click clear screen (hide every other window + icons). */
  clearDesktop: () => ipcRenderer.send('shell:clear-desktop'),
  minimize: () => ipcRenderer.send('shell:minimize'),
  toggleMaximize: () => ipcRenderer.send('shell:toggle-maximize'),
  close: () => ipcRenderer.send('shell:close'),
  isMaximized: () => ipcRenderer.invoke('shell:is-maximized'),
  /** Subscribe to maximize state changes; returns an unsubscribe function. */
  onMaximizedChange: (callback) => {
    const listener = (_event, value) => callback(value)
    ipcRenderer.on('shell:maximized-changed', listener)
    return () => { ipcRenderer.removeListener('shell:maximized-changed', listener) }
  },
})
