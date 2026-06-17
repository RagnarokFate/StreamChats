# Feature Specification: OBS Plugin Wrapper

**Feature Branch**: `005-obs-plugin`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "continue from last tasks" (Interpreted as: OBS Plugin Wrapper based on SDD)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Chat Overlay to Stream (Priority: P1)

As a streamer, I want to add the realtime chat aggregation overlay as a Browser Source in OBS so that my viewers can see the unified chat on stream.

**Why this priority**: Without the OBS Browser Source, the viewers cannot see the aggregated chat, defeating the core purpose of the engine.

**Independent Test**: Can be fully tested by opening OBS, adding a Browser Source pointing to `http://localhost:9090`, and verifying the chat feed is rendered with a transparent background.

**Acceptance Scenarios**:

1. **Given** OBS Studio is running, **When** the user adds a new Browser Source pointing to the local server, **Then** the chat overlay renders seamlessly over the game feed.
2. **Given** the chat overlay is active, **When** a message is broadcasted from the local server, **Then** the overlay UI immediately displays the message bubble with its respective platform icon.

---

### User Story 2 - Configure Platform Connections (Priority: P2)

As a streamer, I want to configure my Twitch and YouTube channel connections directly within the OBS plugin settings so that I don't have to edit configuration files manually.

**Why this priority**: Streamers need an accessible way to input their channel details to start the extraction process.

**Independent Test**: Can be tested by opening the plugin settings dialog, entering channel IDs, and verifying the connector framework initializes properly.

**Acceptance Scenarios**:

1. **Given** the OBS plugin is installed, **When** the user opens the settings dialog, **Then** they see inputs for Twitch and YouTube channel IDs.
2. **Given** valid channel IDs are entered, **When** the user saves the settings, **Then** the plugin signals the local server/connector framework to begin capturing chat from those channels.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an entry point or plugin interface for OBS Studio.
- **FR-002**: System MUST host or manage the lifecycle of the Local Overlay Server, starting it when OBS starts and terminating it when OBS closes.
- **FR-003**: System MUST provide a configuration UI within OBS for users to input their Twitch and YouTube channel IDs.
- **FR-004**: System MUST instruct the Connector Framework to start chat extraction based on the user-configured channels.
- **FR-005**: System MUST ensure the chat overlay renders with a transparent background in the OBS Browser Source (e.g. using `body { background-color: transparent !important; }`).

### Non-Functional & Edge Case Requirements

- **NFR-001**: The plugin MUST use OS-specific background process execution techniques (`start /B` on Windows, `&` on macOS/Linux) to avoid blocking the OBS thread.
- **NFR-002**: Input Validation: The UI MUST trim whitespace from channel IDs and restrict them to alphanumeric/standard URL characters (max 255 chars).
- **NFR-003**: Orphan/Zombie Prevention: If OBS terminates abruptly, the Node.js process MUST automatically exit (e.g. by polling for parent process ID or shutting down on STDIN closure).
- **NFR-004**: Port Conflicts: If the selected `server_port` is in use, the plugin MUST log an error in the OBS script log and fail gracefully instead of crashing.
- **NFR-005**: Disconnect Recovery: The frontend Overlay UI MUST automatically attempt to reconnect to the WebSocket every 5 seconds if the connection drops.
- **NFR-006**: Node Crash Recovery: If the Node.js process crashes, the user can manually restart it using the "Connect / Apply" button in the OBS UI.
- **NFR-007**: Security: Channel IDs are stored in plain text in the local OBS `.json` profile data, which is acceptable as they are public data. No tokens are stored.
- **NFR-008**: Graceful Shutdown: "Gracefully manage" means sending a standard termination signal (`SIGTERM` on Unix, or `wmic call terminate` on Windows) and allowing up to 1000ms before forceful cleanup.

### Key Entities *(include if feature involves data)*

- **OBS Settings Profile**: Stores the user's platform configuration (channel IDs).
- **Engine Process**: The underlying Node.js/Playwright process hosting the Local Server and Connectors, managed by the OBS Plugin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The plugin successfully starts the Local Overlay Server in under 3 seconds upon OBS startup.
- **SC-002**: The chat overlay renders in the OBS Browser Source with less than 50ms latency from event extraction.
- **SC-003**: The plugin adds no more than 2% CPU overhead to the OBS process during active chat streaming.
- **SC-004**: Users can successfully configure and display their chat overlay within 2 minutes of installing the plugin.

## Assumptions

- Streamers are using a compatible version of OBS Studio (v28+).
- The Local Server (`apps/local-server`) and Overlay UI (`apps/overlay-ui`) are already built and capable of running standalone.
- The user's system has the necessary runtime (e.g., Node.js) to execute the engine processes, or the plugin bundles the runtime.
