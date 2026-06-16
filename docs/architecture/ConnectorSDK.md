# Connector SDK Specification
**Project**: OBS Multi-Platform Realtime Chat Aggregation Engine
**Version**: 1.0.0

## 1. Overview
The Connector SDK (`@obs-chat/connector-sdk`) provides the base architecture for all platform extractors (YouTube, Twitch, Kick). By enforcing a strict interface, the Local Overlay Server can manage any connector agnostically, ensuring robust stability during long broadcasting sessions.

## 2. Core Concepts

### 2.1 Standardized Event Emission
All connectors MUST use Node.js `EventEmitter` to dispatch events.
The primary event dispatched is `"chat_message"`, which carries a payload strictly validated by the `@obs-chat/event-schema` (`ChatEvent` type).

### 2.2 Connector State Machine
A Connector's lifecycle is represented by the `ConnectorStatus` enum:
- `IDLE`: Not started.
- `CONNECTING`: Bootstrapping Playwright or negotiating WebSockets.
- `CONNECTED`: Successfully extracting data.
- `PAUSED`: Temporarily ignoring events (e.g., to shed load).
- `RECONNECTING`: Attempting to recover from a failure.
- `ERROR`: Unrecoverable state.

### 2.3 Required Lifecycle Methods
All extractors must implement the `BaseConnector` abstract class, which enforces:
- `start()`: Initializes the connection.
- `stop()`: Safely tears down resources (closing browser contexts, sockets).
- `pause()`: Halts event emission temporarily without killing the connection.
- `resume()`: Restores event emission.
- `reconnect()`: A forceful teardown and restart, utilized for anti-memory leak routines.
- `getStatus()`: Returns the current `ConnectorStatus`.

## 3. Failure Recovery
The Local Server's Connector Lifecycle Manager will actively monitor the SDK's `status` event. If a connector emits an `ERROR` state, the manager will invoke `reconnect()` with an exponential backoff strategy (1s, 2s, 4s, 8s, up to 60s).

## 4. Playwright Specific Guidelines
For extractors utilizing the Playwright DOM Mutation model:
- **Memory Caps**: The connector MUST track memory usage. If approaching the limit, it should self-invoke `reconnect()` during low-chat periods.
- **Headless Mode**: Always run headless.
- **Sandboxing**: Browser contexts must disable images, CSS, and media to minimize CPU footprint.
