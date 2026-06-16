# Implementation Tasks: Moderation Pipeline

## Setup Phase
- [X] T001: Initialize `packages/moderation-pipeline` with `package.json` and `tsconfig.json`
- [X] T002: Add `@obs-chat/moderation-pipeline` workspace to root `package.json`

## Core Phase
- [X] T003: [P] Create `src/types.ts` for ModerationOptions and Event types
- [X] T004: [P] Create `src/buffer.ts` implementing the ring buffer for memory bounds
- [X] T005: [P] Create `src/filters/index.ts` containing the drop/mask string replacement algorithms
- [X] T006: Create `src/index.ts` to implement `ModerationPipeline` class

## Integration & Tests Phase
- [X] T007: Update `quickstart.md` and write `test-moderation.js` to verify the pipeline functionality
