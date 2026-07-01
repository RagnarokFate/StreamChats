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

### 4. Desktop App: Bundle Node.js Server as Tauri Sidecar
**Context**: The Tauri desktop app (`apps/desktop`) currently spawns the local server via `Command::new("node")` in `src-tauri/src/lib.rs`, which requires Node.js to be installed on the user's machine. This makes the desktop app unusable for non-technical users who don't have Node.js.
**Issue**: The desktop app is not self-contained. Anyone without Node.js in their system PATH will see a crash on launch (`Failed to spawn node backend`). An installer should be sufficient for end users — no prior tooling required.
**Scope**:
  1. **Compile the local server into a standalone binary** using Node.js Single Executable Applications (SEA, built into Node 20+) or `pkg`. The binary must bundle the Node.js runtime, the compiled `dist/index.js`, and all production dependencies into a single executable.
  2. **Register the binary as a Tauri sidecar** by adding `"externalBin": ["binaries/streamchats-server"]` to `tauri.conf.json` under the `bundle` key, and placing platform-specific binaries (suffixed with `-x86_64-pc-windows-msvc`, `-x86_64-unknown-linux-gnu`, `-aarch64-apple-darwin`, etc.) in `src-tauri/binaries/`.
  3. **Update `lib.rs`** to replace `std::process::Command::new("node")` with `tauri::api::process::Command::new_sidecar("streamchats-server")`, using Tauri's managed sidecar lifecycle (proper startup, shutdown on app exit, and stdout/stderr forwarding).
  4. **Add a build script** (`npm run build:sidecar` or similar) that compiles the server binary and copies it to the correct sidecar location before `tauri build`.
  5. **Verify** that `tauri build` produces a platform-native installer (`.msi` / `.dmg` / `.AppImage`) that works on a clean machine without Node.js installed.
**Files to modify**:
  - `apps/desktop/src-tauri/tauri.conf.json` — add `externalBin` config
  - `apps/desktop/src-tauri/src/lib.rs` — switch to sidecar API
  - `apps/local-server/package.json` — add SEA/pkg build script
  - `package.json` (root) — add `build:sidecar` orchestration script
**Next Step**: Choose between Node.js SEA (zero extra dependencies, built into Node 20+) and `pkg` (more mature, broader compatibility), compile the server, register as sidecar, and test a clean install.
