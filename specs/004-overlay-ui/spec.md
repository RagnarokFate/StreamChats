# Feature Specification: Overlay UI

**Feature Branch**: `004-overlay-ui`
**Created**: 2026-06-16
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time Chat Display (Priority: P1)
As a streamer using OBS, I want to add a browser source that displays chat messages from Twitch and YouTube in a unified, beautifully styled feed so my viewers can see the chat on screen.
**Independent Test**: Connect the UI to the local server, emit mock messages, and verify they appear on the screen with their respective platform icons.

### User Story 2 - UI Moderation Sync (Priority: P1)
As a streamer, I want the on-screen chat to automatically delete or strike-through messages when a moderation action (timeout, ban, or clear chat) is received so my on-screen chat perfectly mirrors the actual platform state.
**Independent Test**: Emit a message, then emit a `ban` moderation event for that user. Verify all messages by that user are visually removed from the UI.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST connect to the Local WebSocket Server (`ws://localhost:9090`) to receive events.
- **FR-002**: System MUST render incoming chat messages smoothly, ideally with micro-animations.
- **FR-003**: System MUST identify the platform of the message visually (e.g., using Twitch/YouTube icons or colors).
- **FR-004**: System MUST handle `timeout` and `ban` moderation events by removing the target user's messages.
- **FR-005**: System MUST handle `clear_chat` moderation events by emptying the entire on-screen feed.

## Success Criteria *(mandatory)*
- **SC-001**: Chat messages render on screen within 50ms of receipt.
- **SC-002**: The UI automatically handles reconnects seamlessly if the local server is restarted.
- **SC-003**: The UI supports transparent backgrounds for seamless OBS integration.

## Assumptions
- The UI will be loaded as a Browser Source in OBS Studio.
- The UI runs locally and connects to `ws://localhost:9090`.
