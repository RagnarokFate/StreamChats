# Feature Specification: Platform Chat Connectors (Twitch & YouTube)

**Feature Branch**: `001-platform-connectors`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Implement Twitch and YouTube chat connectors. The plugin retrieves data from given input URLs or given username for different platforms, or through a direct connection — not through the regular platform APIs which impose rate limits. The project is built to be consistent with the user's own frequency of data retrieving for the user's stream."

## Clarifications

### Session 2026-06-16

- Q: Should a single connector instance support multiple channels, or strictly one channel per instance? → A: One connector instance per channel. Multi-channel is achieved by running multiple instances.
- Q: What extraction approach should be used for YouTube live chat? → A: Direct HTTP scraping of YouTube's live chat page (lightweight, no browser dependency, user-controlled poll interval).
- Q: When a stream ends, what should the connector do? → A: Transition to a waiting state and periodically check for a new stream, auto-resuming when one is detected.
- Q: How should the system surface errors and status changes for debugging? → A: Both structured events via EventEmitter (log, warning, error events) and built-in structured logging with configurable log levels written to file.
- Q: Should there be a maximum retry limit before the connector gives up on unrecoverable errors? → A: Yes, a configurable maximum retry count with a sensible default (e.g., 10 retries), then transition to ERROR and stop.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect to Twitch Chat via Channel Name (Priority: P1)

A streamer wants to aggregate Twitch chat into their OBS overlay. They provide a Twitch channel name or URL (e.g., `https://twitch.tv/username` or just `username`), and the connector begins extracting live chat messages in real time. The messages are normalized into the standard ChatEvent format and dispatched to the event bus for overlay rendering.

**Why this priority**: Twitch is the most widely used streaming platform. Connecting to a Twitch chat channel is the foundational use case and the most valuable MVP slice — without it, the aggregation engine has no data source.

**Independent Test**: Can be fully tested by providing a live Twitch channel name, observing that chat messages are captured, normalized into ChatEvent objects, and emitted via the connector SDK's `chat_message` event. Delivers immediate value by enabling a single-platform chat overlay.

**Acceptance Scenarios**:

1. **Given** the Twitch connector is idle, **When** the user provides a valid Twitch channel name (e.g., `shroud`), **Then** the connector transitions to CONNECTING → CONNECTED and begins emitting `chat_message` events containing normalized ChatEvent payloads.
2. **Given** the Twitch connector is idle, **When** the user provides a full Twitch URL (e.g., `https://www.twitch.tv/shroud`), **Then** the connector extracts the channel identifier from the URL and connects successfully.
3. **Given** the Twitch connector is connected, **When** a viewer sends a chat message containing emotes, **Then** the ChatEvent includes the raw text and correctly parsed emote fragments with image URLs.
4. **Given** the Twitch connector is connected, **When** a viewer sends a message, **Then** the ChatEvent includes the author's display name, user color, and badges (subscriber, moderator, etc.).

---

### User Story 2 - Connect to YouTube Live Chat via URL or Channel (Priority: P1)

A streamer wants to aggregate YouTube Live chat into their OBS overlay. They provide a YouTube live stream URL (e.g., `https://youtube.com/watch?v=VIDEO_ID`) or a channel name/handle, and the connector begins extracting live chat messages. Messages are normalized into the standard ChatEvent format and dispatched.

**Why this priority**: YouTube is the second largest streaming platform. Supporting it alongside Twitch covers the majority of multi-platform streamers and delivers the core value proposition of the aggregation engine.

**Independent Test**: Can be fully tested by providing a live YouTube stream URL, observing that chat messages are captured, normalized into ChatEvent objects, and emitted. Delivers value by enabling YouTube-only or multi-platform chat overlay.

**Acceptance Scenarios**:

1. **Given** the YouTube connector is idle, **When** the user provides a valid YouTube live stream URL, **Then** the connector transitions to CONNECTING → CONNECTED and begins emitting `chat_message` events.
2. **Given** the YouTube connector is idle, **When** the user provides a YouTube channel handle (e.g., `@ChannelName`), **Then** the connector resolves the active live stream for that channel and connects to its chat.
3. **Given** the YouTube connector is connected, **When** a viewer sends a Super Chat or membership message, **Then** the ChatEvent includes appropriate badge/role metadata distinguishing it from a regular message.
4. **Given** the YouTube connector is connected, **When** a viewer sends a message with custom emoji, **Then** the ChatEvent includes parsed emote fragments with image URLs.

---

### User Story 3 - Automatic Reconnection During Long Streams (Priority: P2)

