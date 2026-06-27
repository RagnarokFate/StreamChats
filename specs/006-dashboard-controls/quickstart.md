# Quickstart: Dashboard Controls Panel

**Branch**: `006-dashboard-controls`

## Prerequisites

- Node.js 18+
- npm workspaces (already configured in root `package.json`)
- OBS Studio (for overlay testing)

## Setup

```bash
# 1. Install dependencies (from repo root)
npm install

# 2. Install react-router-dom in overlay-ui
cd apps/overlay-ui
npm install react-router-dom

# 3. Build all packages
cd ../..
npm run build
```

## Running

```bash
# Start the local server (from repo root)
node apps/local-server/dist/index.js --twitch="ragnarokfate" --youtube="@RagnarokFate" --port=9090
```

## Access Points

| URL | Purpose |
|-----|---------|
| `http://localhost:9090/` | OBS overlay (add as Browser Source) |
| `http://localhost:9090/dashboard` | Streamer dashboard (open in browser) |
| `http://localhost:9091/` | Reader mode overlay |

## OBS Browser Source Setup

1. Add a new **Browser Source** in OBS
2. Set URL to: `http://localhost:9090/?theme=glass`
3. Set width: `450`, height: `600`
4. Check "Shutdown source when not visible" (optional)
5. The overlay will automatically receive setting changes from the dashboard

## Dashboard Usage

1. Open `http://localhost:9090/dashboard` in your browser
2. Use the sidebar to navigate between sections:
   - **Chat Controls**: Clear chat, change fonts, live preview
   - **Overlay**: Theme picker, emote toggles, timestamp settings
   - **Statistics**: Real-time per-platform engagement metrics
   - **Platforms**: Connection health, reconnect buttons
   - **Moderation**: Banned words, spam protection, action settings
3. All changes are applied in real-time to connected OBS overlays

## Development

```bash
# Start dev server with hot reload
cd apps/overlay-ui
npm run dev

# Dashboard available at http://localhost:5173/dashboard
# Overlay available at http://localhost:5173/
```
