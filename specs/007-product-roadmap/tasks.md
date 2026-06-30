# Tasks: StreamChats Product Roadmap

**Input**: Design documents from `specs/007-product-roadmap/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks where manual verification requires specific setup. Automated tests are prioritized for the Event Bus and core moderation logic as per the spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for new packages and apps

- [ ] T001 Create new packages `event-bus`, `identity`, `analytics`, `plugin-sdk`, `obs-integration` under `packages/` with `package.json` and `tsconfig.json`
- [ ] T002 Create new CLI workspace `streamchats-cli` under `tools/` with `package.json` and `tsconfig.json`
- [ ] T003 Create new Tauri app `desktop` under `apps/` using `@tauri-apps/api`
- [ ] T004 Run `npm install` from repository root to link workspaces
- [ ] T005 Create empty `src/` directories and `index.ts` entry points for all new packages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Install `better-sqlite3` and `zod` in `packages/event-bus`
- [ ] T007 Implement SQLite `store.ts` with WAL mode and tables: `events`, `sessions`, `stream_markers`, `viewer_identities`, `platform_accounts`, `reputation_entries` in `packages/event-bus/src/store.ts`
- [ ] T008 Implement `EventBus` class (publish, subscribe, replay from offset) in `packages/event-bus/src/index.ts`
- [ ] T009 Implement `StreamSession` lifecycle management (start, end, rotate after 14 days, check 80% capacity) in `packages/event-bus/src/session.ts`
- [ ] T010 [P] Update `packages/event-schema/src/index.ts` to include expanded types: `GiftEvent`, `FollowEvent`, `RaidEvent`, `SuperChatEvent`, `StreamEvent` base with `sequenceNumber` and `moderationStatus`
- [ ] T011 [P] Update `packages/event-schema/src/index.ts` to include WS Protocol v2 command types
- [ ] T012 Add Event Bus integration tests verifying at-least-once delivery and offset tracking in `packages/event-bus/tests/event-bus.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Resilient Multi-Platform Chat Aggregation (Priority: P1) 🎯 MVP

**Goal**: Connectors survive individual platform failures via circuit breakers, emit expanded event types (gift/follow/raid/superchat), and route all events through the Event Bus

**Independent Test**: Simulate a connector failure (disconnect one platform mid-stream) and verify remaining platforms continue. Trigger gift/follow/raid events on test channels and verify they appear as normalized events.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Add circuit breaker state machine (`closed`, `open`, `half-open`) with configurable failure threshold and exponential backoff to `BaseConnector` in `packages/connector-sdk/src/index.ts`
- [ ] T014 [P] [US1] Add health check protocol (`getHealth()` returning `connected`, `reconnecting`, `disconnected`, `error`) to `BaseConnector` in `packages/connector-sdk/src/index.ts`
- [ ] T015 [US1] Add generic `dispatchEvent(event: StreamEvent)` method alongside existing `dispatchMessage()` in `packages/connector-sdk/src/index.ts`
- [ ] T016 [US1] Implement `ConnectorSupervisor` class managing connector lifecycle, health monitoring, and coordinated backoff in `packages/connector-sdk/src/supervisor.ts`
- [ ] T017 [P] [US1] Update Twitch parser to emit `GiftEvent`, `RaidEvent`, `FollowEvent` via `dispatchEvent()` in `connectors/twitch/src/parser.ts`
- [ ] T018 [P] [US1] Update YouTube parser to emit `SuperChatEvent`, `FollowEvent` via `dispatchEvent()` in `connectors/youtube/src/parser.ts`
- [ ] T019 [P] [US1] Update Kick parser to emit `GiftEvent`, `FollowEvent` via `dispatchEvent()` in `connectors/kick/src/parser.ts`
- [ ] T020 [P] [US1] Update TikTok parser to emit `GiftEvent`, `FollowEvent` via `dispatchEvent()` in `connectors/tiktok/src/parser.ts`
- [ ] T021 [US1] Replace direct `EventEmitter` pipeline with Event Bus integration in `apps/local-server/src/index.ts` — connectors publish to Event Bus, consumers subscribe
- [ ] T022 [US1] Add session management (start session on server boot, end on graceful shutdown, detect crashed sessions on startup) in `apps/local-server/src/index.ts`
- [ ] T023 [US1] Add `ConnectorSupervisor` initialization and health status broadcasting via WS `status_update` in `apps/local-server/src/server.ts`
- [ ] T024 [US1] Add `stream_event` broadcast (v2 protocol) as an Event Bus consumer alongside existing v1 `chat_message` for backward compatibility in `apps/local-server/src/server.ts`
- [ ] T025 [US1] Update `useChatFeed.ts` hook to handle `stream_event` (v2 protocol) with `sequenceNumber` and `moderationStatus` in `apps/overlay-ui/src/hooks/useChatFeed.ts`