A streamer is broadcasting for several hours. The connector encounters a transient network issue or the extraction session expires. The connector automatically recovers without the streamer needing to intervene, ensuring uninterrupted chat flow in the overlay.

**Why this priority**: Long-session stability is a core constitution principle. Streamers cannot afford to manually restart connectors during a live broadcast — automatic recovery is essential for production use.

**Independent Test**: Can be tested by simulating a connection drop (e.g., network interruption) and verifying the connector transitions through RECONNECTING and back to CONNECTED, resuming message emission without user action.

**Acceptance Scenarios**:

1. **Given** a connector is in CONNECTED state, **When** the underlying connection drops unexpectedly, **Then** the connector transitions to RECONNECTING and attempts to re-establish the connection using exponential backoff.
2. **Given** a connector is in RECONNECTING state, **When** the connection is successfully re-established, **Then** the connector transitions back to CONNECTED and resumes emitting chat messages.
3. **Given** a connector has been running for over 4 hours, **When** memory usage approaches configured thresholds, **Then** the connector performs a graceful self-reconnect during a low-activity window to reclaim resources.

---

### User Story 4 - User-Controlled Retrieval Frequency (Priority: P2)

A streamer wants control over how frequently the system retrieves chat data. They can configure the polling or extraction interval to balance between responsiveness and system resource usage. The system does not impose external rate limits — the retrieval cadence is entirely user-defined.

**Why this priority**: This differentiates the project from official API-based solutions. The user's own hardware and connection determine the data flow, not platform-imposed API quotas.

**Independent Test**: Can be tested by configuring different retrieval intervals and observing that the connector respects the configured cadence, with chat messages arriving at the expected frequency.

**Acceptance Scenarios**:

1. **Given** the user configures a retrieval interval of 500ms, **When** the connector is running, **Then** the connector retrieves data at approximately that frequency.
2. **Given** the user configures a retrieval interval of 2000ms, **When** the connector is running, **Then** the connector retrieves data less frequently, reducing resource usage proportionally.
3. **Given** no retrieval interval is explicitly configured, **When** the connector starts, **Then** it uses a sensible default interval that balances responsiveness and resource usage.

---

### User Story 5 - Pause and Resume Chat Extraction (Priority: P3)

A streamer wants to temporarily stop receiving chat messages (e.g., during a break or sensitive segment) without fully disconnecting. They can pause and resume extraction, and the overlay stops updating during the paused period.

**Why this priority**: Convenience feature that builds on the connector SDK's existing pause/resume contract. Lower priority than core connection and stability but enhances usability.

**Independent Test**: Can be tested by calling pause on a running connector, verifying no new messages are emitted, then calling resume and verifying messages flow again.

**Acceptance Scenarios**:

1. **Given** a connector is in CONNECTED state, **When** the user triggers pause, **Then** the connector transitions to PAUSED and stops emitting `chat_message` events.
2. **Given** a connector is in PAUSED state, **When** the user triggers resume, **Then** the connector transitions back to CONNECTED and resumes emitting events.

---

### Edge Cases

