# DSH Chat Desktop — 透明桌面壳

[English](#english) · [中文](#中文)

## 中文

让聊天界面**透明地浮在桌面上**：无边框、全屏、窗口背景透明的壳，加载本机 DSH 聊天 GUI
（默认 `http://127.0.0.1:3080`，可用环境变量 `DSH_CHAT_URL` 覆盖）。桌面壁纸——包括
Wallpaper Engine 正在实时渲染的场景壁纸——会透过聊天界面直接显示。

**使用步骤**

1. 启动 DSH 聊天服务（`dsh web`），确认 `http://127.0.0.1:3080` 可访问。
2. 安装依赖并启动：`cd tools/chat-desktop && pnpm install && pnpm start`。
3. 在聊天界面把壁纸来源切到「**桌面透明**」（会话头面板或设置 → 聊天背景），
   表面半透明滑杆控制面板透明度。

**一键清屏**：壳启动约 15 秒后自动把桌面上**除壁纸外的所有窗口最小化、隐藏桌面图标**
（程序不杀，只清离桌面）。之后按 `F11` 可随时一键清屏 / 一键恢复。任务栏自动隐藏：
任务栏右键 → 任务栏设置 → 自动隐藏。

**快捷键**：`F11` 一键清屏 / 恢复；`F12` 开发者工具；`Esc` 切换鼠标穿透（临时看桌面/恢复操作）。

**原理**：Windows 普通浏览器窗口无法透明；Electron 透明窗口把页面合成结果（含 alpha）直接
透到桌面。插件「桌面透明」模式隐藏自己的壁纸层、只保留表面半透明 token，于是 WE 在桌面上的
实时渲染（含四类 scene 场景壁纸）原样透过聊天界面显示。

## English

A frameless, transparent, full-screen shell loading the local DSH chat GUI
(default `http://127.0.0.1:3080`; override with `DSH_CHAT_URL`). The OS desktop —
including Wallpaper Engine's live scene rendering — shows through the chat.

**Usage**

1. Start the DSH chat server (`dsh web`) and confirm `http://127.0.0.1:3080` is up.
2. `cd tools/chat-desktop && pnpm install && pnpm start`.
3. In the chat, switch the wallpaper source to **Desktop-transparent** mode
   (header panel or Settings → Chat background); the translucency slider
   controls surface opacity.

**One-click clear screen**: ~15s after startup the shell minimizes every other
window and hides desktop icons, leaving only the wallpaper and this chat
(programs are never killed). `F11` clears / restores on demand. Auto-hide the
taskbar from its settings for a fully clean desktop.

**Keys**: `F11` clear/restore; `F12` DevTools; `Esc` toggles mouse passthrough.

**Why**: regular browser windows cannot be transparent on Windows; an Electron
transparent window composites the page (alpha included) straight to the
desktop. The plugin's Desktop-transparent mode hides its own wallpaper layer
and keeps only translucent surface tokens, so Wallpaper Engine's live rendering
(including the four scene wallpapers) shows through the chat exactly as
rendered.
