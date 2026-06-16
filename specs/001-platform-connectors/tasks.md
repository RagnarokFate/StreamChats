# Tasks: Platform Chat Connectors (Twitch & YouTube)

**Input**: Design documents from `/specs/001-platform-connectors/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/connector-contracts.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directories for `connectors/twitch` and `connectors/youtube`
- [ ] T002 [P] Initialize package structure and `package.json` for `connectors/twitch`
- [ ] T003 [P] Initialize package structure and `package.json` for `connectors/youtube`
- [ ] T004 [P] Update root or workspace configurations to include the new `connectors/*` packages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Install `pino` dependency in `packages/connector-sdk`
- [ ] T006 Update `ConnectorStatus` enum to include `WAITING` state in `packages/connector-sdk/src/index.ts`
- [ ] T007 Implement structured logger factory (`createLogger`) in `packages/connector-sdk/src/logger.ts`
- [ ] T008 Export the new logger functionality from `packages/connector-sdk/src/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Connect to Twitch Chat via Channel Name (Priority: P1) 🎯 MVP

**Goal**: Connect to Twitch chat, read messages anonymously via IRC WebSocket, and emit ChatEvent payloads.

**Independent Test**: Provide a live Twitch channel name, observe chat messages are captured, normalized into ChatEvent objects, and emitted via `chat_message`.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Install `ws` dependency in `connectors/twitch`
- [ ] T010 [P] [US1] Implement input resolution (`resolveInput`) in `connectors/twitch/src/utils.ts`
- [ ] T011 [P] [US1] Implement IRC message parser and ChatEvent normalization in `connectors/twitch/src/parser.ts`
- [ ] T012 [US1] Implement `TwitchConnector` class and lifecycle methods (`start`, `stop`, `getStatus`) in `connectors/twitch/src/index.ts`
- [ ] T013 [US1] Implement `TwitchConnector` event emission (`chat_message`, `status_change`, `log`) in `connectors/twitch/src/index.ts`

**Checkpoint**: At this point, User Story 1 (Twitch Connector) should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Connect to YouTube Live Chat via URL or Channel (Priority: P1)

**Goal**: Connect to YouTube live stream chat, read messages via direct HTTP scraping (InnerTube), and emit ChatEvent payloads.

**Independent Test**: Provide a live YouTube stream URL, observe chat messages are captured, normalized, and emitted.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Implement input resolution (extracting video ID from URL or channel handle) in `connectors/youtube/src/utils.ts`
- [ ] T015 [P] [US2] Implement InnerTube API HTTP client (`/youtubei/v1/live_chat/get_live_chat`) in `connectors/youtube/src/api.ts`
- [ ] T016 [P] [US2] Implement InnerTube response parser and ChatEvent normalization in `connectors/youtube/src/parser.ts`
- [ ] T017 [US2] Implement `YouTubeConnector` class, HTTP polling loop, and token continuation in `connectors/youtube/src/index.ts`
- [ ] T018 [US2] Implement `YouTubeConnector` event emission in `connectors/youtube/src/index.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Automatic Reconnection During Long Streams (Priority: P2)

**Goal**: Ensure connectors automatically recover from connection drops with exponential backoff and gracefully wait when streams end.

**Independent Test**: Simulate a connection drop or end of stream and verify the connector transitions to RECONNECTING or WAITING, and recovers successfully.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Implement exponential backoff reconnection logic and max retry limits in `connectors/twitch/src/index.ts`
- [ ] T020 [P] [US3] Implement exponential backoff reconnection logic and max retry limits in `connectors/youtube/src/index.ts`
- [ ] T021 [US3] Implement end-of-stream detection and `WAITING` state periodic checks in `connectors/youtube/src/index.ts`

---

## Phase 6: User Story 4 - User-Controlled Retrieval Frequency (Priority: P2)

**Goal**: Allow configuration of data retrieval polling intervals, overriding defaults.

**Independent Test**: Configure `pollIntervalMs` and observe polling frequency adjusts.

### Implementation for User Story 4

- [ ] T022 [US4] Implement configurable `pollIntervalMs` override in the polling loop of `connectors/youtube/src/index.ts`

---

## Phase 7: User Story 5 - Pause and Resume Chat Extraction (Priority: P3)

**Goal**: Temporarily halt chat message emission without fully disconnecting.

**Independent Test**: Call `pause()` and verify events stop; call `resume()` and verify events continue.

### Implementation for User Story 5

- [ ] T023 [P] [US5] Implement `pause()` and `resume()` toggles for `TwitchConnector` in `connectors/twitch/src/index.ts`
- [ ] T024 [P] [US5] Implement `pause()` and `resume()` toggles for `YouTubeConnector` in `connectors/youtube/src/index.ts`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T025 [P] Ensure memory-aware operation (bounded event history limits, garbage collection) in both connectors
- [ ] T026 Export all types and main classes correctly from package indices
- [ ] T027 Run quickstart.md validation script against both connectors to ensure public API matches the spec

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Twitch (US1) and YouTube (US2) stories can proceed in parallel
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on US1
- **User Story 3 (P2)**: Depends on US1 and US2 being implemented
- **User Story 4 (P2)**: Depends on US2 being implemented
- **User Story 5 (P3)**: Depends on US1 and US2 being implemented

### Parallel Opportunities

- All Setup and Foundational tasks marked [P] can run in parallel
- US1 (Twitch) and US2 (YouTube) can be developed simultaneously by different team members
- Parsers, Utils, and API clients within the same story marked [P] can be developed concurrently
