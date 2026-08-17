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

*Coming soon — see `docs/screenshots/`.* (The plugin is currently developed against a private desktop setup; screenshots will be added in a follow-up.)

## Install

The plugin ships **inside the DeepSeek Harness monorepo** at `packages/client/ui-wallpaper`, so the easiest way to use it is to clone dsh and run it there — no extra install step.

To build the plugin's client bundle from the dsh workspace:

```sh
npx tsdown --env.DSH_BUILD_FACE client
```

The transparent shell has no external runtime deps beyond Electron; see [`tools/chat-desktop/README.md`](tools/chat-desktop/README.md).

## Development

This repository is a **source mirror / fork base** for the plugin: the full build-and-test environment lives in the upstream dsh workspace (several internal packages such as `@deepseek-ai/cordis` are **not** published to npm independently, so the package cannot be installed and built standalone).

Workflow for contributors:

```sh
# 1. clone dsh and place this package where dsh expects it
git clone https://github.com/deepseek-ai/deepseek-harness.git
# copy packages/ui-wallpaper from this repo over packages/client/ui-wallpaper

# 2. type-check, test, bundle (from the dsh workspace root)
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
