# Implementation Plan: Platform Chat Connectors (Twitch & YouTube)

**Branch**: `001-platform-connectors` | **Date**: 2026-06-16 | **Spec**: [spec.md](file:///c:/Users/basha/Desktop/root/StreamChats/StreamChats/specs/001-platform-connectors/spec.md)

**Input**: Feature specification from `/specs/001-platform-connectors/spec.md`

## Summary

Implement Twitch and YouTube chat connectors that retrieve data from given input URLs or usernames without relying on official API rate limits. The project uses a direct connection approach: Twitch connects via its anonymous read-only IRC WebSocket (`wss://irc-ws.chat.twitch.tv`), while YouTube extracts data via direct HTTP scraping of the InnerTube API. Both connectors will implement the `BaseConnector` lifecycle, output standardized `ChatEvent` objects, and run entirely locally in a low-resource footprint suitable for OBS Studio.

## Technical Context

**Language/Version**: TypeScript / Node.js >= 18

**Primary Dependencies**: 
- `ws` (for Twitch WebSocket connection)
- `pino` (for lightweight structured file logging)
- `@obs-chat/connector-sdk` (local package)
- `@obs-chat/event-schema` (local package)

**Storage**: None (Memory-only, with bounded event history tracking)

**Testing**: Jest (assuming standard for TypeScript packages)

**Target Platform**: Local server running in OBS environment (Windows/macOS/Linux)

**Project Type**: Node.js Library Packages (`@obs-chat/connector-twitch`, `@obs-chat/connector-youtube`)

**Performance Goals**: <100MB memory per connector, connect/recover under 10 seconds

**Constraints**: Must not use official platform APIs. No Puppeteer/Playwright due to memory constraints in the OBS environment.

**Scale/Scope**: Support multi-hour (8h+) continuous broadcasts with robust memory management and automatic transient failure recovery.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Local-First Execution**: PASS. All extraction runs locally via direct connection without relying on intermediary web services.
- **Stability for Long Sessions**: PASS. Plan includes bounded event history and a robust state machine (`RECONNECTING`, `WAITING`) to handle stream ends, network drops, and memory caps.
- **Open-Source Extensibility**: PASS. Implementation adheres to the `@obs-chat/connector-sdk` abstract `BaseConnector` pattern.
- **Branch Strategy**: PASS. Using feature branch `001-platform-connectors`.
- **Commit Convention**: PASS. (To be enforced during execution).

## Project Structure

### Documentation (this feature)

```text
specs/001-platform-connectors/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Data models and state machine
├── quickstart.md        # Usage documentation
├── contracts/
│   └── connector-contracts.md # Public API definitions
└── tasks.md             # (To be generated)
```

### Source Code (repository root)

```text
packages/
├── connector-sdk/
│   ├── src/
│   │   ├── index.ts        # Extended to support WAITING state
│   │   └── logger.ts       # [NEW] Pino structured logger factory
│   └── package.json

connectors/
├── twitch/
│   ├── src/
│   │   ├── index.ts        # Entry point, TwitchConnector class
│   │   ├── parser.ts       # IRC message parser
│   │   └── utils.ts        # URL/input resolver
│   └── package.json
│
└── youtube/
    ├── src/
    │   ├── index.ts        # Entry point, YouTubeConnector class
    │   ├── api.ts          # InnerTube API HTTP client
    │   ├── parser.ts       # InnerTube response parser
    │   └── utils.ts        # URL/input resolver
    └── package.json
```

**Structure Decision**: Extending the existing monorepo workspace packages. The `connector-sdk` gets logging and state updates. The `twitch` and `youtube` connectors are implemented as standalone packages within the `connectors/` directory.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations.*
