# Feature Specification: Local WebSocket Server

**Feature Branch**: `003-local-server`
**Created**: 2026-06-16
**Status**: Draft

## Clarifications
### Session 2026-06-16
- Q: Which port should the local server run on by default? → A: 9090
- Q: Authentication requirement for local server → A: No Authentication (Open Local Connection)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centralized Chat Broadcasting (Priority: P1)
As a streamer using OBS, I want the local server to aggregate chat messages from Twitch and YouTube and broadcast them over a single WebSocket connection so my overlay can display everything in one place.

**Independent Test**: Can be tested by starting the server, connecting a WS client, simulating Twitch/YT messages, and verifying the client receives a unified stream.

**Acceptance Scenarios**:
1. **Given** the server is running, **When** a client connects via WebSocket, **Then** the connection succeeds.
2. **Given** an active connection, **When** a connector emits a chat message, **Then** the message is broadcast to all WebSocket clients.

### User Story 2 - Security & Moderation Pipeline Integration (Priority: P1)
As a streamer, I want all incoming messages to automatically pass through the Moderation Pipeline before being broadcast so my stream overlay is protected from spam and offensive words.

**Independent Test**: Can be tested by sending a banned word into the connector and verifying it is not broadcast or is masked.

**Acceptance Scenarios**:
1. **Given** the moderation pipeline is linked, **When** a connector emits an event, **Then** it is processed by the pipeline and only valid events are broadcast over WebSocket.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST start a WebSocket server on local port 9090 by default.
- **FR-002**: System MUST instantiate the Twitch and YouTube connectors on startup.
- **FR-003**: System MUST route all connector events through the `ModerationPipeline` before broadcasting.
- **FR-004**: System MUST allow the OBS overlay to connect with no authentication (open local connection).

## Success Criteria *(mandatory)*
- **SC-001**: WebSocket server handles up to 5 concurrent overlay connections (e.g., if the user has multiple OBS scenes with the overlay).
- **SC-002**: End-to-end latency from connector emission to WebSocket broadcast is <20ms.

## Assumptions
- The server will run locally on the same machine as OBS Studio.
