# Implementation Plan: Dashboard Controls Panel

**Branch**: `006-dashboard-controls` | **Date**: 2026-06-20 | **Spec**: [spec.md](file:///c:/Users/basha/Desktop/root/StreamChats/StreamChats/specs/006-dashboard-controls/spec.md)

**Input**: Feature specification from `specs/006-dashboard-controls/spec.md`

## Summary

Build a streamer-facing dashboard at `/dashboard` within the existing `overlay-ui` React app, adding live chat controls, font/theme customization, emote rendering with per-platform toggles, message timestamps, real-time stream statistics, platform health monitoring, and moderation settings. The dashboard communicates bidirectionally with the server via the existing WebSocket. Display preferences persist in browser local storage; moderation config persists in a server-side JSON file.

## Technical Context

**Language/Version**: TypeScript 5.2+ (Node.js for server, React 18 for UI)

**Primary Dependencies**: React 18, Vite 5, react-router-dom (new), ws (WebSocket), pino (logging), zod (event schema validation)

**Storage**: Browser localStorage (display preferences), server-side JSON file (moderation/connector config)

**Testing**: Manual verification via browser + OBS Browser Source

**Target Platform**: Desktop browser (localhost), OBS Studio Browser Source

**Project Type**: Monorepo web application (npm workspaces)

**Performance Goals**: Dashboard loads <2s, setting changes reflected in OBS overlay <1s, responsive at 500+ msg/min

**Constraints**: Local-first execution, no external API dependencies, minimal memory footprint for long sessions

**Scale/Scope**: Single local user, 1–4 platform connectors, 50-message display buffer

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Local-First Execution | ✅ PASS | Dashboard runs entirely on localhost. No external APIs added. Google Fonts loaded via existing CSS import. |
| II. Stability for Long Sessions | ✅ PASS | 50-message buffer preserved. Statistics use lightweight counters. No memory-leaking data structures added. |
| III. Open-Source Extensibility | ✅ PASS | WebSocket command protocol is extensible. New commands can be added without breaking existing ones. Settings schema is open JSON. |
| IV. Branch Strategy | ✅ PASS | Working on feature branch `006-dashboard-controls`, will merge to `dev`. |
| V. Commit Convention | ✅ PASS | All commits will follow Conventional Commits format, no emojis. |
| Architecture & Performance | ✅ PASS | No additional server overhead beyond WebSocket message handling. Dashboard uses same React build pipeline. |
| Security & Moderation | ✅ PASS | Moderation pipeline gains runtime configuration. Dashboard is localhost-only. No auth needed for local access. |

## Project Structure

### Documentation (this feature)

```text
specs/006-dashboard-controls/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (WebSocket command protocol)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
apps/
├── local-server/src/
│   ├── index.ts             # [MODIFY] Add settings config + stats tracking
│   ├── server.ts            # [MODIFY] Add bidirectional WS command handling
│   └── config.ts            # [NEW] Server-side JSON config persistence
│
└── overlay-ui/src/
    ├── main.tsx             # [MODIFY] Add react-router
    ├── App.tsx              # [MODIFY] Add routing (/ = overlay, /dashboard = controls)
    ├── index.css            # [MODIFY] Add dashboard styles + emote inline styles
    ├── components/
    │   ├── ChatFeed.tsx     # [MODIFY] Accept settings props (font, timestamps, emotes)
    │   ├── ChatMessage.tsx  # [MODIFY] Render emote fragments, timestamps
    │   ├── Dashboard.tsx    # [NEW] Main dashboard layout with sidebar nav
    │   ├── ChatControls.tsx # [NEW] Clear chat, font editor, live preview
    │   ├── ThemePicker.tsx  # [NEW] Visual theme selector with previews
    │   ├── StatsPanel.tsx   # [NEW] Real-time per-platform statistics
    │   ├── PlatformHealth.tsx # [NEW] Connection status + reconnect buttons
    │   ├── ModerationPanel.tsx # [NEW] Banned words, spam toggle, action selector
    │   ├── EmoteToggle.tsx  # [NEW] Per-platform emote visibility controls
    │   └── ColorPicker.tsx  # [NEW] Background color picker
    └── hooks/
        ├── useChatFeed.ts   # [MODIFY] Handle bidirectional WS (send commands, receive settings)
        ├── useSettings.ts   # [NEW] Local storage persistence for display preferences
        └── useStats.ts      # [NEW] Real-time statistics aggregation

packages/
└── event-schema/src/
    └── index.ts             # [MODIFY] Add command event types (SettingsChangeEvent, etc.)

connectors/
├── twitch/src/
│   └── parser.ts            # Emotes already parsed ✅ (only fix: CDN URL typo jtvnbs→jtvnw)
└── youtube/src/
    └── parser.ts            # Emotes already parsed ✅ (no changes needed)
```

**Structure Decision**: The existing monorepo structure is preserved. The dashboard is a new route within the `overlay-ui` app (no new workspace packages). The server gains a config module and bidirectional WebSocket command handling.

## Complexity Tracking

No constitution violations to justify.

