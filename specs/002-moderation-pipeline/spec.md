# Feature Specification: Moderation Pipeline

**Feature Branch**: `002-moderation-pipeline`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "start on 002" (Security & Moderation Pipeline from Constitution)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Profanity and Keyword Filtering (Priority: P1)

As a streamer, I want the chat aggregator to automatically filter out messages containing profanity or custom banned words before they appear on my stream overlay.

**Why this priority**: Essential for maintaining stream safety and compliance with platform terms of service.

**Independent Test**: Can be fully tested by sending messages containing banned keywords into the pipeline and verifying they are intercepted before reaching the overlay event stream.

**Acceptance Scenarios**:

1. **Given** the moderation pipeline is active with a list of banned words, **When** a chat message containing a banned word arrives from a connector, **Then** the message is intercepted and appropriate action is taken before being broadcast to the overlay.
2. **Given** a chat message with normal text, **When** it passes through the pipeline, **Then** it is forwarded to the overlay without modification.

---

### User Story 2 - User Timeout and Ban Synchronization (Priority: P2)

As a streamer, I want the overlay to automatically hide past messages from users who are timed out or banned on the source platform (e.g., Twitch or YouTube).

**Why this priority**: When moderators remove a troll from chat, their existing messages on the stream overlay should disappear to prevent further disruption.

**Independent Test**: Can be tested by simulating a "user banned" event and verifying the aggregator emits a "clear messages" event for that user.

**Acceptance Scenarios**:

1. **Given** a user has recent messages displayed on the overlay, **When** a "user banned" or "timeout" event is received for that user, **Then** the aggregator broadcasts a clear-message event to the overlay to immediately hide their past messages.

---

### User Story 3 - Spam and Flood Protection (Priority: P3)

As a streamer, I want the system to detect and filter out repeated spam messages or copy-pasta floods from clogging up my overlay.

**Why this priority**: Rapid spam can make the overlay unreadable.

**Independent Test**: Can be tested by sending the exact same message 10 times in a second and verifying only the first few are forwarded.

**Acceptance Scenarios**:

1. **Given** the spam filter is enabled, **When** a user or multiple users send the exact same repetitive message rapidly, **Then** the aggregator rate-limits the display of these messages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST intercept all normalized chat events from all active connectors before they are broadcast to the local server.
- **FR-002**: System MUST support a customizable blocklist of keywords/phrases to filter from incoming messages.
- **FR-003**: System MUST provide a configurable setting to handle banned words by either completely dropping the message or masking the banned words with asterisks/custom characters.
- **FR-004**: System MUST process platform moderation events (e.g., ClearChat, Timeout, Ban) and map them to unified removal events for the overlay UI.
- **FR-005**: System MUST enforce a memory boundary (e.g., a maximum event history limit) to prevent memory leaks over long sessions.
- **FR-006**: System MUST execute the moderation pipeline synchronously with minimal latency to avoid delaying chat display.

### Key Entities

- **ModerationRule**: Defines a condition (e.g., regex pattern, exact match) and an action (e.g., drop, mask).
- **ModerationEvent**: A system event representing a moderation action (like clearing a user's messages).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The moderation pipeline processes incoming messages with less than 5ms overhead per message.
- **SC-002**: 100% of messages containing exact matches of banned keywords are correctly filtered.
- **SC-003**: When a user ban event is received, the overlay receives the clear command within 50ms.
- **SC-004**: System memory remains stable (no steady growth) when processing 100 messages per second for 12 hours.

## Assumptions

- Streamers will manage their custom blocklists via a local configuration file or simple UI (out of scope for the core pipeline logic).
- Basic platform moderation (e.g., Twitch automod) will still apply before messages even reach the aggregator; this pipeline is a secondary local defense.
