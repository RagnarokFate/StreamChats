# System Design Document (SDD)
**Project**: OBS Multi-Platform Realtime Chat Aggregation Engine
**Version**: 1.0.0

## 1. System Architecture & Context

The OBS Multi-Platform Realtime Chat Aggregation Engine is designed to unify chat streams from various broadcasting platforms directly into OBS Studio. 

### 1.1 Core Objectives
- **Local-First Execution**: Minimize reliance on external web APIs by extracting chat data directly from stream URLs on the local machine.
- **Low-Resource Environments**: Ensure minimal CPU/RAM overhead so stream encoding performance in OBS is unaffected.
- **High Stability**: Guarantee stable execution over multi-hour broadcasting sessions with zero memory leaks and robust failure recovery.

### 1.2 High-Level Architecture
The system consists of the following primary components:
1. **OBS Plugin**: The entry point inside OBS Studio, managing settings, browser source configurations, and acting as the host for the overlay.
2. **Local Overlay Server**: A lightweight, locally hosted web server that aggregates normalized chat events and serves the realtime frontend overlay to OBS.
3. **Connector Framework (Extractors)**: Platform-specific modules that acquire chat data via Playwright or native WebSockets.
4. **Realtime Event Bus**: The central nervous system passing normalized events between extractors, the moderation pipeline, and the Local Overlay Server.

---

## 2. Component Design

### 2.1 Connector Framework
The framework allows for open-source extensibility. Connectors are isolated instances managed by the **Connector Lifecycle Manager**.
- **WebSocket Interception Model**: Preferred method for platforms utilizing unencrypted or easily introspectable WebSockets. Intercepts incoming JSON payloads, maps them to the normalized schema, and forwards them to the Event Bus.
- **Playwright DOM Mutation Model**: Fallback method for platforms where WebSockets are obfuscated. Uses Playwright in head-less mode to observe DOM mutations on the chat frame, extracting user and message data securely.
- **Connector Lifecycle Management**: Handles automatic connection retries, backoff strategies, and session refreshing without restarting the entire engine.

### 2.2 Local Overlay Server
- Implemented as a lightweight HTTP and WebSocket server.
- Serves the compiled UI overlay (HTML/CSS/JS).
- Broadcasts the aggregated and moderated `ChatEvent` objects over WebSockets to the overlay.

### 2.3 Moderation Pipeline
- Intercepts messages before they hit the Realtime Event Bus.
- Applies local filtering rules (banned words, regex patterns, user blacklists).
- Pluggable architecture allowing future integration of external AI moderation tools if explicitly configured by the user.

---

## 3. Data Flow & Realtime Event Schema

### 3.1 Data Flow Sequence
1. **Extraction**: Connector (WebSocket/DOM) captures raw chat data.
2. **Normalization**: Raw data is mapped to the standard `ChatEvent` schema.
3. **Moderation**: `ChatEvent` passes through the moderation pipeline. Valid events are forwarded.
4. **Aggregation**: Realtime Event Bus receives the event and pushes it to the Local Overlay Server.
5. **Rendering**: Local Overlay Server pushes the event to the OBS Browser Source.

### 3.2 Realtime Event Schema (Draft)
```json
{
  "eventId": "uuid-v4",
  "platform": "youtube | twitch | kick | custom",
  "timestamp": "ISO-8601",
  "author": {
    "id": "platform-specific-id",
    "name": "Username",
    "badges": ["moderator", "subscriber"],
    "color": "#FF0000"
  },
  "message": {
    "text": "Hello stream!",
    "emotes": [
      { "id": "emote1", "startIndex": 0, "endIndex": 5, "url": "..." }
    ]
  }
}
```

---

## 4. Performance & Memory Management

### 4.1 Anti-Memory-Leak Architecture
- **Event Expiration**: The Event Bus retains only the last N messages (e.g., 500) to prevent unbounded memory growth.
- **Playwright Context Isolation**: Browser contexts are forcefully recycled at configurable intervals (e.g., every 4 hours) during low chat volume moments to reclaim memory.
- **Garbage Collection (GC) Optimization**: Memory allocations inside the extraction loop are reused (Object Pooling) to reduce GC pressure.

### 4.2 Failure Recovery & Reconnection Design
- Connectors run with isolated retry loops using exponential backoff.
- If Playwright crashes, the lifecycle manager silently spins up a new instance and resumes extraction within seconds.
- The OBS plugin automatically re-establishes its WebSocket connection to the Local Overlay Server if dropped.

---

## 5. Security Architecture
- The Local Overlay Server binds strictly to `localhost` (127.0.0.1) and rejects external connections by default.
- Extracted credentials (if any) or session cookies used by Playwright are strictly stored in an encrypted local keystore.
- DOM mutation extraction runs in highly restricted browser contexts (sandboxed) to prevent malicious scripts from executing.

---

## 6. Monorepo Structure & CI/CD
- **Structure**: Managed as a unified monorepo containing the Core Engine, UI Overlay, Connectors, and OBS Plugin wrapper.
- **CI/CD**: Automated testing (unit and contract tests) for the Event Bus and Connectors. Automated build pipelines for OBS Plugin binaries and the Playwright executable bundle.
