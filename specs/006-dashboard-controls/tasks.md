# Tasks: Dashboard Controls Panel

**Input**: Design documents from `/specs/006-dashboard-controls/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install `react-router-dom` in `apps/overlay-ui` via `npm install react-router-dom`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Update `packages/event-schema/src/index.ts` with new WebSocket command types (`SettingsChangeEvent`, `CommandEvent`, `StatusBroadcast`)
- [x] T003 [P] Implement `apps/local-server/src/config.ts` to manage `server-settings.json` reading/atomic writing
- [x] T004 Implement bidirectional command routing in `apps/local-server/src/server.ts` (`ws.on('message')`)
- [x] T005 Create `apps/overlay-ui/src/hooks/useSettings.ts` to manage localStorage persistence for `DashboardSettings`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Dashboard Framework & Navigation (Priority: P1) 🎯 MVP

**Goal**: Establish the basic dashboard layout and routing within the existing React app without breaking the overlay.

**Independent Test**: Load `http://localhost:9090/` and verify the overlay loads. Load `http://localhost:9090/dashboard` and verify the dashboard layout loads with functioning sidebar navigation.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create basic `Dashboard.tsx` layout in `apps/overlay-ui/src/components/Dashboard.tsx` with sidebar navigation shell
- [x] T007 [US1] Update `apps/overlay-ui/src/App.tsx` to use `react-router-dom` (`/` for Overlay, `/dashboard` for Dashboard)
- [x] T008 [US1] Update `apps/overlay-ui/src/main.tsx` to wrap `App` in `BrowserRouter`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Chat Controls Panel (Priority: P1)

**Goal**: Add controls to clear chat and customize overlay fonts, broadcasting changes to connected overlays.

**Independent Test**: Send test messages, click "Clear Chat" from dashboard, verify messages disappear from OBS. Change font size, verify OBS updates instantly.

### Implementation for User Story 2

- [x] T009 [P] [US2] Create `ChatControls.tsx` in `apps/overlay-ui/src/components/ChatControls.tsx` with font pickers and clear chat button
- [x] T010 [US2] Update `apps/overlay-ui/src/hooks/useChatFeed.ts` to handle sending commands and receiving `settings_update` events
- [x] T011 [US2] Update `apps/overlay-ui/src/App.tsx` and `index.css` to dynamically apply font settings via CSS custom properties (`--msg-font`, etc.)
- [x] T012 [US2] Mount `ChatControls.tsx` in the dashboard routing

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Emoji & Emote Rendering (Priority: P1)

**Goal**: Render inline emotes using the `fragments` array provided by connectors, with global and per-platform toggles.

**Independent Test**: Send a Twitch message with emotes, verify it renders as an image. Toggle off Twitch emotes in dashboard, verify it falls back to text.

### Implementation for User Story 3

- [x] T013 [P] [US3] Fix Twitch CDN URL typo (`jtvnbs` to `jtvnw`) in `connectors/twitch/src/parser.ts`
- [x] T014 [P] [US3] Create `EmoteToggle.tsx` in `apps/overlay-ui/src/components/EmoteToggle.tsx`
- [x] T015 [US3] Refactor `apps/overlay-ui/src/components/ChatMessage.tsx` to map over `message.fragments` and render images for `type: "emote"` respecting toggles

**Checkpoint**: All P1 user stories should now be independently functional

---

## Phase 6: User Story 4 - Message Timestamps (Priority: P2)

**Goal**: Add relative ("2m ago") or absolute ("7:42 PM") timestamps to chat messages with a dashboard toggle.

**Independent Test**: Send messages, toggle timestamps on in the dashboard, verify timestamps appear on the overlay.

### Implementation for User Story 4

- [x] T016 [P] [US4] Create `TimestampControls.tsx` in `apps/overlay-ui/src/components/TimestampControls.tsx`
- [x] T017 [US4] Update `apps/overlay-ui/src/components/ChatMessage.tsx` to format and display `timestamp` based on current settings

---

## Phase 7: User Story 5 - Overlay Preview & Theme Selector (Priority: P2)

