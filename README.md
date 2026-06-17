# OBS Chat Aggregator

A modular, real-time chat aggregation engine for OBS Studio that combines live chat from **Twitch**, **YouTube**, **Kick**, and **TikTok** into a single, beautiful overlay.

## Features

- **Multi-Platform Chat** — Aggregate messages from Twitch, YouTube, Kick, and TikTok in real-time.
- **9 Overlay Themes** — Choose from Glass, Minimal, Neon, Classic, Retro, Bubble, Holographic, Comic, and Terminal styles.
- **Moderation Pipeline** — Built-in profanity filter and banned-word censoring with configurable word lists.
- **OBS Integration** — Native Lua script adds a settings panel directly inside OBS Studio for configuration.
- **Zero External Dependencies** — Runs entirely on your local machine. No cloud services, no accounts, no API keys required (except for platforms that need them).
- **Extensible Architecture** — Add new platforms by implementing a single `BaseConnector` class.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    OBS Studio                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │  Lua Plugin           │  │  Browser Source           │ │
│  │  (Settings + Spawner) │  │  (http://localhost:9090)  │ │
│  └──────────┬───────────┘  └──────────▲───────────────┘ │
└─────────────┼──────────────────────────┼────────────────┘
              │ spawns                   │ WebSocket
              ▼                          │
┌─────────────────────────────────────────┐
│         Local Node.js Server            │
│  ┌──────────────────────────────────┐   │
│  │     Moderation Pipeline          │   │
│  │  (filter → censor → broadcast)   │   │
│  └──────────▲───────────────────────┘   │
│             │ normalized events         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌───────┐  │
│  │Twitch│ │ YT   │ │ Kick │ │TikTok │  │
│  └──────┘ └──────┘ └──────┘ └───────┘  │
└─────────────────────────────────────────┘
```

## Prerequisites

- **Node.js** v20 or later
- **OBS Studio** v28 or later
- **npm** (comes with Node.js)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/StreamChats.git
   cd StreamChats
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build all packages**:
   ```bash
   npm run build --workspaces
   ```

## Usage

### Quick Start (Command Line)

Run the local server directly with your platform channels:

```bash
node apps/local-server/dist/index.js \
  --twitch=ragnarokfate \
  --youtube=@RagnarokFate \
  --kick=ragnarokfate \
  --tiktok=ragnarokfate \
  --port=9090
```

Then open `http://localhost:9090` in your browser to see the chat overlay.

### OBS Studio Setup

1. **Load the Lua Script**:
   - Open OBS Studio → Tools → Scripts
   - Click the `+` button and select `plugins/obs/obs-chat-aggregator.lua`

2. **Configure Your Channels**:
   - In the script properties panel, enter your channel names for Twitch and YouTube.
   - Click **Connect / Apply** to start the server.

3. **Add the Browser Source**:
   - Add a new **Browser Source** to your scene.
   - Set the URL to `http://localhost:9090`
   - Set width to `500` and height to `800` (adjust to taste).
   - Check **"Shutdown source when not visible"** to save resources.

### Choosing a Theme

Append `?theme=<name>` to the Browser Source URL. Available themes:

| Theme | URL | Description |
|-------|-----|-------------|
| **Glass** (Default) | `http://localhost:9090/?theme=glass` | Premium glassmorphism with frosted backgrounds |
| **Minimal** | `http://localhost:9090/?theme=minimal` | Clean, borderless text on transparent background |
| **Neon** | `http://localhost:9090/?theme=neon` | Cyberpunk with glowing cyan borders and pulsing effects |
| **Classic** | `http://localhost:9090/?theme=classic` | Solid opaque blocks, standard Twitch-style chat |
| **Retro** | `http://localhost:9090/?theme=retro` | 8-bit pixel-art aesthetic with blocky borders |
| **Bubble** | `http://localhost:9090/?theme=bubble` | Rounded messaging bubbles like iMessage/WhatsApp |
| **Holographic** | `http://localhost:9090/?theme=holographic` | Animated iridescent rainbow gradient backgrounds |
| **Comic** | `http://localhost:9090/?theme=comic` | Bold outlines and offset drop shadows, comic book style |
| **Terminal** | `http://localhost:9090/?theme=terminal` | Green-on-black hacker aesthetic with monospace font |

## Project Structure

```
StreamChats/
├── apps/
│   ├── local-server/         # Node.js HTTP + WebSocket server
│   └── overlay-ui/           # React/Vite chat overlay frontend
├── connectors/
│   ├── twitch/               # Twitch IRC connector
│   ├── youtube/              # YouTube Live Chat connector
│   ├── kick/                 # Kick (Pusher) connector
│   └── tiktok/               # TikTok Live connector
├── packages/
│   ├── connector-sdk/        # BaseConnector abstract class
│   ├── event-schema/         # Zod schemas for chat events
│   └── moderation-pipeline/  # Profanity filter and event router
├── plugins/
│   └── obs/                  # OBS Studio Lua script
├── docs/                     # GitHub Pages landing page
└── specs/                    # Feature specifications
```

## Adding a New Platform Connector

1. Create a new directory under `connectors/your-platform/`.
2. Add a `package.json` with dependencies on `@obs-chat/connector-sdk` and `@obs-chat/event-schema`.
3. Implement a class that extends `BaseConnector`:

```typescript
import { BaseConnector, ConnectorStatus } from '@obs-chat/connector-sdk';
import crypto from 'crypto';

export class MyPlatformConnector extends BaseConnector {
  protected async connect(): Promise<void> {
    // Connect to the platform's chat API
    // For each incoming message, normalize and dispatch:
    this.dispatchMessage({
      eventId: crypto.randomUUID(),
      platform: 'custom',
      timestamp: new Date().toISOString(),
      type: 'chat',
      author: { id: '123', name: 'Username' },
      message: {
        text: 'Hello world!',
        fragments: [{ type: 'text', text: 'Hello world!' }]
      }
    });
    this.setStatus(ConnectorStatus.CONNECTED);
  }

  protected async disconnect(): Promise<void> {
    // Clean up connections
    this.setStatus(ConnectorStatus.IDLE);
  }
}
```

4. Register the connector in `apps/local-server/src/index.ts`.

## Configuration

### CLI Arguments

| Argument | Description |
|----------|-------------|
| `--twitch=<channel>` | Twitch channel name (without #) |
| `--youtube=<handle>` | YouTube channel handle (e.g., `@ChannelName`) |
| `--kick=<channel>` | Kick channel name |
| `--tiktok=<username>` | TikTok username |
| `--port=<number>` | Server port (default: 9090) |

## Known Limitations

- **Kick & TikTok**: These platforms do not provide official APIs. Connections may be blocked by Cloudflare bot protection in some network environments.
- **YouTube**: Requires an active live stream with public chat enabled for the connector to find messages.
- **TikTok**: Requires `tiktok-live-connector` v2.4+ which needs Node.js 20+.

## License

MIT
