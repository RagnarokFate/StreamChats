# Implementation Tasks: Overlay UI

## Dependencies & Execution Plan
- Setup must finish before anything else.
- The `useChatFeed` hook is foundational and must be built before UI components.
- Components (`ChatMessage`, `ChatFeed`) can be built in parallel.

## Phase 1: Setup
- [x] T001 [P] Add `@obs-chat/event-schema` dependency to `apps/overlay-ui/package.json`

## Phase 2: Foundational
**Goal**: Build the core WebSocket connection and state management hook.
- [x] T002 [P] Create `apps/overlay-ui/src/hooks/useChatFeed.ts` to connect to `ws://localhost:9090` and manage the message array state.

## Phase 3: Real-time Chat Display (US1)
**Story Goal**: Render the chat feed with beautiful glassmorphism and animations.
- [x] T003 [P] [US1] Create `apps/overlay-ui/src/index.css` with custom CSS variables, keyframe animations, and transparent background.
- [x] T004 [US1] Create `apps/overlay-ui/src/components/ChatMessage.tsx` to render a single message with platform icons.
- [x] T005 [US1] Create `apps/overlay-ui/src/components/ChatFeed.tsx` to render the list of messages with auto-scrolling.
- [x] T006 [US1] Update `apps/overlay-ui/src/App.tsx` to mount `ChatFeed` and integrate `useChatFeed`.

## Phase 4: UI Moderation Sync (US2)
**Story Goal**: Visually hide or strike-through messages when moderation events hit.
- [x] T007 [US2] Update `apps/overlay-ui/src/components/ChatMessage.tsx` to respect the `isDeleted` prop by applying an `.animate-out` class.

## Phase 5: Polish
- [x] T008 Update `apps/overlay-ui/index.html` to import the correct premium fonts (e.g., Inter from Google Fonts).
