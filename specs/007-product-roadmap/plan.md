# Implementation Plan: StreamChats Product Roadmap

**Branch**: `007-product-roadmap` | **Date**: 2026-06-30 | **Spec**: [spec.md](file:///c:/Users/basha/Desktop/root/StreamChats/StreamChats/specs/007-product-roadmap/spec.md)

**Input**: Feature specification from `specs/007-product-roadmap/spec.md`

## Summary

Transform StreamChats from a real-time chat overlay into a full-featured streaming platform by implementing: an Event Bus architecture with durable SQLite storage, a Connector Supervisor with circuit breakers, an expanded event schema (gifts/follows/raids/super chats), an enhanced broadcaster dashboard with view modes, cross-platform identity linking with reputation scoring, shadow suppression and AI-powered local moderation, zero-cloud analytics with CSV export, a sandboxed plugin SDK with developer CLI, obs-websocket deep integration, and a Tauri-based native desktop wrapper. All features maintain the local-first principle with no cloud dependencies for core functionality. Note: Outbound reply-to-platform messaging is deferred, and all platforms are read-only.

## Technical Context

**Language/Version**: TypeScript 5.2+ (Node.js 20+ for server, React 18 for UI, Rust for Tauri shell)

**Primary Dependencies**:
- Existing: React 18, Vite 5, react-router-dom, ws, pino, zod
- New: `better-sqlite3` (durable storage), `isolated-vm` (plugin sandbox), `obs-websocket-js` (OBS integration), `onnxruntime-node` + `@xenova/transformers` (local AI moderation), `@tauri-apps/api` (desktop wrapper), `pkg` (Node.js binary packaging)

**Storage**: SQLite via `better-sqlite3` with WAL mode (event log, sessions, identities, analytics), browser localStorage (display preferences), server-side JSON (moderation config). Manual export/import is provided for backup.

**Testing**: Manual verification via browser + OBS Browser Source, unit tests for Event Bus and moderation pipeline, integration tests for connector supervisor.

**Target Platform**: Desktop browser (localhost), OBS Studio Browser Source, native desktop app (Tauri).

**Project Type**: Monorepo web application (npm workspaces) + native desktop wrapper.

**Performance Goals**: Dashboard loads <2s, setting changes reflected in OBS <1s, moderation pipeline <200ms/message, analytics generation <30s for 8-hour sessions, responsive at 500+ msg/min.

**Constraints**: Local-first execution, no external API dependencies for core features, minimal memory footprint for 8+ hour sessions, CPU <3%. AI model is downloaded on first use, not bundled.

**Scale/Scope**: Single local user, 1–4 platform connectors, 50-message display buffer (overlay), unlimited event log (SQLite).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Local-First Execution | ✅ PASS | All new features run locally. SQLite, isolated-vm, onnxruntime-node are all in-process. Cloud sync is explicitly opt-in (P4). |
| II. Stability for Long Sessions | ✅ PASS | SQLite with WAL mode handles concurrent reads/writes safely. Event Bus uses bounded consumer replay. 14-day retention prevents unbounded growth. Plugin sandboxes enforce memory limits (128MB). |
| III. Open-Source Extensibility | ✅ PASS | Plugin SDK with capability-based permissions. Developer CLI for connector testing. Event Bus publish/subscribe is inherently extensible. |
| IV. Branch Strategy | ✅ PASS | Working on feature branch `007-product-roadmap`, will merge to `dev`. Each implementation phase can be further branched. |
| V. Commit Convention | ✅ PASS | All commits follow Conventional Commits, no emojis. |
| Architecture & Performance | ✅ PASS | Event Bus decouples producers from consumers — eliminates direct coupling bottleneck. `better-sqlite3` synchronous API avoids async overhead. Worker thread for write batching prevents main-thread blocking. |
| Security & Moderation | ✅ PASS | Plugin sandbox via `isolated-vm` (true V8 isolate). Capability-based permission model with user approval. Shadow suppression keeps moderation local. AI toxicity model runs in-process (no cloud). |

## Project Structure

### Documentation (this feature)

```text
specs/007-product-roadmap/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output — technology decisions
├── data-model.md        # Phase 1 output — entity definitions
├── quickstart.md        # Phase 1 output — development guide
├── contracts/
│   ├── event-bus.md     # Event Bus producer/consumer contract
│   ├── websocket-protocol-v2.md  # Extended WS command protocol
│   └── plugin-sdk.md   # Plugin SDK & sandbox contract
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
packages/
├── event-schema/src/
│   └── index.ts                 # [MODIFY] Add GiftEvent, FollowEvent, RaidEvent, SuperChatEvent,
│                                #           StreamEvent base with sequenceNumber, WS protocol v2 types
├── connector-sdk/src/
│   ├── index.ts                 # [MODIFY] Add circuit breaker, health check, generic dispatchEvent()
│   └── supervisor.ts            # [NEW] ConnectorSupervisor — manages connector lifecycle, backoff, health
│
├── event-bus/                   # [NEW PACKAGE] @obs-chat/event-bus
│   ├── package.json
│   └── src/
│       ├── index.ts             # EventBus class — persist, dispatch, replay
│       ├── store.ts             # SQLite storage layer (better-sqlite3 + WAL)
│       ├── consumer.ts          # Consumer interface + offset tracking
│       └── session.ts           # StreamSession lifecycle management
│
├── moderation-pipeline/src/
│   ├── index.ts                 # [MODIFY] Add shadow suppression mode, rate limiter
│   ├── filters/
│   │   └── toxicity.ts          # [NEW] ONNX-based toxicity scoring (download on demand)
│   └── handlers/
│       ├── rate-limiter.ts      # [NEW] Raid detection + auto-collapse
│       └── shadow-suppress.ts   # [NEW] Local-only message hiding
│
├── identity/                    # [NEW PACKAGE] @obs-chat/identity
│   ├── package.json
│   └── src/
│       ├── index.ts             # ViewerIdentity CRUD, linking API
│       ├── reputation.ts        # Weighted composite score computation
│       └── suggestions.ts       # Fuzzy-match identity suggestions
│
├── analytics/                   # [NEW PACKAGE] @obs-chat/analytics
│   ├── package.json
│   └── src/
│       ├── index.ts             # Analytics engine — query SQLite for metrics
│       ├── reports.ts           # Post-stream report generation
│       └── export.ts            # CSV and timestamped log export
│
├── plugin-sdk/                  # [NEW PACKAGE] @obs-chat/plugin-sdk
│   ├── package.json
│   └── src/
│       ├── index.ts             # Plugin manager — load, activate, deactivate
│       ├── sandbox.ts           # isolated-vm wrapper + capability injection
│       ├── manifest.ts          # Manifest parser + validation
│       └── marketplace.ts       # Local registry client
│
└── obs-integration/             # [NEW PACKAGE] @obs-chat/obs-integration
    ├── package.json
    └── src/
        ├── index.ts             # OBS WebSocket client wrapper
        ├── sources.ts           # Browser source auto-creation
        └── scenes.ts            # Scene switching triggers

apps/
├── local-server/src/
│   ├── index.ts                 # [MODIFY] Replace EventEmitter with Event Bus, add session mgmt
│   ├── server.ts                # [MODIFY] Add WS protocol v2 commands (marker, identity, backup, etc.)
│   ├── config.ts                # [MODIFY] Add identity config, analytics config, plugin config
│   └── utils/
│       └── logger.ts            # Existing (no changes)
│
├── overlay-ui/src/
│   ├── main.tsx                 # Existing (no changes)
│   ├── App.tsx                  # [MODIFY] Add new routes for analytics, identity, plugins
│   ├── index.css                # [MODIFY] Add styles for new dashboard panels, view modes
│   ├── components/
│   │   ├── ChatFeed.tsx         # [MODIFY] Support view modes, shadow-suppressed styling
│   │   ├── ChatMessage.tsx      # [MODIFY] Add identity badge, reputation indicator (no reply button)
│   │   ├── Dashboard.tsx        # [MODIFY] Add sidebar entries for new panels
│   │   ├── ChatControls.tsx     # [MODIFY] Add view mode switcher
│   │   ├── AnalyticsPanel.tsx   # [NEW] Post-stream analytics display
│   │   ├── IdentityPanel.tsx    # [NEW] Viewer identity management
│   │   ├── PluginManager.tsx    # [NEW] Plugin install/manage UI
│   │   ├── ThemeEditor.tsx      # [NEW] Visual theme editor with live preview
│   │   ├── MarkerTimeline.tsx   # [NEW] Stream marker visualization
│   │   ├── SessionReplay.tsx    # [NEW] Chat replay player
│   │   └── SettingsPanel.tsx    # [MODIFY] Add manual DB backup/restore buttons
│   └── hooks/
│       ├── useChatFeed.ts       # [MODIFY] Handle stream_event (v2), view mode filtering
│       ├── useSettings.ts       # Existing (no changes)
│       ├── useAnalytics.ts      # [NEW] Analytics data fetching
│       ├── useIdentity.ts       # [NEW] Identity management state
│       └── usePlugins.ts        # [NEW] Plugin lifecycle state
│
└── desktop/                     # [NEW APP] Tauri desktop wrapper
    ├── package.json
    ├── src-tauri/
    │   ├── tauri.conf.json      # [NEW] Tauri config with sidecar, window, permissions
    │   ├── Cargo.toml           # [NEW] Rust dependencies
    │   └── src/
    │       └── main.rs          # [NEW] Sidecar lifecycle, global hotkeys, tray
    └── src/
        └── index.html           # [NEW] Webview entry pointing to overlay-ui

connectors/
├── twitch/src/
│   └── parser.ts                # [MODIFY] Emit expanded events (GiftEvent, RaidEvent, FollowEvent)
├── youtube/src/
│   └── parser.ts                # [MODIFY] Emit SuperChatEvent, FollowEvent
├── kick/src/
│   └── parser.ts                # [MODIFY] Emit GiftEvent, FollowEvent
└── tiktok/src/
    └── parser.ts                # [MODIFY] Emit GiftEvent, FollowEvent

tools/
└── streamchats-cli/             # [NEW WORKSPACE]
    ├── package.json
    └── src/
        ├── index.ts             # CLI entry point
        ├── commands/
        │   ├── create-plugin.ts # Plugin scaffolding
        │   ├── simulate.ts      # Connector simulator
        │   └── test.ts          # Plugin test runner
        └── templates/
            └── plugin/          # Plugin boilerplate template
```

**Structure Decision**: The existing monorepo structure is preserved and extended. Six new packages are added under `packages/` (event-bus, identity, analytics, plugin-sdk, obs-integration) following the existing convention. A new `tools/` workspace is added for the CLI. The Tauri desktop wrapper is a new app under `apps/desktop/`. All new packages are registered in the root `package.json` workspaces array. The `ReplyComposer.tsx` component is no longer needed since the reply-to-platform feature is deferred.

## Complexity Tracking

No constitution violations to justify.
