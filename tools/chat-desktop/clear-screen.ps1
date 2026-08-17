# Clear-screen helper for the transparent chat shell: minimize every visible
# top-level window except the shell's own (and the desktop), hide desktop
# icons, and remember what was minimized so a restore can bring it back.
# Programs are never killed — only moved off the desktop.
#
# The taskbar is NEVER auto-hidden: it stays visible so the user can always
# reach other apps and end the transparent shell from it. Desktop icons are
# toggled through the shell view's own command (WM_COMMAND 0x7002), which
# needs no Explorer restart — so closing the chat never re-opens folders.
#
# Modes:
#   clear          minimize everything + hide icons, record {hwnd, title, hidden}
#   restore        restore every recorded window + show icons again
#   restore-chat   restore only windows whose title marks the chat
#                  (DeepSeek Harness); icons come back too
param(
  [Parameter(Mandatory = $true)][string]$Mode,
  [int]$ExcludePid = 0,
  [string]$StateFile = ''
)

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class DshWin32 {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc p, IntPtr l);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint wpid);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern IntPtr GetShellWindow();
  [DllImport("user32.dll")] public static extern IntPtr FindWindow(string c, string w);
  [DllImport("user32.dll")] public static extern IntPtr FindWindowEx(IntPtr p, IntPtr a, string c, string w);
  [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
}
"@

$iconKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced'

# Desktop icons are visible when the desktop list view exists under Progman.
function Test-DesktopIconsVisible() {
  $progman = [DshWin32]::FindWindow('Progman', 'Program Manager')
  if ($progman -eq [IntPtr]::Zero) { return $false }
  $defView = [DshWin32]::FindWindowEx($progman, [IntPtr]::Zero, 'SHELLDLL_DefView', $null)
  if ($defView -eq [IntPtr]::Zero) { return $false }
  return ([DshWin32]::FindWindowEx($defView, [IntPtr]::Zero, 'SysListView32', $null) -ne [IntPtr]::Zero)
}

# Set desktop icon visibility. SHOWING uses the shell view command (0x7402 —
# verified on this system; 0x7002 is a different command that does not flip
# icons), which needs no Explorer restart, so restoring never re-opens the
# user's folders. HIDING writes HideIcons=1; Explorer only applies that on a
# redraw, so the shell view is restarted — the multi-pass minimize sweep then
# catches any folder windows Explorer re-opens. The registry value is the
# source of truth for the current state (the SysListView32 probe is
# unreliable).
function Test-IconsHidden() {
  return ((Get-ItemProperty -Path $iconKey -Name HideIcons -ErrorAction SilentlyContinue).HideIcons) -eq 1
}

function Set-DesktopIcons([bool]$Visible) {
  $progman = [DshWin32]::FindWindow('Progman', 'Program Manager')
  $defView = [DshWin32]::FindWindowEx($progman, [IntPtr]::Zero, 'SHELLDLL_DefView', $null)
  if ($Visible) {
    # Show: 0x7402 flips icons on; it is idempotent when already visible and
    # works without an Explorer restart.
    if ($defView -ne [IntPtr]::Zero -and (Test-IconsHidden)) {
      [void][DshWin32]::SendMessage($defView, 0x0111, [IntPtr]0x7402, [IntPtr]::Zero) # WM_COMMAND
    }
    Set-ItemProperty -Path $iconKey -Name HideIcons -Value 0 -Type DWord -ErrorAction SilentlyContinue
    return
  }
  # Hide: registry + restart the shell view so Explorer re-reads it. Restart
  # only when icons are currently shown (already hidden -> nothing to do).
  if (Test-IconsHidden) { return }
  Set-ItemProperty -Path $iconKey -Name HideIcons -Value 1 -Type DWord -ErrorAction SilentlyContinue
  Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 500
  Start-Process explorer.exe
}

function Apply-DesktopCleanup([bool]$Hide) {
  Set-DesktopIcons (-not $Hide)
}

function Read-Recorded() {
  if ($StateFile -eq '' -or -not (Test-Path $StateFile)) { return @() }
  $saved = Get-Content $StateFile | ConvertFrom-Json
  if ($saved -is [array]) { return @($saved) }
  if ($null -eq $saved) { return @() }
  return @($saved)
}

