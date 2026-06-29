# Research: Dashboard Controls Panel

**Branch**: `006-dashboard-controls` | **Date**: 2026-06-20

## Research Tasks & Findings

### R1: Client-Side Routing for Vite + React

**Decision**: Use `react-router-dom` v6 with `BrowserRouter` and `Routes`.

**Rationale**: react-router-dom is the de facto standard for React routing. v6 is lightweight (~14KB gzipped), tree-shakeable, and supports the exact routing model needed (two routes: `/` for overlay, `/dashboard` for controls). Vite's SPA fallback already handles client-side routing via `index.html` fallback in dev mode. For production (served by the local-server), the existing `fs.stat` fallback to `index.html` in `server.ts` already handles SPA routing correctly (line 31-32).

**Alternatives considered**:
- **Wouter** (~1.3KB): Smaller but less ecosystem support. Rejected because react-router-dom's size is negligible for a desktop-only local app.
- **Query parameter routing** (`?mode=dashboard`): Simpler but harder to share URLs and doesn't support proper browser back/forward navigation.

---

### R2: Bidirectional WebSocket Command Protocol

**Decision**: Extend the existing `ws` WebSocket server to accept JSON commands from dashboard clients. Commands use a `{ type: "command", action: string, payload: object }` envelope. The server processes commands and broadcasts state changes as `{ type: "settings_update", settings: object }` events.

**Rationale**: The server already has a WebSocket server (`ws` package). Adding bidirectional messaging requires only an `onmessage` handler on the server side. No new dependencies needed. JSON-based commands are extensible and type-safe when paired with the existing zod schema system.

**Alternatives considered**:
- **REST API endpoints**: Would require HTTP routing middleware (express/fastify). Overkill for a single-user local app. Rejected to avoid new dependencies.
- **Socket.io**: Feature-rich but adds significant bundle size and complexity. Not needed for localhost-only communication. Rejected.

---

### R3: Server-Side Settings Persistence

**Decision**: Use a plain JSON file at `<project-root>/config/server-settings.json` for moderation and connector settings. Read on server startup, write atomically on changes. Use Node's built-in `fs` module — no additional dependencies.

**Rationale**: The app is local-first and single-user. A JSON file is the simplest persistence mechanism that survives server restarts. Atomic writes (write to `.tmp`, then rename) prevent corruption. The file is human-readable and git-ignorable.

**Alternatives considered**:
- **SQLite**: Overkill for a flat settings object. Adds a native dependency that complicates cross-platform builds.
- **Environment variables**: Not persistent across restarts without external tooling.

---

### R4: Emote Fragment Rendering Status

**Decision**: Both Twitch and YouTube connectors already parse emotes into the `fragments` array. No connector changes needed (except fixing a Twitch CDN URL typo).

**Rationale**: 
- **Twitch** (`connectors/twitch/src/parser.ts` L82-128): Already parses the `emotes` IRC tag, builds `EmoteFragment` objects with URLs from `https://static-cdn.jtvnbs.net/emoticons/v2/{id}/default/dark/1.0`. Note: the domain has a typo (`jtvnbs` should be `jtvnw` — `static-cdn.jtvnw.net`). This is a bug fix.
- **YouTube** (`connectors/youtube/src/parser.ts` L34-53): Already parses `run.emoji` objects from the YouTube live chat payload, extracting `emojiId`, `image.thumbnails[0].url`, and `shortcuts[0]` as alt text.

The overlay's `ChatMessage.tsx` currently renders only `message.text` and ignores `message.fragments`. The rendering work is purely UI-side.

**Alternatives considered**: N/A — connectors already do the work.

---

### R5: Real-Time Statistics Tracking

**Decision**: Track statistics in-memory on the server side using lightweight counters. Broadcast stats snapshots to dashboard clients every 2 seconds via WebSocket. Stats are reset on server restart or via a manual "Reset Stats" command.

**Rationale**: Statistics must reflect all messages across all connected clients (not just one browser tab). Server-side tracking is the single source of truth. A 2-second broadcast interval balances real-time feel with minimal overhead.

**Data tracked per platform**:
- `totalMessages: number` — incremented on each `chat_message` event
- `uniqueChatters: Set<string>` — author IDs (converted to `count` for broadcast)
- `recentMessages: number[]` — timestamp array for messages-per-minute calculation (sliding 60-second window)

**Alternatives considered**:
- **Client-side tracking**: Each browser tab would track independently, causing inconsistent numbers. Rejected.
- **Third-party metrics library**: Unnecessary complexity for simple counters.

---

### R6: Font Customization Approach

**Decision**: The dashboard sends font settings (family, size, weight) as a `settings_update` WebSocket event. The overlay applies these as CSS custom properties (`--msg-font`, `--msg-text-size`, etc.) on the `[data-theme]` container. Font families are web-safe fonts + Google Fonts already loaded in `index.css`.

**Rationale**: CSS custom properties are already the foundation of the overlay's theming system (see `index.css` `:root` block). Adding dynamic font overrides via the same mechanism is consistent and zero-cost. Google Fonts are loaded in a single existing `@import` statement.

**Available fonts** (already loaded or web-safe):
- Inter (already loaded)
- Press Start 2P (already loaded, retro theme)
- Fira Code (already loaded, terminal theme)
- Bangers (already loaded, comic theme)
- System UI / -apple-system / sans-serif (web-safe)
- Roboto, Outfit, Montserrat (can add to Google Fonts import)

**Alternatives considered**:
- **Inline style injection**: Less maintainable, conflicts with CSS specificity. Rejected.
- **Dynamic CSS stylesheet**: More complex, harder to debug. Rejected.

