# Research: Platform Chat Connectors (Twitch & YouTube)

**Feature Branch**: `001-platform-connectors`
**Date**: 2026-06-16

## Research Task 1: Twitch Chat Extraction Without Official API

### Decision: Use Twitch IRC WebSocket with anonymous `justinfan` authentication

### Rationale
- Twitch IRC over WebSocket (`wss://irc-ws.chat.twitch.tv:443`) remains functional for **read-only anonymous access** as of 2026.
- Anonymous connections use the `justinfan<random>` nickname pattern — no OAuth token or Client ID required.
- This aligns with the project's core requirement of no official API usage and no rate limits.
- IRC provides a persistent WebSocket connection with real-time push delivery — no polling needed. The "retrieval frequency" concept for Twitch is naturally real-time (messages arrive as they're sent).
- Non-secure (non-SSL) connections were decommissioned in August 2025; **must use `wss://` only**.

### Alternatives Considered
- **EventSub WebSocket**: Twitch's official modern approach. Requires OAuth token and Client ID registration. Rejected because the project explicitly avoids official API dependencies and rate limits.
- **Third-party libraries (tmi.js, dank-twitch-irc)**: No longer actively maintained. Building a lightweight custom WebSocket client is more sustainable for the project.
- **HTTP polling of Twitch chat page**: Unnecessarily complex and fragile compared to the well-documented IRC protocol.

### Technical Details
- **Endpoint**: `wss://irc-ws.chat.twitch.tv:443`
- **Auth**: `PASS oauth:dummy` + `NICK justinfan<random_number>`
- **Capabilities**: Request `twitch.tv/tags twitch.tv/commands` for emote, badge, and color metadata in IRC tags.
- **Message Format**: Standard IRC `PRIVMSG` with Twitch-specific tags for user color, badges, emotes, display name, user ID.
- **Emotes**: Twitch IRC tags include `emotes` field with emote IDs and position ranges. Emote image URLs follow the pattern `https://static-cdn.jtvnbs.net/emoticons/v2/<emote_id>/default/dark/1.0`.
- **Keep-alive**: Twitch sends `PING` messages; client must respond with `PONG` to maintain the connection.

---

## Research Task 2: YouTube Live Chat Extraction via HTTP Scraping

### Decision: Use YouTube's InnerTube API via direct HTTP requests with continuation token polling

### Rationale
- YouTube does not expose a public WebSocket or IRC-like interface for live chat.
- The InnerTube API (`/youtubei/v1/live_chat/get_live_chat`) is the internal JSON API used by YouTube's own frontend. It can be called directly via HTTP POST requests without browser automation.
- This is the lightest approach — no Playwright or browser dependency — aligning with the OBS low-resource constitution principle.
- The `youtubei.js` npm package provides a well-maintained abstraction over InnerTube, but for maximum control and minimal dependency footprint, a custom lightweight HTTP client is preferred.
- Continuation tokens handle pagination/polling naturally — each response includes the next token and a suggested polling interval.

### Alternatives Considered
- **`youtube-chat` npm package**: Outdated, not actively maintained as of 2025. May break with YouTube changes.
- **`youtubei.js` package**: Well-maintained and comprehensive, but is a large dependency that covers far more than live chat. Could be used as a reference implementation.
- **Playwright DOM mutation**: Heavy, requires a full browser context. Rejected per clarification decision — too resource-intensive for OBS environments.
- **YouTube Data API v3**: Official API with strict quota limits (10,000 units/day). Explicitly rejected per project requirements.

### Technical Details
- **Step 1 — Resolve Live Chat**: Fetch the YouTube watch page HTML, extract the `liveChatRenderer` continuation token from the initial page data (embedded in `ytInitialData` JSON).
- **Step 2 — Poll Chat**: POST to `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat` with the continuation token and InnerTube API context headers.
- **Step 3 — Parse Response**: Extract `liveChatTextMessageRenderer` actions from the response JSON. Each contains author name, author channel ID, message runs (text + emoji), badges, and timestamps.
- **Step 4 — Continue**: Use the new continuation token from the response for the next poll. YouTube suggests a polling interval via `timeoutMs` in the response.
- **User-Controlled Frequency**: The user can override the YouTube-suggested interval with their own configured polling interval.
- **Headers Required**: `Content-Type: application/json`, standard browser-like `User-Agent`, `x-youtube-client-name`, `x-youtube-client-version`.
- **No Auth Required**: Public live stream chats are accessible without authentication.

---

## Research Task 3: WebSocket Client Best Practices for Node.js

### Decision: Use the `ws` npm package for Twitch WebSocket connections

### Rationale
- `ws` is the de facto standard WebSocket client/server for Node.js — lightweight, well-maintained, and has zero dependencies.
- Already widely used in the Node.js ecosystem and doesn't add significant bundle size.
- Provides clean event-based API that maps naturally to the BaseConnector's EventEmitter pattern.

### Alternatives Considered
- **Native `WebSocket` (Node.js 21+)**: Available but may have compatibility concerns across Node versions. `ws` provides better stability.
- **`socket.io-client`**: Overkill for raw WebSocket — adds unnecessary protocol overhead.

---

## Research Task 4: Structured Logging for Node.js

### Decision: Use `pino` for structured file logging

### Rationale
- `pino` is the fastest structured JSON logger for Node.js — critical for the OBS low-resource environment.
- Supports configurable log levels (trace, debug, info, warn, error, fatal).
- Supports file transport via `pino/file` destination — no additional transport packages needed for basic file output.
- JSON-structured output enables programmatic log analysis.
- Minimal overhead compared to alternatives like `winston`.

### Alternatives Considered
- **`winston`**: More feature-rich but significantly heavier. Unnecessary for this use case.
- **Custom console logger**: Too basic — doesn't support file output or structured format without significant custom work.
- **`bunyan`**: Largely unmaintained, superseded by pino.

---

## Research Task 5: URL Parsing and Input Resolution

### Decision: Custom URL parser per platform using native Node.js `URL` class

### Rationale
- Each platform has a small, finite set of URL patterns. A custom parser is simpler and more maintainable than a generic URL routing library.
- Twitch patterns: `https://twitch.tv/<channel>`, `https://www.twitch.tv/<channel>`, or bare `<channel>`.
- YouTube patterns: `https://youtube.com/watch?v=<id>`, `https://youtu.be/<id>`, `https://youtube.com/@<handle>`, or bare `@<handle>`.
- Node.js `URL` class handles all edge cases (query params, fragments, protocol normalization).

### Alternatives Considered
- **Third-party URL routing libraries**: Unnecessary complexity for a fixed set of patterns.
