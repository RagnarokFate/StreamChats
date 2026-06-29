# Tasks: StreamChats Product Roadmap

**Input**: Design documents from `specs/007-product-roadmap/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, new workspace packages, and shared tooling

- [ ] T001 Register new workspace packages in root package.json workspaces array (`packages/event-bus`, `packages/identity`, `packages/analytics`, `packages/plugin-sdk`, `packages/obs-integration`, `tools/streamchats-cli`)
- [ ] T002 [P] Initialize `packages/event-bus/` package with package.json, tsconfig.json, and `better-sqlite3` + `@obs-chat/event-schema` dependencies
- [ ] T003 [P] Initialize `packages/identity/` package with package.json, tsconfig.json, and `@obs-chat/event-schema` dependency
- [ ] T004 [P] Initialize `packages/analytics/` package with package.json, tsconfig.json, and `@obs-chat/event-bus` dependency
- [ ] T005 [P] Initialize `packages/plugin-sdk/` package with package.json, tsconfig.json, and `isolated-vm` + `@obs-chat/event-bus` dependencies
- [ ] T006 [P] Initialize `packages/obs-integration/` package with package.json, tsconfig.json, and `obs-websocket-js` dependency
- [ ] T007 [P] Initialize `tools/streamchats-cli/` package with package.json, tsconfig.json, and CLI entry point in `tools/streamchats-cli/src/index.ts`
- [ ] T008 Run `npm install` to validate workspace resolution and ensure all new packages build cleanly

**Checkpoint**: All new workspace packages scaffolded and npm install succeeds.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Event Schema Expansion

- [ ] T009 [P] Add `StreamEvent` base schema with `sequenceNumber` (integer) and `sessionId` (UUID) fields extending `BaseEventSchema` in `packages/event-schema/src/index.ts`
- [ ] T010 [P] Add `GiftEvent` schema (sender, giftType, giftCount, monetaryValue) extending `BaseEventSchema` in `packages/event-schema/src/index.ts`
- [ ] T011 [P] Add `FollowEvent` schema (follower id/name) extending `BaseEventSchema` in `packages/event-schema/src/index.ts`
- [ ] T012 [P] Add `RaidEvent` schema (raider id/name, viewerCount) extending `BaseEventSchema` in `packages/event-schema/src/index.ts`
- [ ] T013 [P] Add `SuperChatEvent` schema (sender, amount, currency, message, tier) extending `BaseEventSchema` in `packages/event-schema/src/index.ts`
- [ ] T014 Add discriminated union `StreamEventSchema` combining all event subtypes with `moderationStatus` and `toxicityScore` fields in `packages/event-schema/src/index.ts`
- [ ] T015 Add WebSocket protocol v2 command schemas (`reply_message`, `place_marker`, `switch_view_mode`, `link_identity`, `update_reputation_weights`, `export_session`, `manage_plugin`) in `packages/event-schema/src/index.ts`
- [ ] T016 Add WebSocket protocol v2 server event schemas (`stream_event`, `reply_status`, `analytics_report`, `export_ready`, `plugin_status`, `identity_update`) in `packages/event-schema/src/index.ts`

### Event Bus Core

- [ ] T017 Implement SQLite storage layer with WAL mode, table creation (stream_events, stream_sessions, consumer_offsets), and CRUD operations in `packages/event-bus/src/store.ts`
- [ ] T018 Implement `StreamSession` lifecycle manager (create session, end session, detect crashed sessions on startup) in `packages/event-bus/src/session.ts`
- [ ] T019 Implement `EventBusConsumer` interface and offset tracking (getOffset, setOffset) in `packages/event-bus/src/consumer.ts`
- [ ] T020 Implement `EventBus` class with `publish()` (persist-then-dispatch), consumer registration, replay from offset, and at-least-once delivery in `packages/event-bus/src/index.ts`

### Connector Supervisor

- [ ] T021 Add circuit breaker pattern (open/half-open/closed states) to `BaseConnector` in `packages/connector-sdk/src/index.ts`
- [ ] T022 Add health check protocol (`getHealth()` returning latency, last event time, error rate) to `BaseConnector` in `packages/connector-sdk/src/index.ts`
- [ ] T023 Implement `ConnectorSupervisor` class managing multiple connectors with independent failure isolation, health monitoring, and configurable backoff in `packages/connector-sdk/src/supervisor.ts`
- [ ] T024 Add generic `dispatchEvent(event: StreamEvent)` method alongside existing `dispatchMessage()` for backward compatibility in `packages/connector-sdk/src/index.ts`

### Server Integration

- [ ] T025 Replace direct `EventEmitter` pipeline with Event Bus in `apps/local-server/src/index.ts` — connectors publish to Event Bus, overlay/dashboard consume from it
- [ ] T026 Add session management (auto-start on first connector connect, end on graceful shutdown, crash detection on startup) in `apps/local-server/src/index.ts`
- [ ] T027 Expand WebSocket command handler with v2 commands (reply_message, place_marker, switch_view_mode, link_identity, export_session, manage_plugin) in `apps/local-server/src/server.ts`
- [ ] T028 Add protocol version negotiation on WebSocket handshake — v1 clients receive `chat_message`, v2 clients receive `stream_event` in `apps/local-server/src/server.ts`

**Checkpoint**: Foundation ready — Event Bus persists and replays events, connectors use circuit breakers, server handles v2 protocol. User story implementation can now begin.

---

## Phase 3: User Story 1 — Resilient Multi-Platform Chat Aggregation (Priority: P1) 🎯 MVP

**Goal**: All platform connectors route events through Event Bus with circuit breakers. Expanded events (gifts, follows, raids) are normalized and delivered to all consumers. Single connector failure does not affect others.

**Independent Test**: Simulate a connector failure by disconnecting a platform mid-stream. Verify remaining platforms continue uninterrupted. Trigger gift/follow/raid events on test channels and verify they arrive at the overlay.

### Implementation for User Story 1

- [ ] T029 [P] [US1] Update Twitch connector to emit `GiftEvent` (sub gifts), `RaidEvent`, and `FollowEvent` via `dispatchEvent()` in `connectors/twitch/src/parser.ts`
- [ ] T030 [P] [US1] Update YouTube connector to emit `SuperChatEvent` and `FollowEvent` via `dispatchEvent()` in `connectors/youtube/src/parser.ts`
- [ ] T031 [P] [US1] Update Kick connector to emit `GiftEvent` and `FollowEvent` via `dispatchEvent()` in `connectors/kick/src/parser.ts`
- [ ] T032 [P] [US1] Update TikTok connector to emit `GiftEvent` and `FollowEvent` via `dispatchEvent()` in `connectors/tiktok/src/parser.ts`
- [ ] T033 [US1] Integrate `ConnectorSupervisor` into `apps/local-server/src/index.ts` — replace manual connector setup with supervised startup, failure isolation, and automatic reconnection
- [ ] T034 [US1] Add overlay consumer to Event Bus that broadcasts `stream_event` (v2) and `chat_message` (v1 backward compat) to WebSocket clients in `apps/local-server/src/index.ts`
- [ ] T035 [US1] Update `useChatFeed.ts` hook to handle `stream_event` wrapper alongside legacy `chat_message` in `apps/overlay-ui/src/hooks/useChatFeed.ts`
- [ ] T036 [US1] Add expanded event rendering (gift, follow, raid, superchat indicators) to `ChatMessage.tsx` in `apps/overlay-ui/src/components/ChatMessage.tsx`
- [ ] T037 [US1] Add connector health status indicators (connected, reconnecting, error) to `PlatformHealth.tsx` in `apps/overlay-ui/src/components/PlatformHealth.tsx`
- [ ] T038 [US1] Validate end-to-end flow: connector → normalizer → Event Bus → SQLite persist → WebSocket broadcast → overlay render

**Checkpoint**: User Story 1 complete. All connectors resilient with circuit breakers. Expanded events flow through Event Bus to overlay.

---

## Phase 4: User Story 2 — Streamer Dashboard & OBS Control (Priority: P1)

**Goal**: Dashboard supports view modes, reply-to-platform, stream markers, and theme editor with live preview. OBS overlay reflects changes within 2 seconds.

**Independent Test**: Open dashboard, connect to one platform, send messages, reply via dashboard, verify overlay updates within 2 seconds. Place a stream marker and verify it is logged.

### Implementation for User Story 2

- [ ] T039 [P] [US2] Add view mode switcher component (Unified default, Split, Priority, Moderator) in `apps/overlay-ui/src/components/ChatControls.tsx`
- [ ] T040 [P] [US2] Implement `ReplyComposer` component with platform selector and send button in `apps/overlay-ui/src/components/ReplyComposer.tsx`
- [ ] T041 [P] [US2] Implement `ThemeEditor` component with color pickers, font selectors, animation controls, and live preview iframe in `apps/overlay-ui/src/components/ThemeEditor.tsx`
- [ ] T042 [P] [US2] Implement `MarkerTimeline` component displaying all markers with timestamps and labels in `apps/overlay-ui/src/components/MarkerTimeline.tsx`
- [ ] T043 [US2] Update `ChatFeed.tsx` to support view mode switching — Unified (single feed), Split (per-platform columns), Priority (weighted), Moderator (with action buttons) in `apps/overlay-ui/src/components/ChatFeed.tsx`
- [ ] T044 [US2] Add `reply_message` command handling in server — dispatch reply to the correct connector's platform API in `apps/local-server/src/server.ts`
- [ ] T045 [US2] Add `place_marker` command handling in server — create StreamMarker in SQLite via Event Bus store in `apps/local-server/src/server.ts`
- [ ] T046 [US2] Add reply capability detection per connector — connectors report `supportsOutbound: boolean` in their health check, server returns `reply_status` with `read_only` for unsupported platforms in `apps/local-server/src/server.ts`
- [ ] T047 [US2] Update `Dashboard.tsx` sidebar navigation to include new panels (Theme Editor, Markers) in `apps/overlay-ui/src/components/Dashboard.tsx`
- [ ] T048 [US2] Add dashboard styles for view modes, reply composer, theme editor, and marker timeline in `apps/overlay-ui/src/index.css`
- [ ] T049 [US2] Validate end-to-end: dashboard reply → server → platform, theme change → WebSocket → overlay update <2s

**Checkpoint**: User Story 2 complete. Dashboard is a fully interactive streaming tool with reply, view modes, markers, and theme editing.

---

## Phase 5: User Story 3 — Local-First Moderation & Safety (Priority: P2)

**Goal**: Shadow suppression hides flagged messages from overlay without platform deletion. Raid detection auto-collapses spam. Cross-platform identity linking with weighted reputation scores. All processing local.

**Independent Test**: Send toxic test messages and verify they are suppressed from the overlay but not deleted on the platform. Flood messages rapidly and verify auto-collapse. Link two viewer accounts and verify unified identity badge.

### Implementation for User Story 3

- [ ] T050 [P] [US3] Implement shadow suppression handler — sets `moderationStatus: 'suppressed'` on events without sending any delete command to the platform in `packages/moderation-pipeline/src/handlers/shadow-suppress.ts`
- [ ] T051 [P] [US3] Implement rate limiter / raid detection handler — detect 50+ identical messages within 5 seconds, auto-collapse into summary, trigger alert event in `packages/moderation-pipeline/src/handlers/rate-limiter.ts`
- [ ] T052 [P] [US3] Implement ONNX-based toxicity scoring filter using quantized MiniLMv2 model via `onnxruntime-node` and `@xenova/transformers` in `packages/moderation-pipeline/src/filters/toxicity.ts`
- [ ] T053 [US3] Update `ModerationPipeline` to integrate shadow suppression, rate limiter, and toxicity filter with configurable thresholds and priority ordering in `packages/moderation-pipeline/src/index.ts`
- [ ] T054 [P] [US3] Implement `ViewerIdentity` CRUD operations (create, read, update, delete, list) with SQLite persistence in `packages/identity/src/index.ts`
- [ ] T055 [P] [US3] Implement `PlatformAccount` linking (link, unlink, list by identity) with uniqueness constraint `(platform, platformUserId)` in `packages/identity/src/index.ts`
- [ ] T056 [US3] Implement weighted behavioral composite reputation score computation (positive: messages, gifts, watch_time, engagement; negative: mod_actions, spam_flags) with configurable weights in `packages/identity/src/reputation.ts`
- [ ] T057 [US3] Implement fuzzy-match identity suggestions using Levenshtein distance on usernames and simultaneous activity detection in `packages/identity/src/suggestions.ts`
- [ ] T058 [US3] Add `link_identity` and `update_reputation_weights` command handling in `apps/local-server/src/server.ts`
- [ ] T059 [P] [US3] Implement `IdentityPanel` component with viewer list, link/unlink controls, reputation display, and suggestion cards in `apps/overlay-ui/src/components/IdentityPanel.tsx`
- [ ] T060 [P] [US3] Implement `useIdentity` hook for identity management state (CRUD, linking, suggestions) in `apps/overlay-ui/src/hooks/useIdentity.ts`
- [ ] T061 [US3] Update `ChatMessage.tsx` to display unified identity badge and reputation indicator for linked viewers in `apps/overlay-ui/src/components/ChatMessage.tsx`
- [ ] T062 [US3] Update `ChatFeed.tsx` to visually suppress messages with `moderationStatus: 'suppressed'` and render raid collapse summaries in `apps/overlay-ui/src/components/ChatFeed.tsx`
- [ ] T063 [US3] Add moderation and identity panel entries to `Dashboard.tsx` sidebar in `apps/overlay-ui/src/components/Dashboard.tsx`
- [ ] T064 [US3] Add styles for suppressed messages, raid collapse summaries, identity badges, and reputation indicators in `apps/overlay-ui/src/index.css`
- [ ] T065 [US3] Validate: toxic message → suppressed from overlay but visible on platform, raid flood → auto-collapse, identity link → unified badge

**Checkpoint**: User Story 3 complete. Moderation pipeline runs entirely locally with shadow suppression, raid detection, AI toxicity scoring, and cross-platform identity.

---

## Phase 6: User Story 4 — Session Recording, Analytics & Export (Priority: P2)

**Goal**: Post-stream analytics generated entirely offline from SQLite data. CSV and timestamped log export. Chat replay mapped to stream timeline. Crash recovery from local database.

**Independent Test**: Run a simulated stream, end the session, verify analytics report matches known message volumes. Export CSV and verify data integrity. Simulate a crash and verify recovery resumes from last checkpoint.

### Implementation for User Story 4

- [ ] T066 [P] [US4] Implement analytics query engine — messages per minute over time, platform share breakdown, top chatters by volume, peak engagement windows from SQLite in `packages/analytics/src/index.ts`
- [ ] T067 [P] [US4] Implement post-stream report generator aggregating all analytics metrics for a completed session in `packages/analytics/src/reports.ts`
- [ ] T068 [P] [US4] Implement CSV export for chat logs, moderation actions, and engagement data with configurable columns in `packages/analytics/src/export.ts`
- [ ] T069 [US4] Implement timestamped log export for VOD replay — messages mapped to relative stream time in `packages/analytics/src/export.ts`
- [ ] T070 [US4] Add `export_session` command handling in server — trigger export, generate file, send `export_ready` event with download path in `apps/local-server/src/server.ts`
- [ ] T071 [US4] Add session data retention rotation — delete sessions older than 14 days on startup and hourly, VACUUM to reclaim space, warn at 80% disk capacity in `packages/event-bus/src/session.ts`
- [ ] T072 [P] [US4] Implement `AnalyticsPanel` component displaying post-stream charts (messages/min line chart, platform share pie chart, top chatters table, peak windows) in `apps/overlay-ui/src/components/AnalyticsPanel.tsx`
- [ ] T073 [P] [US4] Implement `SessionReplay` component with timeline scrubber and synced message display in `apps/overlay-ui/src/components/SessionReplay.tsx`
- [ ] T074 [P] [US4] Implement `useAnalytics` hook for fetching analytics data and triggering exports in `apps/overlay-ui/src/hooks/useAnalytics.ts`
- [ ] T075 [US4] Add analytics and replay routes/panels to `App.tsx` and `Dashboard.tsx` in `apps/overlay-ui/src/`
- [ ] T076 [US4] Add styles for analytics charts, session replay timeline, and export UI in `apps/overlay-ui/src/index.css`
- [ ] T077 [US4] Validate: end session → analytics generated <30s, CSV export accurate, crash recovery resumes from last checkpoint

**Checkpoint**: User Story 4 complete. Full analytics suite with export, replay, and crash recovery — all offline.

---

## Phase 7: User Story 5 — Plugin Ecosystem & Developer Tooling (Priority: P3)

**Goal**: Sandboxed Plugin SDK with capability-based permissions. Developer CLI for scaffolding and testing. Local marketplace for discovery and installation.

**Independent Test**: Use CLI to scaffold a plugin, load it via Event Bus, verify it receives events. Attempt file system access from sandbox and verify it is blocked. Install a plugin from marketplace and verify it activates.

### Implementation for User Story 5

- [ ] T078 [P] [US5] Implement plugin manifest parser and validator (id, name, version, capabilities, events, settings) in `packages/plugin-sdk/src/manifest.ts`
- [ ] T079 [P] [US5] Implement `isolated-vm` sandbox wrapper — create V8 isolate, inject approved capability APIs, enforce 128MB memory limit and 5s CPU timeout in `packages/plugin-sdk/src/sandbox.ts`
- [ ] T080 [US5] Implement plugin manager — load, activate, deactivate, uninstall plugins, manage lifecycle state transitions, register as Event Bus consumer in `packages/plugin-sdk/src/index.ts`
- [ ] T081 [US5] Implement local marketplace client — read curated JSON catalog, list available plugins/themes, install/remove from local registry in `packages/plugin-sdk/src/marketplace.ts`
- [ ] T082 [US5] Add `manage_plugin` command handling in server — install, enable, disable, uninstall, send `plugin_status` events in `apps/local-server/src/server.ts`
- [ ] T083 [P] [US5] Implement `create-plugin` CLI command — scaffold plugin boilerplate from template with manifest, entry point, and README in `tools/streamchats-cli/src/commands/create-plugin.ts`
- [ ] T084 [P] [US5] Implement `simulate` CLI command — connector simulator that generates fake events for plugin testing in `tools/streamchats-cli/src/commands/simulate.ts`
- [ ] T085 [P] [US5] Implement `test` CLI command — load a plugin in sandbox, feed simulated events, report results in `tools/streamchats-cli/src/commands/test.ts`
- [ ] T086 [US5] Create plugin boilerplate template directory with example manifest, entry point, and documentation in `tools/streamchats-cli/src/templates/plugin/`
- [ ] T087 [P] [US5] Implement `PluginManager` dashboard component with install/enable/disable controls, capability approval dialog, and status indicators in `apps/overlay-ui/src/components/PluginManager.tsx`
- [ ] T088 [P] [US5] Implement `usePlugins` hook for plugin lifecycle management state in `apps/overlay-ui/src/hooks/usePlugins.ts`
- [ ] T089 [US5] Add plugin management panel to `Dashboard.tsx` sidebar in `apps/overlay-ui/src/components/Dashboard.tsx`
- [ ] T090 [US5] Validate: scaffold plugin via CLI → load in sandbox → receives events → file system access blocked → install from marketplace

**Checkpoint**: User Story 5 complete. Plugin SDK with sandboxed execution, CLI tooling, and local marketplace.

---

## Phase 8: User Story 6 — Native Desktop App & OBS Deep Integration (Priority: P3)

**Goal**: Tauri desktop wrapper eliminates Node.js installation requirement. OBS websocket integration auto-creates browser sources and enables scene switching.

**Independent Test**: Build desktop installer, launch on clean machine (no Node.js), verify platforms connect and OBS browser source is auto-created.

### Implementation for User Story 6

- [ ] T091 [P] [US6] Implement OBS WebSocket client wrapper using `obs-websocket-js` v5 with connect/disconnect/reconnect lifecycle in `packages/obs-integration/src/index.ts`
- [ ] T092 [P] [US6] Implement browser source auto-creation via `CreateInput` and auto-update via `SetInputSettings` in `packages/obs-integration/src/sources.ts`
- [ ] T093 [P] [US6] Implement scene switching triggers — configurable chat activity thresholds that call `SetCurrentProgramScene` in `packages/obs-integration/src/scenes.ts`
- [ ] T094 [US6] Integrate OBS integration package into `apps/local-server/src/index.ts` — auto-connect to OBS on startup if configured, create browser source, report health
- [ ] T095 [P] [US6] Initialize Tauri v2 project in `apps/desktop/` with `tauri.conf.json`, `Cargo.toml`, and webview entry pointing to overlay-ui build
- [ ] T096 [US6] Configure Node.js backend as Tauri sidecar — package `apps/local-server` via `pkg`, register in `bundle.externalBin`, spawn from `main.rs` in `apps/desktop/src-tauri/`
- [ ] T097 [US6] Implement system tray icon, global hotkey binding (stream markers), and window management in `apps/desktop/src-tauri/src/main.rs`
- [ ] T098 [US6] Create build scripts for multi-platform desktop installers (Windows .msi, macOS .dmg, Linux .AppImage) in `apps/desktop/package.json`
- [ ] T099 [US6] Validate: desktop app launches without Node.js, connects to platforms, auto-creates OBS browser source, stable resource usage over 6 hours

**Checkpoint**: User Story 6 complete. Desktop app with OBS deep integration — zero Node.js dependency for end users.

---

## Phase 9: User Story 7 — Premium Features & Monetization (Priority: P4)

**Goal**: Open-core marketplace for premium themes/plugins. Optional cloud sync across devices. Studio Edition foundation for B2B.

**Independent Test**: Simulate multi-device sync with two instances and verify settings propagate within 30 seconds. Browse marketplace and verify purchase flow.

### Implementation for User Story 7

- [ ] T100 [P] [US7] Implement premium theme/plugin catalog with pricing, preview, and purchase flow in marketplace client in `packages/plugin-sdk/src/marketplace.ts`
- [ ] T101 [P] [US7] Implement optional cloud sync client — settings, filters, themes, identity links sync to/from remote API in `packages/cloud-sync/src/index.ts` (new package)
- [ ] T102 [US7] Implement sync conflict resolution — last-write-wins with conflict log for manual review in `packages/cloud-sync/src/conflicts.ts`
- [ ] T103 [US7] Add cloud sync configuration UI to dashboard settings panel in `apps/overlay-ui/src/components/Dashboard.tsx`
- [ ] T104 [US7] Define Studio Edition role-based access control schema — operator roles, permissions, chat feed assignments in `packages/identity/src/roles.ts`
- [ ] T105 [US7] Validate: cloud sync between two instances <30s, marketplace browse/purchase/apply flow, Studio Edition role isolation

**Checkpoint**: User Story 7 complete. Monetization foundations in place.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T106 [P] Update `README.md` with new architecture diagram, expanded feature list, and desktop app installation instructions
- [ ] T107 [P] Add comprehensive error handling and user-friendly error messages across all new packages
- [ ] T108 [P] Performance optimization — profile Event Bus write throughput, optimize SQLite queries for analytics, ensure <200ms moderation latency
- [ ] T109 [P] Security hardening — audit plugin sandbox isolation, validate capability enforcement, review WebSocket command authorization
- [ ] T110 Memory leak audit — run 8-hour simulated session, monitor heap growth, fix any unbounded data structures
- [ ] T111 Update OBS Lua plugin to display expanded connector health and new event types in `plugins/obs/obs-chat-aggregator.lua`
- [ ] T112 Run quickstart.md validation — verify full development workflow from clone to running all features

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (Phase 3) and US2 (Phase 4) are both P1 but US2 depends on Event Bus from US1
  - US3 (Phase 5) and US4 (Phase 6) are both P2 and can run in parallel after US1
  - US5 (Phase 7) and US6 (Phase 8) are both P3 and can run in parallel after US1
  - US7 (Phase 9) is P4 and can start after US5 (marketplace dependency)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **US2 (P1)**: Depends on US1 (requires Event Bus and expanded events for view modes)
- **US3 (P2)**: Depends on US1 (moderation pipeline needs Event Bus) — Can run in parallel with US2
- **US4 (P2)**: Depends on US1 (analytics query Event Bus SQLite) — Can run in parallel with US2, US3
- **US5 (P3)**: Depends on US1 (Plugin SDK consumes from Event Bus) — Can run in parallel with US3, US4
- **US6 (P3)**: Depends on US1 and US2 (desktop wraps full dashboard) — Should follow US2
- **US7 (P4)**: Depends on US5 (marketplace infrastructure) — Should follow US5

### Within Each User Story

- Schema/models before services
- Services before server integration
- Server integration before UI components
- UI components before end-to-end validation
- Story complete before checkpoint

### Parallel Opportunities

- **Phase 1**: All T002–T007 scaffold tasks can run in parallel
- **Phase 2**: T009–T013 (event schemas) can run in parallel; T017–T019 (Event Bus internals) can run in parallel
- **Phase 3**: T029–T032 (connector updates) can run in parallel
- **Phase 4**: T039–T042 (UI components) can run in parallel
- **Phase 5**: T050–T052 (moderation handlers) + T054–T055 (identity CRUD) can run in parallel
- **Phase 6**: T066–T068 (analytics) can run in parallel
- **Phase 7**: T078–T079 (SDK core) + T083–T085 (CLI commands) can run in parallel
- **Phase 8**: T091–T093 (OBS integration) + T095 (Tauri init) can run in parallel
- **US3 + US4 can run in parallel** after US1 completes (different packages, no file conflicts)
- **US5 + US6 can overlap** with US3/US4 (different packages)

---

## Parallel Example: User Story 1

```bash
# Launch all connector updates together (different files):
Task: "T029 Update Twitch connector in connectors/twitch/src/parser.ts"
Task: "T030 Update YouTube connector in connectors/youtube/src/parser.ts"
Task: "T031 Update Kick connector in connectors/kick/src/parser.ts"
Task: "T032 Update TikTok connector in connectors/tiktok/src/parser.ts"
```

## Parallel Example: User Story 3

```bash
# Launch moderation handlers + identity CRUD together (different packages):
Task: "T050 Shadow suppression in packages/moderation-pipeline/src/handlers/"
Task: "T051 Rate limiter in packages/moderation-pipeline/src/handlers/"
Task: "T052 Toxicity filter in packages/moderation-pipeline/src/filters/"
Task: "T054 ViewerIdentity CRUD in packages/identity/src/index.ts"
Task: "T055 PlatformAccount linking in packages/identity/src/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Resilient Multi-Platform Chat)
4. **STOP and VALIDATE**: Test connector failure isolation, expanded events, Event Bus persistence
5. Deploy/demo if ready — this alone is a major architectural upgrade

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Resilient chat with Event Bus → **MVP!**
3. US2 → Full dashboard with reply + theme editor → Demo-ready product
4. US3 + US4 (parallel) → Moderation + Analytics → Professional streamer tool
5. US5 + US6 (parallel) → Plugins + Desktop app → Platform ecosystem
6. US7 → Monetization → Business-ready
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (required first)
3. Once US1 is done:
   - Developer A: User Story 2 (dashboard)
   - Developer B: User Story 3 (moderation)
   - Developer C: User Story 4 (analytics)
4. Once US1+US2 done:
   - Developer A: User Story 6 (desktop + OBS)
   - Developer B: User Story 5 (plugins)
5. Once US5 done:
   - Developer B: User Story 7 (monetization)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group following Conventional Commits (no emojis)
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- The local AI moderation model (T052) requires downloading a ~80MB ONNX model file — this should be a documented setup step
