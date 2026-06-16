# Implementation Tasks: Local WebSocket Server

## Dependencies & Execution Plan
- Setup (Phase 1) must be completed first to link workspaces.
- Foundational components (Phase 2) builds the core server.
- Integration (Phase 3) hooks the extractors and pipelines into the server.

## Phase 1: Setup
- [x] T001 [P] Initialize `@obs-chat/local-server` workspace dependencies in `apps/local-server/package.json`

## Phase 2: Foundational (US1)
**Story Goal**: Implement the standalone `ChatServer` that accepts WebSocket connections and broadcasts raw messages.
**Test Criteria**: Server runs, accepts incoming `wscat` connection, and `broadcast(msg)` sends data to the client.
- [x] T002 [P] [US1] Create `apps/local-server/src/server.ts` to implement the `ChatServer` class using `ws`.

## Phase 3: Integration (US1 & US2)
**Story Goal**: Hook up the platform connectors and moderation pipeline, then pipe the output to the WebSocket server.
**Test Criteria**: Running the app instantiates Twitch and YouTube connectors, connects them to the pipeline, and broadcasts only safe events.
- [x] T003 [US1] Create `apps/local-server/src/index.ts` entrypoint to instantiate `TwitchConnector` and `YouTubeConnector`.
- [x] T004 [US2] Update `apps/local-server/src/index.ts` to instantiate `ModerationPipeline` and connect it to the `ChatServer` broadcast.

## Phase 4: Polish
- [x] T005 Update `test-server.js` in root to verify end-to-end functionality of the local server.