**Checkpoint**: US1 complete — multi-platform chat aggregation with circuit breakers and expanded events operational

---

## Phase 4: User Story 2 — Streamer Dashboard & OBS Control (Priority: P1)

**Goal**: Dashboard supports view modes, stream markers, theme editor with live preview, manual database backups, and changes propagate to OBS within 2 seconds. Note: outbound replies are deferred.

**Independent Test**: Open the dashboard, connect to at least one platform, send test messages, confirm overlay changes propagate to OBS, and perform a manual DB backup.

### Implementation for User Story 2

- [ ] T026 [P] [US2] Implement WS v2 command handlers for `place_marker`, `switch_view_mode`, `backup_database`, `restore_database` in `apps/local-server/src/server.ts`
- [ ] T027 [P] [US2] Add manual SQLite database backup/restore logic (file copy) triggered by WS commands in `apps/local-server/src/server.ts`
- [ ] T028 [P] [US2] Add stream marker persistence (write to `stream_markers` table via Event Bus store) in `apps/local-server/src/server.ts`
- [ ] T029 [US2] Add identity config, analytics config, and plugin config sections to `apps/local-server/src/config.ts`
- [ ] T030 [US2] Implement `ChatControls.tsx` view mode switcher component (Unified, Split, Priority, Moderator) in `apps/overlay-ui/src/components/ChatControls.tsx`
- [ ] T031 [US2] Update `ChatFeed.tsx` to support view mode filtering (Unified merges all, Split groups by platform, Priority weighted, Moderator shows full inline actions) in `apps/overlay-ui/src/components/ChatFeed.tsx`
- [ ] T032 [P] [US2] Update `ChatMessage.tsx` to remove any reply buttons (since reply-to-platform is deferred) and add identity/reputation indicators in `apps/overlay-ui/src/components/ChatMessage.tsx`
- [ ] T033 [P] [US2] Implement `MarkerTimeline.tsx` stream marker visualization component in `apps/overlay-ui/src/components/MarkerTimeline.tsx`
- [ ] T034 [US2] Implement `ThemeEditor.tsx` visual theme editor with live preview (colors, fonts, animations, border-radius) per ThemeConfiguration entity in `apps/overlay-ui/src/components/ThemeEditor.tsx`
- [ ] T035 [US2] Implement manual DB Backup and Restore buttons in `apps/overlay-ui/src/components/SettingsPanel.tsx`
- [ ] T036 [US2] Update `Dashboard.tsx` to include the new Theme Editor, Marker Timeline, and Settings Panel in the sidebar in `apps/overlay-ui/src/components/Dashboard.tsx`
- [ ] T037 [US2] Integrate `obs-websocket-js` in `packages/obs-integration/src/index.ts` and automatically update Browser Source URL/dimensions when theme changes

**Checkpoint**: US2 complete — dashboard UX enhanced with view modes, theme editing, and manual backup.

---

## Phase 5: User Story 3 — Cross-Platform Identity & Local Moderation (Priority: P2)

**Goal**: Shadow suppression hides toxic messages from overlay without platform deletion, raid detection auto-collapses spam, cross-platform identity linking with reputation scoring, AI toxicity model downloads on demand

**Independent Test**: Send test messages through the moderation pipeline with known toxic content and verify suppression (after downloading model). Flood messages rapidly to test raid detection. Link two viewer accounts and verify unified identity badge.

### Implementation for User Story 3

