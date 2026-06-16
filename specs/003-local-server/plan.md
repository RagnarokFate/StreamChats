# Implementation Plan: Local WebSocket Server

**Branch**: `003-local-server` | **Date**: 2026-06-16 | **Spec**: [spec.md](file:///c:/Users/basha/Desktop/root/StreamChats/StreamChats/specs/003-local-server/spec.md)

## Summary

The Local WebSocket Server runs locally alongside OBS and coordinates the extraction layer. It instantiates the Twitch and YouTube connectors, feeds their output through the Moderation Pipeline, and broadcasts the sanitized chat feed to connected UI overlays via WebSocket on port 9090.

## Technical Context

**Language/Version**: Node.js v24+, TypeScript
**Primary Dependencies**: `ws` for WebSocket server, `connector-sdk`, `connector-twitch`, `connector-youtube`, `moderation-pipeline`
**Storage**: N/A
**Testing**: Mock connector tests
**Project Type**: Monorepo App / Server
**Performance Goals**: <20ms latency from source event to broadcast
**Constraints**: Runs locally, no authentication required for WebSocket connections
**Scale/Scope**: Up to 5 concurrent WebSocket clients

## Constitution Check

*GATE: Passed*
- **Local-First Execution**: The server runs completely locally and only connects to local overlays.
- **Stability for Long Sessions**: Connectors implement their own reconnect logic, and the moderation pipeline implements memory limits. The WS server simply forwards events.

## Project Structure

### Documentation (this feature)

```text
specs/003-local-server/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
└── tasks.md             
```

### Source Code (repository root)

```text
apps/local-server/
├── src/
│   ├── index.ts        # Entrypoint (starts server and connectors)
│   └── server.ts       # WebSocket server wrapper
├── package.json
└── tsconfig.json
```

**Structure Decision**: Utilizing the existing `apps/local-server` package, updating its dependencies to include all necessary monorepo packages.
