# Quickstart: StreamChats Product Roadmap Development

**Branch**: `007-product-roadmap` | **Date**: 2026-06-27

## Prerequisites

- Node.js v20+
- npm v9+
- OBS Studio v28+ (for obs-websocket v5 testing)
- Git

## Development Order

The roadmap features have strict dependency ordering. Build in this sequence:

### Phase 1 — Foundation (P1)

1. **Event Schema Expansion** (`packages/event-schema`)
   - Add `GiftEvent`, `FollowEvent`, `RaidEvent`, `SuperChatEvent` schemas
   - Add `StreamEvent` base with `sequenceNumber` and `sessionId`
   - Backward-compatible: existing `ChatEvent` unchanged

2. **Event Bus + Local Storage** (`packages/event-bus`)
   - New package: `@obs-chat/event-bus`
   - Depends on: `better-sqlite3`, `@obs-chat/event-schema`
   - Implements: persist-first publish, consumer offsets, replay

3. **Connector Supervisor** (`packages/connector-sdk`)
   - Enhance `BaseConnector` with circuit breaker pattern
   - Add health check protocol, configurable backoff
   - Add `dispatchEvent()` (generic, replaces `dispatchMessage()`)

4. **Server Integration** (`apps/local-server`)
   - Replace direct `EventEmitter` pipeline with Event Bus
   - Add session management (start/end/crash recovery)
   - Expand WebSocket protocol to v2

### Phase 2 — Dashboard & Moderation (P1/P2)

5. **Dashboard Expansion** (`apps/overlay-ui`)
   - Add view modes (Unified default, Split, Priority, Moderator)
   - Add reply-to-platform UI
   - Add stream markers (hotkey binding)
   - Add theme editor with live preview

6. **Moderation Pipeline v2** (`packages/moderation-pipeline`)
   - Shadow suppression mode
   - Rate limiting / raid detection
   - Toxicity scoring integration point (AI model loaded separately)

7. **Identity System** (`packages/identity`)
   - New package: `@obs-chat/identity`
   - ViewerIdentity CRUD, PlatformAccount linking
   - Reputation score computation

### Phase 3 — Analytics & Plugins (P2/P3)

8. **Analytics Engine** (`packages/analytics`)
   - New package: `@obs-chat/analytics`
   - Post-stream report generation from SQLite
   - CSV/log export

9. **Plugin SDK** (`packages/plugin-sdk`)
   - New package: `@obs-chat/plugin-sdk`
   - `isolated-vm` sandbox
   - Capability-based permission gating
   - Plugin lifecycle management

10. **Developer CLI** (`tools/streamchats-cli`)
    - New workspace: `tools/streamchats-cli`
    - Plugin scaffolding, connector simulator

### Phase 4 — Packaging & Integration (P3)

11. **OBS WebSocket Integration** (`packages/obs-integration`)
    - New package: `@obs-chat/obs-integration`
    - `obs-websocket-js` v5 client
    - Auto-create browser sources, scene switching

12. **Desktop Wrapper** (`apps/desktop`)
    - Tauri v2 shell
    - Node.js backend as sidecar (via `pkg`)
    - System tray, global hotkeys

### Phase 5 — Monetization (P4)

13. **Local Marketplace** — Plugin/theme registry
14. **Cloud Sync** — Optional settings sync service
15. **Studio Edition** — Multi-operator, NDI output

## Quick Verification

After each phase, verify with:

```bash
# Build all packages
npm run build

# Run the server
node apps/local-server/dist/index.js --twitch=test_channel --port=9090

# Open dashboard
open http://localhost:9090/dashboard

# Open overlay
open http://localhost:9090/?theme=glass
```
