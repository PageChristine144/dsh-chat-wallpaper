/**
 * Transparent chat shell: a frameless, transparent, full-screen window loading
 * the DSH chat GUI. The OS desktop — including Wallpaper Engine's live scene
 * rendering — shows through the chat whenever the wallpaper plugin is in
 * Desktop-transparent mode (no wallpaper layer, translucent surfaces).
 *
 * One-click clear screen: on startup (and on demand with F11) every other
 * visible window is minimized and desktop icons are hidden, leaving only the
 * wallpaper and this chat — programs are never killed. F11 again restores.
 */
const { app, BrowserWindow, screen, ipcMain } = require('electron')
const { execFile, spawnSync } = require('node:child_process')
const { join } = require('node:path')
const { writeFileSync, rmSync } = require('node:fs')

// The Chromium switch that makes transparent windows composite to the desktop
// on Windows; without it a transparent window renders opaque behind the page's
// alpha.
app.commandLine.appendSwitch('enable-transparent-visuals')

/** Chat GUI URL; override with DSH_CHAT_URL. */
const CHAT_URL = process.env.DSH_CHAT_URL || 'http://127.0.0.1:3080'

/** Path of the clear-screen helper and its remembered-state file. */
const CLEAR_SCRIPT = join(__dirname, 'clear-screen.ps1')
const STATE_FILE = () => join(app.getPath('temp'), 'dsh-chat-desktop-state.json')
/** PID file the plugin host reads to manage this shell's lifecycle. */
const PID_FILE = () => join(app.getPath('temp'), 'dsh-chat-desktop.pid')

// Publish our main-process pid so the chat plugin can open/close this shell.
app.whenReady().then(() => {
  writeFileSync(PID_FILE(), String(process.pid))
})
app.on('will-quit', () => {
  try { rmSync(PID_FILE(), { force: true }) } catch { /* best effort */ }
})

/** Run the clear/restore helper; resolved when the helper exits. */
function clearScreen(mode) {
  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', CLEAR_SCRIPT, mode, String(process.pid), STATE_FILE()],
      { windowsHide: true },
      (error, stdout) => {
        if (error) console.error('clear-screen:', String(error))
        if (stdout) console.log('clear-screen:', String(stdout).trim())
        resolve()
      },
    )
  })
}

app.whenReady().then(() => {
  // Fill the display but ALWAYS leave the taskbar strip visible: when the
  // taskbar is (or was) set to auto-hide, Windows reports the work area as the
  // full screen, so workArea cannot be trusted. Reserve a fixed taskbar band
  // (Win11 standard 48px) so the user can always reach other apps and end this
  // shell from it, even while the chat is minimized.
  const display = screen.getPrimaryDisplay()
  const TASKBAR_RESERVE = 48
  const width = display.bounds.width
  const height = Math.max(200, display.bounds.height - TASKBAR_RESERVE)

  const win = new BrowserWindow({
    width,
    height,
    x: display.bounds.x,
    y: display.bounds.y,
    transparent: true,
    frame: false,
    backgroundColor: '#00000000',
    hasShadow: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // The window-control bridge the wallpaper plugin reads (window.desktopShell).
      preload: join(__dirname, 'preload.js'),
    },
  })

  // Browser-style window controls driven from the page (minimize / maximize /
  // close). The close path first restores the desktop chat window that the
  // clear-screen minimized, so quitting the shell never leaves the user with a
  // bare desktop and no chat.
  let restoringOnClose = false
  ipcMain.on('shell:minimize', () => { win.minimize() })
  ipcMain.on('shell:toggle-maximize', () => {
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('shell:close', () => { win.close() })
  // Re-run the one-click clear on demand: windows summoned since the last
  // clear (apps brought up mid-chat) get tucked away again; icons re-hide.
  ipcMain.on('shell:clear-desktop', () => { void clearScreen('clear') })
  ipcMain.handle('shell:is-maximized', () => win.isMaximized())
  win.on('maximize', () => { win.webContents.send('shell:maximized-changed', true) })
  win.on('unmaximize', () => { win.webContents.send('shell:maximized-changed', false) })
  win.on('close', () => {
    if (restoringOnClose) return
    restoringOnClose = true
    // Best effort, synchronous: bring the recorded chat window back before the
    // shell dies. The host closeShell path uses the same script/mode.
    try {
      spawnSync('powershell.exe', [
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', CLEAR_SCRIPT,
        'restore-chat', String(process.pid), STATE_FILE(),
      ], { stdio: 'ignore', windowsHide: true, timeout: 15_000 })
    } catch {
      /* the shell is quitting; best effort only */
    }
  })

  win.loadURL(CHAT_URL)

  // F11 toggles the clear screen; F12 toggles DevTools; Esc toggles mouse
  // passthrough (quick peek at the desktop). Electron has no
  // isIgnoreMouseEvents getter — track it locally.
  let mousePassthrough = false
  let screenCleared = false
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    if (input.key === 'F11') {
      screenCleared = !screenCleared
      void clearScreen(screenCleared ? 'clear' : 'restore')
      event.preventDefault()
    } else if (input.key === 'F12') {
      win.webContents.toggleDevTools()
      event.preventDefault()
    } else if (input.key === 'Escape') {
      mousePassthrough = !mousePassthrough
      win.setIgnoreMouseEvents(mousePassthrough)
      event.preventDefault()
    }
  })

  // Clear the desktop shortly after launch: minimize every other window and
  // hide the icons so the wallpaper shows through almost immediately (the
  // shell's own window is excluded from the minimize pass by process name).
  win.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      screenCleared = true
      void clearScreen('clear')
    }, 3000)
  })

  app.on('window-all-closed', () => { app.quit() })
})
