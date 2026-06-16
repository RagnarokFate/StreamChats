# Tasks: OBS Plugin Wrapper

**Input**: Design documents from `/specs/005-obs-plugin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Phase 1: Setup

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure directory `plugins/obs/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create the main Lua script file `plugins/obs/obs-chat-aggregator.lua`
- [x] T003 Implement basic script description via `script_description()`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add Chat Overlay to Stream (Priority: P1) 🎯 MVP

**Goal**: As a streamer, I want to add the realtime chat aggregation overlay as a Browser Source in OBS.

**Independent Test**: Can be fully tested by opening OBS, verifying the script runs, and manually adding the `http://localhost:9090` Browser Source.

### Implementation for User Story 1

- [x] T004 [US1] Implement `script_load()` in `plugins/obs/obs-chat-aggregator.lua` to spawn the `apps/local-server` Node.js instance in the background.
- [x] T005 [US1] Implement `script_unload()` in `plugins/obs/obs-chat-aggregator.lua` to properly terminate the spawned Node.js process, avoiding orphan processes.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Configure Platform Connections (Priority: P2)

**Goal**: As a streamer, I want to configure my Twitch and YouTube channel connections directly within the OBS plugin settings.

**Independent Test**: Can be tested by opening the plugin settings dialog, entering channel IDs, and verifying the connector framework initializes properly via the Node.js process arguments.

### Implementation for User Story 2

- [x] T006 [US2] Implement `script_properties()` in `plugins/obs/obs-chat-aggregator.lua` to add UI text inputs for Twitch Channel, YouTube Channel, and Server Port.
- [x] T007 [US2] Implement `script_update(settings)` in `plugins/obs/obs-chat-aggregator.lua` to extract and persist the user settings.
- [x] T008 [US2] Update the Node.js execution command in `script_load()`/`script_update()` to pass the configured `--twitch`, `--youtube`, and `--port` CLI arguments.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T009 Create `plugins/obs/README.md` incorporating instructions from `quickstart.md`.
- [x] T010 Test cross-platform compatibility of the `os.execute` command used for spawning Node.js.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after User Story 1 (as it relies on the Node.js spawning command built in US1).

### Parallel Opportunities

- Due to the nature of a single Lua file, most tasks are sequential to avoid merge conflicts. However, `plugins/obs/README.md` (T009) can be worked on in parallel with the script development.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify Node.js spawns and stops with OBS.

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 → Test independently
3. Add User Story 2 → Test UI settings and command line arguments