- What happens when a Twitch channel is offline (no active stream)? The connector should still connect to the channel's chat room — Twitch chat is available even when offline.
- What happens when a YouTube channel has no active live stream? The connector should report a clear status indicating no live stream was found and periodically check for a new one.
- What happens when the user provides a malformed URL or non-existent username? The connector should transition to ERROR state with a descriptive error message and not crash.
- What happens when a platform temporarily blocks the extraction method (e.g., Twitch changes their IRC/WebSocket endpoint)? The connector should surface the error, retry with backoff, and allow the user to be notified.
- What happens when both connectors are running simultaneously and one fails? The failure of one connector must not affect the other — connectors are fully isolated.
- What happens when the stream ends while the connector is active? The connector should detect the end-of-stream condition, transition to a WAITING state, and periodically check for a new stream. When a new stream is detected, the connector auto-resumes extraction without user intervention.
- What happens when the connector exhausts its maximum retry count? The connector transitions to ERROR state, emits a descriptive error event, logs the failure, and stops all reconnection attempts. The user must manually restart it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a platform-specific input (channel URL, username, or channel handle) and establish a direct chat data extraction connection without using official platform APIs.
- **FR-002**: System MUST normalize all extracted chat messages into the standardized ChatEvent schema defined by `@obs-chat/event-schema`, regardless of the source platform.
- **FR-003**: System MUST extract author metadata (display name, user ID, color, badges/roles) from each chat message for both Twitch and YouTube.
- **FR-004**: System MUST parse emotes and special message fragments (emotes, emoji, Super Chat indicators) into the ChatEvent's fragment structure.
- **FR-005**: System MUST implement the full BaseConnector lifecycle (start, stop, pause, resume, reconnect, getStatus) as defined by the `@obs-chat/connector-sdk`.
- **FR-006**: System MUST support automatic reconnection with exponential backoff (1s → 2s → 4s → 8s → max 60s) when the extraction connection drops, up to a configurable maximum retry count (sensible default, e.g., 10). After exhausting retries, the connector MUST transition to ERROR and stop.
- **FR-007**: System MUST allow the user to configure the data retrieval frequency (polling/extraction interval) independently of any platform rate limits.
- **FR-008**: System MUST run connectors in full isolation — a failure in one connector must not propagate to or affect any other running connector.
- **FR-009**: System MUST support Twitch IRC/WebSocket-based chat extraction and YouTube live chat extraction via direct HTTP scraping (no browser automation dependency).
- **FR-010**: System MUST extract the channel/stream identifier from various input formats (full URL, short URL, username string, channel handle) for each platform.
- **FR-011**: System MUST emit connector status change events (`status_change`) whenever the connector transitions between lifecycle states.
- **FR-012**: System MUST implement memory-aware operation for long sessions — including bounded event history and periodic resource recycling.
- **FR-013**: Each connector instance MUST be scoped to exactly one channel. Monitoring multiple channels on the same platform requires separate connector instances.
- **FR-014**: When a stream ends, the connector MUST transition to a WAITING state and periodically check for a new stream on the same channel, automatically resuming extraction when one is detected.
- **FR-015**: System MUST emit structured observability events via EventEmitter (`log`, `warning`, `error`) for all status changes, extraction failures, and operational diagnostics — enabling consuming applications to decide presentation.
- **FR-016**: System MUST provide built-in structured logging with configurable log levels (e.g., debug, info, warn, error) that writes to file, enabling post-session diagnostics and debugging.
- **FR-017**: System MUST support a configurable maximum reconnection retry count. When the retry limit is exhausted, the connector MUST transition to ERROR state, emit an error event with a descriptive reason, and cease all reconnection attempts.

### Key Entities

- **Connector Instance**: A running extraction session for a specific platform and channel. Holds connection state, configuration, and lifecycle methods. Strictly one connector per platform-channel pair — a single instance MUST NOT handle multiple channels. Multi-channel monitoring is achieved by instantiating separate connectors.
- **Chat Event**: A normalized message payload containing event ID, platform identifier, timestamp, author information, and message content with parsed fragments. The canonical data unit flowing through the system.
- **Connector Configuration**: User-provided settings for a connector instance including the target input (URL/username), retrieval frequency, and platform-specific options.
- **Connector Status**: The current lifecycle state of a connector (IDLE, CONNECTING, CONNECTED, PAUSED, RECONNECTING, WAITING, ERROR). WAITING indicates the stream has ended and the connector is periodically checking for a new stream. Drives event emission and recovery behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can provide a Twitch channel name or URL and see live chat messages appearing in the overlay within 5 seconds of starting the connector.
- **SC-002**: Users can provide a YouTube live stream URL or channel handle and see live chat messages appearing in the overlay within 10 seconds of starting the connector.
- **SC-003**: Connectors automatically recover from connection drops within 60 seconds without user intervention in 95% of transient failure cases.
- **SC-004**: The system operates continuously for at least 8 hours without memory growth exceeding 50% of the initial baseline.
- **SC-005**: Both Twitch and YouTube connectors can run simultaneously without one connector's failure affecting the other.
- **SC-006**: Chat messages include author display names, colors, and badges for at least 95% of messages on both platforms.
- **SC-007**: Users can adjust retrieval frequency and observe a corresponding change in data flow cadence within one retrieval cycle.
- **SC-008**: All connector status changes, errors, and warnings are both emitted as structured events and written to a log file with configurable verbosity levels.

## Assumptions

- Users have a stable local network connection capable of maintaining persistent connections to streaming platform chat services.
- Twitch IRC/WebSocket chat endpoints remain publicly accessible without requiring authenticated API tokens for read-only chat access.
- YouTube live chat data is extractable via direct HTTP requests to the live chat page without requiring browser automation (Playwright). No authenticated session or cookies are required for public live stream chats.
- The existing `@obs-chat/connector-sdk` BaseConnector class and `@obs-chat/event-schema` ChatEvent schema are stable and will not undergo breaking changes during this feature's development.
- Only read-only chat extraction is in scope — sending messages to chat is out of scope for this feature.
- The local overlay server and event bus (which consume the connector's output) are not yet implemented — connectors will be developed and tested against the SDK contract independently.
- One connector instance handles one channel at a time. Multi-channel support for a single platform is achieved by running multiple connector instances.
