# Implementation Plan: Moderation Pipeline

**Branch**: `002-moderation-pipeline` | **Date**: 2026-06-16 | **Spec**: [spec.md](file:///c:/Users/basha/Desktop/root/StreamChats/StreamChats/specs/002-moderation-pipeline/spec.md)

## Summary

The moderation pipeline intercepts all incoming chat events before they are broadcasted to the overlay. It parses chat messages against a configurable blocklist and either drops or masks the messages. It also handles platform-specific user timeouts and bans to trigger immediate cleanup of previous messages on the overlay.

## Technical Context

**Language/Version**: Node.js v24+, TypeScript
**Primary Dependencies**: `event-schema` package, `connector-sdk` package
**Storage**: In-memory configuration
**Testing**: Quickstart scripts testing event interception
**Project Type**: Monorepo library/pipeline component
**Performance Goals**: <5ms overhead per message
**Constraints**: Synchronous execution before event emit to avoid visual delay
**Scale/Scope**: Up to 100 msgs/sec

## Constitution Check

*GATE: Passed*
- **Local-First Execution**: The pipeline runs entirely locally, filtering messages instantly without relying on external API calls.
- **Stability for Long Sessions**: We enforce a memory boundary in the history to prevent leaks.
- **Security & Moderation**: This feature directly satisfies the Security & Moderation requirement.

## Project Structure

### Documentation (this feature)

```text
specs/002-moderation-pipeline/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
└── tasks.md             
```

### Source Code (repository root)

```text
packages/moderation-pipeline/
├── src/
│   ├── index.ts        # Main pipeline entrypoint
│   ├── filters/        # Banned words, spam filters
│   └── handlers/       # Timeout/Ban event mappers
├── package.json
└── tsconfig.json
```

**Structure Decision**: Creating a new monorepo package `packages/moderation-pipeline` to encapsulate filtering logic. This allows local-server to compose the connector-sdk and moderation-pipeline together cleanly.
