# Research: Local WebSocket Server

## WebSocket Implementation
- **Decision**: Use the `ws` package for Node.js.
- **Rationale**: It's lightweight, extremely fast, and standard for Node.js servers. Socket.io is too heavy and requires client-side libraries that might overcomplicate a simple OBS browser source.
- **Alternatives considered**: `socket.io` (rejected due to overhead), Native HTTP server polling (rejected due to latency).

## Configuration Injection
- **Decision**: Hardcode connection channels for this initial version.
- **Rationale**: For the sake of the MVP, we can configure a basic `ModerationOptions` and connector instantiation directly in `index.ts`. A config UI or file can be added later.