$script:recorded = @()

# One minimize sweep: enumerate visible top-level windows and minimize every
# one not already recorded and not ours (shell pid / electron / the desktop /
# the taskbar). Tool windows (ASUS OSD etc.) ignore SW_MINIMIZE — those
# degrade to SW_HIDE, and the restore pass brings them back with SW_SHOW.
function Invoke-MinimizeSweep() {
  $script:newFound = 0
  $existing = @{}
  foreach ($entry in $script:recorded) { $existing[$entry.h] = $true }
  $callback = [DshWin32+EnumProc]{
    param($h, $l)
    if (-not [DshWin32]::IsWindowVisible($h)) { return $true }
    if ($h -eq [DshWin32]::GetShellWindow()) { return $true }
    # NEVER touch the taskbar: hiding it makes the user lose access to other
    # apps (and the Win key) even though the shell reserves its strip.
    $cls = New-Object System.Text.StringBuilder 256
    [void][DshWin32]::GetClassName($h, $cls, $cls.Capacity)
    if ($cls.ToString() -match 'Shell_TrayWnd|Shell_SecondaryTrayWnd|Progman') { return $true }
    $wpid = [uint32]0
    [void][DshWin32]::GetWindowThreadProcessId($h, [ref]$wpid)
    if ($wpid -eq $ExcludePid) { return $true }
    $proc = Get-Process -Id $wpid -ErrorAction SilentlyContinue
    if ($proc -and $proc.ProcessName -match 'electron') { return $true }
    $key = $h.ToString()
    if ($existing.ContainsKey($key)) { return $true }
    $existing[$key] = $true
    $title = New-Object System.Text.StringBuilder 512
    [void][DshWin32]::GetWindowText($h, $title, $title.Capacity)
    [void][DshWin32]::ShowWindow($h, 6) # SW_MINIMIZE
    # SW_MINIMIZE succeeded when the window is now iconic. IsWindowVisible
    # stays true for minimized windows, so it cannot tell success apart.
    $hidden = -not [DshWin32]::IsIconic($h)
    if ($hidden) {
      # The window stayed un-minimized (tool window): hide it instead.
      [void][DshWin32]::ShowWindow($h, 0) # SW_HIDE
    }
    $script:recorded += [pscustomobject]@{ h = $key; t = $title.ToString(); hidden = $hidden }
    $script:newFound += 1
    return $true
  }
  [void][DshWin32]::EnumWindows($callback, [IntPtr]::Zero)
  return $script:newFound
}

if ($Mode -eq 'clear') {
  Apply-DesktopCleanup $true
  # Multi-pass sweep: an Explorer restart may re-open folder windows a moment
  # later, so re-enumerate until no new windows appear (late ones get caught).
  for ($pass = 0; $pass -lt 4; $pass++) {
    if ($pass -gt 0) { Start-Sleep -Seconds 2 }
    $newCount = Invoke-MinimizeSweep
    if ($newCount -eq 0) { break }
  }
  if ($StateFile -ne '') {
    $script:recorded | ConvertTo-Json -Depth 3 | Set-Content -Path $StateFile -Encoding UTF8
  }
  Write-Output "cleared $($script:recorded.Count) windows"
} else {
  $chatOnly = $Mode -eq 'restore-chat'
  # Bring the desktop back: un-hide the icons and the taskbar so the user can
  # see and click their apps again after the transparent chat closes.
  Apply-DesktopCleanup $false
  foreach ($entry in (Read-Recorded)) {
    if ($chatOnly -and -not ($entry.t -match 'harness|deepseek')) { continue }
    try {
      # Hidden tool windows come back with SW_SHOW; minimized ones with
      # SW_RESTORE. Absent flag (older records) defaults to restore.
      $cmd = if ($entry.hidden) { 5 } else { 9 }
      [void][DshWin32]::ShowWindow([IntPtr]::new([int64]$entry.h), $cmd)
    } catch { }
  }
  if (-not $chatOnly) {
    Remove-Item $StateFile -ErrorAction SilentlyContinue
  }
  Write-Output "restored"
}