**Goal**: Provide a visual theme picker and a live chat preview inside the dashboard.

**Independent Test**: Select a theme from the dashboard picker, verify the live preview updates immediately, and OBS updates immediately.

### Implementation for User Story 5

- [x] T018 [P] [US5] Create `ThemePicker.tsx` in `apps/overlay-ui/src/components/ThemePicker.tsx`
- [x] T019 [P] [US5] Create `ColorPicker.tsx` in `apps/overlay-ui/src/components/ColorPicker.tsx`
- [x] T020 [US5] Update `Dashboard.tsx` to embed `ChatFeed.tsx` for the live preview feature
- [x] T021 [US5] Connect theme/color changes to broadcast `settings_update` via `useChatFeed.ts`

---

## Phase 8: User Story 6 - Stream Statistics (Priority: P2)

**Goal**: Track and display real-time engagement metrics per platform.

**Independent Test**: Send messages to the server, verify the stats panel shows increasing message counts and messages-per-minute.

### Implementation for User Story 6

- [x] T022 [P] [US6] Implement real-time stats aggregation (totals, sliding 60s window) in `apps/local-server/src/index.ts`
- [x] T023 [US6] Add `status_update` periodic 2s broadcast in `apps/local-server/src/server.ts`
- [x] T024 [P] [US6] Create `useStats.ts` hook in `apps/overlay-ui/src/hooks/useStats.ts`
- [x] T025 [US6] Create `StatsPanel.tsx` in `apps/overlay-ui/src/components/StatsPanel.tsx` and integrate it

---

## Phase 9: User Story 7 - Platform Connection Manager (Priority: P3)

**Goal**: Show visual connection health for each platform and provide a reconnect button.

**Independent Test**: Disconnect internet, verify dashboard shows yellow/red error. Reconnect internet, click Reconnect, verify green status.

### Implementation for User Story 7

- [x] T026 [P] [US7] Expose connector health state (status, lastError, reconnectCount) in `apps/local-server/src/index.ts`
- [x] T027 [US7] Include health state in the `status_update` broadcast in `apps/local-server/src/server.ts`
- [x] T028 [US7] Implement `reconnect_platform` command handling in `apps/local-server/src/server.ts`
- [x] T029 [US7] Create `PlatformHealth.tsx` in `apps/overlay-ui/src/components/PlatformHealth.tsx`

---

## Phase 10: User Story 8 - Banned Words & Moderation Settings (Priority: P3)

**Goal**: Control the server's moderation pipeline at runtime from the dashboard.

**Independent Test**: Add "spam" to banned words. Send a message containing "spam". Verify it is masked/dropped per settings.

### Implementation for User Story 8

- [x] T030 [P] [US8] Create `ModerationPanel.tsx` in `apps/overlay-ui/src/components/ModerationPanel.tsx`
- [x] T031 [US8] Send `update_moderation` commands from dashboard via `useChatFeed.ts`
- [x] T032 [US8] Update `apps/local-server/src/index.ts` to apply dynamic moderation config (`server-settings.json`) to incoming messages before broadcasting

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T033 Polish CSS layout and responsiveness for `Dashboard.tsx`
- [ ] T034 Update project `README.md` to document dashboard feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- Foundational tasks (T002, T003) can run in parallel
- Component creation (T006, T009, T014, T016, T018, T030) can be done in parallel before wiring them into the dashboard layout
- Server-side stats tracking (T022, T026) can be implemented in parallel with UI tasks

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3 & 4: Basic routing and Chat Controls
4. **STOP and VALIDATE**: Verify dashboard loads and can clear chat/change fonts
5. Deploy/demo if ready

### Incremental Delivery

1. Add Phase 5 (US3): Emote rendering (highly visible win)
2. Add Phase 6 & 7 (US4/5): Timestamps and Theme/Preview
3. Add Phase 8 & 9 (US6/7): Server statistics and Platform health monitoring
4. Add Phase 10 (US8): Runtime moderation config
5. Polish and complete feature
