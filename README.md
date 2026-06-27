<p align="center">
  <img src="docs/images/banner.png" alt="StreamChats Banner" width="100%" />
</p>

<p align="center">
  <strong>Aggregate Twitch, YouTube, Kick, and TikTok live chat into a single beautiful overlay for OBS Studio and Native Desktop.</strong>
</p>

<p align="center">
  <a href="#-installation"><img src="https://img.shields.io/badge/version-1.0.0-7c3aed?style=for-the-badge" alt="Version" /></a>
  <a href="#-license"><img src="https://img.shields.io/badge/license-MIT-06b6d4?style=for-the-badge" alt="License" /></a>
  <a href="#-supported-platforms"><img src="https://img.shields.io/badge/platforms-4-53fc18?style=for-the-badge" alt="Platforms" /></a>
  <a href="#-overlay-themes"><img src="https://img.shields.io/badge/themes-9-ee1d52?style=for-the-badge" alt="Themes" /></a>
</p>

---

## 📖 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [Supported Platforms](#-supported-platforms)
- [Architecture](#-architecture)
- [Installation Guide](#-installation-guide)
- [Running StreamChats](#-running-streamchats)
  - [Native Desktop App](#1-native-desktop-app-recommended)
  - [Command Line Interface (CLI)](#2-command-line-interface-cli)
  - [OBS Native Lua Script](#3-obs-native-lua-script)
- [Usage & Guides](#-usage--guides)
  - [The Control Panel Dashboard](#the-control-panel-dashboard)
  - [OBS Browser Source Integration](#obs-browser-source-integration)
  - [Choosing an Overlay Theme](#choosing-an-overlay-theme)
- [Dynamic Connectors & Extensibility](#-dynamic-connectors--extensibility)
- [Project Structure](#-project-structure)
- [Known Limitations](#-known-limitations)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**StreamChats** is a modular, open-source chat aggregation engine built for live streamers. It merges chat messages, gifts, super chats, raids, and follows from multiple streaming platforms into a single, real-time feed.

You can view the feed via the **Native Desktop App**, manage it via the **Control Panel Dashboard**, and display it on stream via the **OBS Browser Source**.

Everything runs **100% locally on your machine** — no cloud services, no external accounts, and no mandatory API keys required.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🖥️ **Native Desktop App** | A fully native Tauri Windows application for managing your stream without ever touching a CLI. |
| 🔗 **Multi-Platform Chat** | Aggregate messages from Twitch, YouTube, Kick, and TikTok simultaneously. |
| 🎨 **9 Overlay Themes** | Match your brand with themes ranging from cyberpunk neon to retro pixel art. |
| 🛡️ **Built-in Moderation** | Real-time profanity filtering and banned-word censoring out of the box. |
| ☁️ **Cloud Sync & Studio** | Optional Last-Write-Wins (LWW) cloud sync with robust conflict logging to persist your settings. |
| 🧩 **Premium Marketplace** | Expand features securely using isolated-vm sandboxed plugins. |
| 🎬 **Native OBS Plugin** | Included Lua script adds a settings panel directly inside OBS Studio to spawn the server. |
| ⚡ **Lightweight** | Under 2% CPU overhead — backed by a highly optimized SQLite Event Bus. |

---

## 📡 Supported Platforms

<table>
<tr>
<td align="center" width="25%">
  <img src="https://img.shields.io/badge/Twitch-9146FF?style=for-the-badge&logo=twitch&logoColor=white" alt="Twitch" /><br/>
  <strong>Twitch</strong><br/>
  <sub>IRC WebSocket with full badge and emote support</sub>
</td>
<td align="center" width="25%">
  <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" /><br/>
  <strong>YouTube</strong><br/>
  <sub>Live chat polling with Super Chat support</sub>
</td>
<td align="center" width="25%">
  <img src="https://img.shields.io/badge/Kick-53FC18?style=for-the-badge&logo=kick&logoColor=black" alt="Kick" /><br/>
  <strong>Kick</strong><br/>
  <sub>Real-time Pusher WebSocket connection</sub>
</td>
<td align="center" width="25%">
  <img src="https://img.shields.io/badge/TikTok-EE1D52?style=for-the-badge&logo=tiktok&logoColor=white" alt="TikTok" /><br/>
  <strong>TikTok</strong><br/>
  <sub>Protobuf WebSocket for chat & gifts</sub>
</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Desktop App                            │
│  ┌────────────────────────┐  ┌───────────────────────────────┐  │
│  │   Tauri Window          │  │   OBS Studio + Lua Script     │  │
│  └───────────┬────────────┘  └───────────────▲───────────────┘  │
└──────────────┼───────────────────────────────┼──────────────────┘
               │ connects                      │ WebSocket (ws://)
               ▼                               │
┌──────────────────────────────────────────────┴──────────────────┐
│                      Local Node.js Server                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Event Bus (SQLite)                     │  │
│  │   (Persists stream events, handles replay & consumer ops)  │  │
│  └───────────▲───────────────────────────────▲───────────────┘  │
│              │ published events              │ reads            │
│  ┌───────────┴──────────┐       ┌────────────┴─────────────┐    │
│  │ Moderation Pipeline  │       │       Analytics SDK      │    │
│  └───────────▲──────────┘       └──────────────────────────┘    │
│              │ normalized ChatEvent                             │
│  ┌────────┐ ┌────────┐ ┌──────┐ ┌─────┐ ┌───────────────────┐   │
│  │ Twitch │ │YouTube │ │ Kick │ │ TT  │ │ Plugin Sandbox    │   │
│  │  IRC   │ │ Poll   │ │Pusher│ │Proto│ │ (isolated-vm)     │   │
│  └────────┘ └────────┘ └──────┘ └─────┘ └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Data flow:**
1. Each **Dynamic Connector** connects to its platform's chat API and normalizes messages.
2. The **Moderation Pipeline** filters profanity and censors banned words.
3. The **SQLite Event Bus** stores the events to disk for persistence and analytics.
4. The **Local Server** broadcasts events over dual WebSockets to the Overlay UI and Dashboard.
5. The **Tauri Desktop App** natively connects to the server and presents the dashboard.

---

## 🚀 Installation Guide

### Prerequisites
- **Node.js** (v20+)
- **npm** (v9+)
- **Rust** (Required *only* if you are building the Native Desktop App)

### 1. Clone & Install

```bash
git clone https://github.com/RagnarokFate/StreamChats.git
cd StreamChats
npm install
```

### 2. Build Core Packages & UI

Before running the server, build all the internal monorepo packages:

```bash
npm run build --workspaces --if-present
```

---

## 🏃 Running StreamChats

StreamChats can be operated in three different ways depending on your technical preference:

### 1. Native Desktop App (Recommended)
We built a native Windows Desktop app using Tauri. This gives you a standalone window for your dashboard without needing a web browser or command line.

```bash
npm run tauri dev -w apps/desktop
```
*This will compile the Rust backend and launch the native StreamChats Dashboard window.*

### 2. Command Line Interface (CLI)
If you prefer running the server headlessly and viewing the dashboard in your standard web browser:

```bash
# Start the local background server
node apps/local-server/dist/index.js --port=9090
```
Then, open `http://localhost:9091/dashboard` in your browser.

*You can also pass channels directly via CLI:*
`node apps/local-server/dist/index.js --twitch=ragnarokfate --youtube=@RagnarokFate`

### 3. OBS Native Lua Script
If you want OBS Studio to automatically start and stop StreamChats:
1. Open **OBS Studio** → **Tools** → **Scripts**.
2. Click the **+** button and select `plugins/obs/obs-chat-aggregator.lua`.
3. Configure your channels directly inside OBS and hit **Connect / Apply**. The script will securely run the Node background server automatically.

---

## 🎮 Usage & Guides

### The Control Panel Dashboard
When the server is running, the **Control Panel** is available either via the Native Desktop App or by navigating to `http://localhost:9091/dashboard` in a browser. 

The dashboard provides multiple panels:
- **Chat Feed**: A solid-background reader version of the chat for easy moderation.
- **Settings**: Manage platform connections, dynamically connect/disconnect platforms on the fly, and configure the profanity filter.
- **Plugin Marketplace**: Install new features securely into the `isolated-vm` sandbox (e.g., AI Summarizer, Custom Visualizers).
- **Cloud Sync**: Sync your settings and preferences securely.

### OBS Browser Source Integration
The actual Transparent Overlay meant for your live stream is hosted on a different port than the dashboard. 

1. In your OBS Scene, click **+** → **Browser**.
2. Set the URL to: `http://localhost:9090/?theme=glass`
3. Set **Width** to `500` and **Height** to `800`.
4. ✅ Check **"Shutdown source when not visible"** to save resources.

### Choosing an Overlay Theme
StreamChats ships with **9 beautifully crafted overlay themes**. To choose one, simply change the `?theme=` parameter in the OBS Browser Source URL:

| Theme | URL Parameter | Description |
|-------|:---:|-------------|
| **Glass** _(default)_ | `?theme=glass` | Premium glassmorphism with frosted blur backgrounds |
| **Minimal** | `?theme=minimal` | Clean, borderless text with subtle left-accent line |
| **Neon** | `?theme=neon` | Cyberpunk with glowing cyan borders and pulse animation |
| **Classic** | `?theme=classic` | Solid opaque blocks, inline Twitch-style format |
| **Retro** | `?theme=retro` | 8-bit pixel art aesthetic with blocky yellow borders |
| **Bubble** | `?theme=bubble` | Rounded iMessage-style bubbles with gradient colors |
| **Holographic** | `?theme=holographic` | Animated iridescent rainbow gradient backgrounds |
| **Comic** | `?theme=comic` | Bold outlines and offset drop shadows, comic book feel |
| **Terminal** | `?theme=terminal` | Green-on-black hacker aesthetic with monospace font |

---

## 🔌 Dynamic Connectors & Extensibility

StreamChats features **Dynamic Connectors**. This means you do not need to restart the server to add or remove platforms. You can connect to Twitch, disconnect from YouTube, and connect to TikTok entirely on-the-fly directly from the Settings Dashboard!

If you want to add a completely new platform to StreamChats, the `BaseConnector` SDK makes it incredibly simple:

```typescript
import { BaseConnector, ConnectorStatus } from '@obs-chat/connector-sdk';
import crypto from 'crypto';

export class MyPlatformConnector extends BaseConnector {
  protected async connect(): Promise<void> {
    this.dispatchMessage({
      eventId: crypto.randomUUID(),
      platform: 'custom',
      timestamp: new Date().toISOString(),
      type: 'chat',
      author: { id: 'user-123', name: 'Username' },
      message: { text: 'Hello world!', fragments: [] },
    });
    this.setStatus(ConnectorStatus.CONNECTED);
  }

  protected async disconnect(): Promise<void> {
    this.setStatus(ConnectorStatus.IDLE);
  }
}
```

---

## 📁 Project Structure

```
StreamChats/
│
├── 📂 apps/
│   ├── desktop/                  # Native Tauri Desktop Application
│   ├── local-server/             # Node.js HTTP + WebSocket server
│   │   └── src/index.ts          # CLI entry point, orchestration
│   └── overlay-ui/               # React/Vite chat overlay & Dashboard
│       └── src/
│           ├── App.tsx           # Theme router
│           ├── index.css         # All 9 themes
│           └── components/       # ChatFeed, Dashboard, PluginManager
│
├── 📂 connectors/
│   ├── twitch/                   # Twitch IRC WebSocket connector
│   ├── youtube/                  # YouTube Live Chat polling connector
│   ├── kick/                     # Kick Pusher WebSocket connector
│   └── tiktok/                   # TikTok Live protobuf connector
│
├── 📂 packages/
│   ├── analytics/                # Chat stream analytics SDK
│   ├── cloud-sync/               # Cloud sync Last-Write-Wins logic
│   ├── connector-sdk/            # BaseConnector abstract class
│   ├── event-bus/                # SQLite persistent Event Bus
│   ├── event-schema/             # Zod schemas (ChatEvent, Platform)
│   ├── identity/                 # Role-Based Access Control (RBAC)
│   ├── moderation-pipeline/      # Profanity filter & event router
│   ├── obs-integration/          # Shared OBS scripts and bindings
│   └── plugin-sdk/               # Plugin Marketplace & isolated-vm Sandbox
│
├── 📂 plugins/
│   └── obs/                      # OBS Studio Lua script
│       └── obs-chat-aggregator.lua
│
├── 📂 docs/                      # GitHub Pages landing page
│   ├── index.html
│   ├── styles.css
│   └── images/
│
├── 📂 specs/                     # Feature specifications (001-007)
├── README.md                     # This file
└── package.json                  # Monorepo workspace config
```

---

## ⚠️ Known Limitations

| Platform | Limitation |
|----------|------------|
| **Kick** | No official API — uses undocumented Pusher endpoint. May be blocked by Cloudflare in some networks. |
| **TikTok** | No official API — uses `tiktok-live-connector`. May require a sign API key for some regions. |
| **YouTube** | Requires an active live stream with **public chat** enabled. |
| **General** | All unofficial platform APIs may break if the platforms change their internal protocols. |

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/my-feature`)
3. **Commit** your changes (`git commit -m "feat: add my feature"`)
4. **Push** to the branch (`git push origin feat/my-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/RagnarokFate"><strong>RagnarokFate</strong></a>
</p>