- [ ] T038 [US3] Add shadow suppression mode (`suppress` action hides from overlay, preserves on platform) to moderation pipeline in `packages/moderation-pipeline/src/index.ts`
- [ ] T039 [US3] Implement rate limiter with raid detection (50+ identical messages within 5s triggers auto-collapse with "x50" summary) in `packages/moderation-pipeline/src/handlers/rate-limiter.ts`
- [ ] T040 [US3] Implement shadow suppression handler (mark messages as `suppressed` in moderationStatus, emit moderation event to Event Bus) in `packages/moderation-pipeline/src/handlers/shadow-suppress.ts`
- [ ] T041 [US3] Implement ONNX-based toxicity scoring using quantized MiniLMv2 model via `onnxruntime-node` with `@xenova/transformers` tokenization in `packages/moderation-pipeline/src/filters/toxicity.ts`. Implement download-on-demand logic and progress event broadcasting.
- [ ] T042 [US3] Create SQLite tables for `viewer_identities`, `platform_accounts`, `reputation_entries` in identity package store (reuse Event Bus SQLite connection) in `packages/identity/src/index.ts`
- [ ] T043 [US3] Implement `ViewerIdentity` CRUD and `PlatformAccount` linking API in `packages/identity/src/index.ts`
- [ ] T044 [US3] Implement weighted composite reputation score computation (positive: messages, gifts, watch_time, engagement; negative: mod_actions, spam_flags) in `packages/identity/src/reputation.ts`
- [ ] T045 [US3] Implement fuzzy-match identity suggestions using Levenshtein distance and simultaneous activity detection in `packages/identity/src/suggestions.ts`
- [ ] T046 [US3] Add WS v2 command handlers for `link_identity` and `update_reputation_weights` in `apps/local-server/src/server.ts`
- [ ] T047 [US3] Implement `IdentityPanel.tsx` viewer identity management UI (link accounts, view reputation, resolve conflicts) in `apps/overlay-ui/src/components/IdentityPanel.tsx`
- [ ] T048 [US3] Implement UI to enable toxicity filtering and display download progress in `apps/overlay-ui/src/components/ModerationSettings.tsx`
- [ ] T049 [US3] Implement `useIdentity.ts` hook for identity management state (CRUD, linking, reputation display) in `apps/overlay-ui/src/hooks/useIdentity.ts`
- [ ] T050 [US3] Update `ChatFeed.tsx` to apply shadow-suppressed styling (hidden in overlay, visible in moderator view mode) in `apps/overlay-ui/src/components/ChatFeed.tsx`
- [ ] T051 [US3] Add route for Identity Panel and Moderation Settings in `apps/overlay-ui/src/App.tsx` and `apps/overlay-ui/src/components/Dashboard.tsx`

**Checkpoint**: US3 complete — moderation pipeline with shadow suppression, raid detection, on-demand toxicity scoring, and identity linking operational

---

## Phase 6: User Story 4 — Session Recording, Analytics & Export (Priority: P2)

**Goal**: Post-stream analytics generated entirely offline (messages/min, platform share, top chatters, peak engagement), CSV/log export, session replay

**Independent Test**: Run a mock session with generated events. End the session and verify analytics report generates within 30s. Export CSV and verify data formatting.

### Implementation for User Story 4

- [ ] T052 [P] [US4] Implement SQLite aggregations for session stats (messages/min, unique chatters, platform share) in `packages/analytics/src/index.ts`
- [ ] T053 [P] [US4] Implement post-stream report generator calculating peak engagement windows based on rolling 1-minute averages in `packages/analytics/src/reports.ts`
- [ ] T054 [P] [US4] Implement CSV and timestamped log export utilities reading from `events` table in `packages/analytics/src/export.ts`
- [ ] T055 [US4] Add WS v2 command handlers for `get_analytics`, `export_csv`, `fetch_session_replay` in `apps/local-server/src/server.ts`
- [ ] T056 [US4] Implement `AnalyticsPanel.tsx` displaying charts/graphs (using Recharts or Chart.js) and summary metrics in `apps/overlay-ui/src/components/AnalyticsPanel.tsx`
- [ ] T057 [US4] Implement `SessionReplay.tsx` chat player allowing timeline scrubbing and synchronized marker display in `apps/overlay-ui/src/components/SessionReplay.tsx`
- [ ] T058 [US4] Implement `useAnalytics.ts` hook for fetching reports and handling export downloads in `apps/overlay-ui/src/hooks/useAnalytics.ts`

**Checkpoint**: US4 complete — analytics and session replay operational

---

## Phase 7: User Story 5 — Sandboxed Plugin Ecosystem (Priority: P3)

**Goal**: Plugin SDK using `isolated-vm` with capability-based permissions, manifest validation, and local marketplace

**Independent Test**: Create a test plugin requesting `network` capability. Install it, verify capability prompt, approve it. Create another plugin attempting unauthorized filesystem access and verify `isolated-vm` blocks it.

### Implementation for User Story 5

