# dsh-chat-wallpaper

A chat background wallpaper plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (dsh), plus the transparent chat shell it pairs with.

English | [中文](README.zh.md)

## What it does

Paints a full-window wallpaper behind the DeepSeek Harness chat, and — in desktop-transparent mode — lets your **live OS desktop (Wallpaper Engine included) show right through the chat** inside a transparent Electron shell.

### Wallpaper sources

- **Local image** — pick a file; it is downscaled to a bounded JPEG data URL so the choice survives restarts.
- **Image URL** — any remote image URL.
- **Wallpaper Engine library** — scans your local Steam Workshop (`steamapps/workshop/content/431960`) and local `myprojects`, serves whitelisted image/video files over the loopback webserver with strict path containment; video wallpapers play muted, looped, cover-fit.
- **Desktop transparent** — no wallpaper layer at all; surfaces go translucent so whatever the OS renders behind the window (the desktop, or Wallpaper Engine's live scene) shows through, exactly as rendered.

### Chat text controls

- **13-color palette** for text (ink, snow, silver, rose gold, champagne, azure, violet, mint, coral, lemon, sea blue, blossom, grape) — applies to **all** chat text, not just bubbles.
- **Text opacity** (0–100%) — fades the text *and* its outline together.
- **White outline** (0–5, 0.25 steps) — keeps text readable over any wallpaper.
- **Font** (system / serif / mono / rounded) and **weight** (400–800).
- **Code background toggle** — hides the markdown inline-code / code-block backgrounds when they get in the way over a live wallpaper.

### Transparent chat shell (`tools/chat-desktop`)

A frameless transparent Electron window loading the dsh chat UI:

- One-click clear screen (F11 or the header clear-screen button): every other window is minimized and desktop icons are hidden — programs are **never** killed; F11 restores.
- Browser-style title bar buttons (clear-screen / minimize / maximize / close); closing the shell restores the chat window.
- The taskbar strip stays visible and usable.

## Screenshots

The chat interface with an anime-style wallpaper shown through it — the live Wallpaper Engine scene (or any local image / URL) renders behind the conversation, and chat text floats on top with the white outline:

![Chat wallpaper overlay demo](docs/screenshots/demo-wallpaper-overlay.jpg)

## Install

> **Quick install for AI agents** — paste this whole block into any AI assistant:
>
> ```text
> Install the dsh-chat-wallpaper plugin (a chat-background wallpaper plugin for DeepSeek Harness):
> 1. git clone https://github.com/deepseek-ai/deepseek-harness.git
> 2. git clone https://github.com/PageChristine144/dsh-chat-wallpaper.git
> 3. cp -r dsh-chat-wallpaper/packages/ui-wallpaper deepseek-harness/packages/client/ui-wallpaper
> 4. cd deepseek-harness && pnpm install && npx tsdown --env.DSH_BUILD_FACE client
> 5. npx dsh web
> Then configure the wallpaper in Settings → Chat background; the Desktop-transparent
> mode additionally needs tools/chat-desktop (npm install && npm start).
> ```

### Option A — inside the DeepSeek Harness monorepo (recommended)

The plugin ships inside `deepseek-harness` at `packages/client/ui-wallpaper`, so it comes with the harness — no separate install step.

```sh
# 1. prerequisites: Node.js 18+ and pnpm
# 2. clone the harness (the plugin is already included)
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
# 3. install dependencies and build the client bundles
pnpm install
npx tsdown --env.DSH_BUILD_FACE client
# 4. start the harness
npx dsh web   # see the harness README for alternative run commands
```

Open **Settings → Chat background** to configure the wallpaper; a quick-switch button also appears in the conversation header.

### Option B — from this repository

The package cannot be installed standalone (several internal packages such as `@deepseek-ai/cordis` are **not** published to npm), so the way to use it is to copy it into a harness workspace:

```sh
git clone https://github.com/PageChristine144/dsh-chat-wallpaper.git
git clone https://github.com/deepseek-ai/deepseek-harness.git
# place the package where the harness expects it
cp -r dsh-chat-wallpaper/packages/ui-wallpaper deepseek-harness/packages/client/ui-wallpaper
cd deepseek-harness
pnpm install
npx tsdown --env.DSH_BUILD_FACE client
```

### Transparent chat shell (`tools/chat-desktop`)

The desktop-transparent mode pairs with the Electron shell. It has no external runtime deps beyond Electron:

```sh
cd tools/chat-desktop
npm install   # pulls Electron
npm start     # or launch it from the plugin's Desktop-transparent mode
```

## Development

The full build-and-test environment lives in the upstream dsh workspace (several internal packages such as `@deepseek-ai/cordis` are **not** published to npm independently, so the package cannot be installed and built standalone). Workflow for contributors:

```sh
# 1. clone dsh and place this package where dsh expects it
git clone https://github.com/deepseek-ai/deepseek-harness.git
cp -r dsh-chat-wallpaper/packages/ui-wallpaper deepseek-harness/packages/client/ui-wallpaper

# 2. from the dsh workspace root: install, type-check, test, bundle
pnpm install
npx tsc -b tsconfig.client.json
npx vitest run packages/client/ui-wallpaper
npx tsdown --env.DSH_BUILD_FACE client
```

The test suite covers runtime settings flow, the DOM presenter (layers, ink, outline, opacity, code-background), the WE host routes, and the settings/header surfaces.

## Wallpaper Engine integration

- This is an **unofficial integration**. Wallpaper Engine is commercial software by Valve; this plugin only reads your local material directories and issues local commands on your machine. It does **not** bundle, ship, or require you to buy WE — you install it yourself.
- Wallpaper audio is controlled by **Wallpaper Engine's own settings** (e.g. "mute when another application has focus"). The plugin keeps a convenience sound toggle that records your intent, but does not fight the WE UI.
- Scene/web wallpapers fall back to their static preview; the plugin's focus is the live desktop-transparent experience.

## Remixing / 二创

This project is **MIT licensed** — you are free to fork, modify, extend, redistribute, and even build commercial products on top of it. Two small requirements:

1. Keep the original MIT copyright notice (see [LICENSE](LICENSE)).
2. Don't use the DeepSeek / upstream names to endorse your derivative without permission.

If you build something cool, open a PR back upstream or share it in the [dsh community](https://github.com/deepseek-ai/deepseek-harness/discussions) — tag it `dsh-plugin`!

## License

[MIT](LICENSE) © 2026 DeepSeek.
