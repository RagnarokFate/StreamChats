# Project Handoff & Known Issues

This document serves as a workspace summary and handoff guide for future AI agents to understand the current state of the `obs-chat-aggregator` project.

## Current State & Architecture
The project is a monorepo containing a real-time chat aggregation engine designed to be loaded directly into OBS Studio. 

### Core Components (Completed & Functional)
1. **`@obs-chat/connector-sdk`**: The base framework for building platform connectors.
2. **`@obs-chat/connector-twitch`**: Fully functional. Connects to Twitch IRC via WebSockets, extracts chat, and normalizes it to the standard schema.
3. **`@obs-chat/moderation-pipeline`**: Parses events, censors banned words, and manages the chat history buffer.
4. **`@obs-chat/overlay-ui`**: A React/Vite frontend that renders the transparent chat bubbles.
5. **`@obs-chat/local-server`**: A Node.js backend that:
   - Hosts the WebSocket server (`ws://localhost:9090`) to broadcast chat events.
   - Hosts the HTTP server (`http://localhost:9090`) to serve the compiled static `overlay-ui`.
   - Parses CLI arguments (`--twitch` and `--youtube`) to dynamically load connectors.
6. **`plugins/obs/obs-chat-aggregator.lua`**: The native OBS plugin. It adds a UI panel in OBS to configure channels, and spawns the `local-server` Node.js process silently in the background when loaded.

---

## Known Bugs & Pending Tasks (To Be Solved Next)

### 1. YouTube Connector Chat Parsing Bug
**Context**: The `@obs-chat/connector-youtube` successfully fetches the initial data token and begins polling the YouTube Live Chat API (`get_live_chat`) without throwing HTTP errors.
**Issue**: YouTube comments are **not** displaying in the UI. The issue lies within `connectors/youtube/src/parser.ts` or the way the payload is handled in `api.ts`. The API is returning the `actions` array, but the parser is failing to correctly identify or extract the individual chat messages from YouTube's complex JSON structure. 
**Next Step**: Inspect a raw JSON payload from the `get_live_chat` endpoint and update `parser.ts` to correctly match the `addChatItemAction` paths.

### 2. OBS Lua Script Performance (UI Lag)
**Context**: The `obs-chat-aggregator.lua` script uses `script_update(settings)` to detect when the user types in their channel names in the OBS properties panel.
**Issue**: OBS triggers `script_update` on *every single keystroke*. Currently, `script_update` calls `stop_server()` and `start_server()`. This means typing a 10-letter channel name kills and respawns the Node.js process 10 times in one second, causing massive CPU spikes and OBS UI lag.
**Next Step**: Remove the auto-restart logic from `script_update()`. Instead, use `obs.obs_properties_add_button` to create a dedicated "Connect / Apply" button in the OBS UI. Only execute `start_server()` when the user explicitly clicks that button.

### 3. Future Platform Integrations
**Context**: The architecture is designed to be highly modular.
**Issue**: The user wants to support **Kick** and **TikTok** live streams in the future.
**Next Step**: Create `@obs-chat/connector-kick` and `@obs-chat/connector-tiktok` using the existing `BaseConnector` SDK, then add them to the `local-server` CLI parser. No changes to the UI or OBS plugin will be necessary.