- [ ] T059 [US5] Install `isolated-vm` in `packages/plugin-sdk`
- [ ] T060 [US5] Implement `sandbox.ts` wrapping `isolated-vm` isolate creation, script compilation, and 128MB memory limit enforcement in `packages/plugin-sdk/src/sandbox.ts`
- [ ] T061 [US5] Implement capability injection (e.g., exposing specific `fetch` or `fs.readFile` bindings only if capability is granted) in `packages/plugin-sdk/src/sandbox.ts`
- [ ] T062 [P] [US5] Implement `manifest.ts` parser validating `plugin.json` schema (capabilities, entrypoint, version) in `packages/plugin-sdk/src/manifest.ts`
- [ ] T063 [P] [US5] Implement `marketplace.ts` local registry client parsing a static JSON catalog of approved plugins in `packages/plugin-sdk/src/marketplace.ts`
- [ ] T064 [US5] Implement PluginManager class coordinating load, capability approval, activation, and deactivation in `packages/plugin-sdk/src/index.ts`
- [ ] T065 [US5] Wire Plugin SDK into Event Bus — inject Event Bus subscriber binding into sandbox so plugins can receive events in `apps/local-server/src/server.ts`
- [ ] T066 [US5] Add WS v2 commands for `install_plugin`, `uninstall_plugin`, `list_plugins`, `grant_capabilities` in `apps/local-server/src/server.ts`
- [ ] T067 [US5] Implement `PluginManagerPanel.tsx` UI showing installed plugins, marketplace tab, and capability approval modals in `apps/overlay-ui/src/components/PluginManagerPanel.tsx`
- [ ] T068 [US5] Implement `usePlugins.ts` hook for marketplace browsing and install state in `apps/overlay-ui/src/hooks/usePlugins.ts`

**Checkpoint**: US5 complete — Sandboxed Plugin Ecosystem operational

---

## Phase 8: User Story 6 — Developer CLI Toolkit (Priority: P3)

**Goal**: CLI for scaffolding and testing plugins without live platform credentials

**Independent Test**: Run `streamchats-cli create-plugin my-plugin`. Verify boilerplate generated. Run `streamchats-cli simulate --plugin my-plugin` and verify simulated chat events reach the plugin.

### Implementation for User Story 6

- [ ] T069 [US6] Setup `commander` and basic CLI entry point in `tools/streamchats-cli/src/index.ts`
- [ ] T070 [P] [US6] Implement `create-plugin.ts` command copying boilerplate template and generating valid `plugin.json` in `tools/streamchats-cli/src/commands/create-plugin.ts`
- [ ] T071 [P] [US6] Implement `simulate.ts` command that generates synthetic chat events at a configurable rate and publishes them to a local Event Bus instance in `tools/streamchats-cli/src/commands/simulate.ts`
- [ ] T072 [US6] Implement `test.ts` command that runs a plugin inside the `isolated-vm` sandbox and asserts outputs in `tools/streamchats-cli/src/commands/test.ts`
- [ ] T073 [US6] Add npm `bin` mapping in `tools/streamchats-cli/package.json` and build step

**Checkpoint**: US6 complete — Developer CLI Toolkit operational

---

## Phase 9: User Story 7 — Standalone Native Wrapper (Priority: P3)

**Goal**: Tauri-based native desktop application wrapping the server and UI, removing the need for Node.js installation

**Independent Test**: Run `npm run tauri build`. Launch the compiled executable. Verify the local server starts on an open port and the Tauri webview loads the dashboard UI successfully.

### Implementation for User Story 7

- [ ] T074 [US7] Configure `src-tauri/tauri.conf.json` defining the main window (dashboard UI) and setting up the local-server as a sidecar binary in `apps/desktop/src-tauri/tauri.conf.json`
- [ ] T075 [US7] Update `packages/local-server/package.json` to use `pkg` or `esbuild` to compile the server into a standalone binary for the sidecar
- [ ] T076 [US7] Implement Tauri Rust `main.rs` to spawn the local-server sidecar on application launch and terminate it on exit in `apps/desktop/src-tauri/src/main.rs`
- [ ] T077 [US7] Add global hotkey registration in Rust (for stream markers) bypassing the browser context in `apps/desktop/src-tauri/src/main.rs`
- [ ] T078 [US7] Implement system tray icon for background operation (minimizing dashboard without closing server) in `apps/desktop/src-tauri/src/main.rs`
- [ ] T079 [US7] Update build scripts in root `package.json` to coordinate building the UI, compiling the server binary, and running the Tauri build

**Checkpoint**: US7 complete — Tauri wrapper operational

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T080 [P] Comprehensive documentation update (README.md, architecture diagrams)
- [ ] T081 Code cleanup and removal of deprecated v1 EventEmitter paths
- [ ] T082 Run quickstart.md validation to ensure developer onboarding works
- [ ] T083 Final end-to-end manual test of all User Stories in sequence

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)

### Implementation Strategy

#### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

#### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Stories 5, 6, 7 → Test independently → Deploy/Demo
