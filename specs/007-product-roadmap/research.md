# Research: StreamChats Product Roadmap

**Branch**: `007-product-roadmap` | **Date**: 2026-06-27

## R1: Event Bus Architecture for Node.js

**Decision**: Use an in-process event bus backed by `better-sqlite3` with WAL mode for event persistence and consumer offset tracking.

**Rationale**: The current architecture uses Node.js `EventEmitter` (via `BaseConnector`) with direct coupling to the `ModerationPipeline` and `ChatServer`. Moving to a persist-first event bus allows at-least-once delivery with consumer-managed offsets. `better-sqlite3` is the industry standard for embedded SQLite in Node.js — synchronous API, faster than async wrappers, WAL mode enables concurrent reads during writes.

**Alternatives considered**:
- **Redis Streams**: Adds an external dependency, violates local-first principle.
- **LevelDB/RocksDB**: Faster for write-heavy workloads but lacks SQL query capability needed for analytics.
- **Node.js built-in `node:sqlite`**: Available but less mature than `better-sqlite3`; missing battle-tested edge case handling.

## R2: Durable Local Storage (Database)

**Decision**: `better-sqlite3` with WAL journal mode, worker thread for write batching.

**Rationale**: SQLite is the ideal embedded database for a local-first desktop application. The synchronous API of `better-sqlite3` is actually an advantage for SQLite (single-writer). WAL mode allows the overlay/dashboard to read while the server writes. A worker thread can batch high-frequency writes to prevent main-thread blocking during peak chat activity.

**Alternatives considered**:
- **RocksDB**: Faster writes but no SQL queries — analytics would require custom aggregation code.
- **DuckDB**: Good for analytics but overkill for event logging; larger footprint.
- **Flat files (JSONL)**: Simple but no indexing, no efficient querying, no transaction safety.

## R3: Plugin Sandbox Technology

**Decision**: `isolated-vm` for V8 isolate-based sandboxing with capability-based permission gating.

**Rationale**: `vm2` is deprecated with critical CVEs. `isolated-vm` creates true separate V8 isolates with strong memory and context isolation. Plugins run in isolated contexts with only explicitly exposed APIs available. The capability manifest (from spec clarification) maps to which host APIs are injected into the isolate at load time.

**Alternatives considered**:
- **vm2**: Deprecated, critical sandbox escape vulnerabilities, fundamentally insecure.
- **Worker threads**: Not a security boundary — shares process environment.
- **MicroVMs (Firecracker)**: Maximum isolation but extreme complexity for a desktop app.
- **WebAssembly (WASI)**: Strong sandbox but limits plugin language to WASM-compilable languages; most plugin authors expect JavaScript/TypeScript.

## R4: Local AI Toxicity Detection

**Decision**: Quantized MiniLMv2 model via `onnxruntime-node` with `transformers.js` for tokenization.

**Rationale**: A quantized MiniLMv2 toxic-jigsaw ONNX model (~80MB) runs on consumer CPUs with millisecond-range latency per message. `onnxruntime-node` is optimized for CPU inference. The model runs entirely in-process, zero data leaves the machine. Combined with the existing keyword-based filter in the moderation pipeline, this provides a layered defense.

**Alternatives considered**:
- **Cloud APIs (Perspective API)**: Violates local-first principle; requires internet.
- **Full-size BERT models**: Too large (400MB+), too slow for real-time chat on consumer hardware.
- **Regex/keyword-only**: Current approach — insufficient for context-sensitive toxicity.

## R5: Native Desktop Wrapper

**Decision**: Tauri v2 with Node.js backend as sidecar binary (packaged via `pkg`).

**Rationale**: Tauri v2 produces lightweight installers (10-30MB base) using the OS's native webview. The existing Node.js backend is packaged into a standalone binary using `pkg` and configured as a Tauri sidecar (`bundle.externalBin`). The React frontend is served by the Tauri webview directly. Communication between the Tauri shell and the Node.js sidecar happens via the existing WebSocket, maintaining architectural consistency.

**Alternatives considered**:
- **Electron**: Much larger bundle size (200MB+), heavier memory footprint, violates low-resource principle.
- **Neutralinojs**: Lighter than Electron but less mature ecosystem and fewer packaging options.
- **Standalone Node.js installer (nexe/pkg only)**: No native window management, no OS integration (tray icon, notifications).

## R6: OBS WebSocket Integration

**Decision**: `obs-websocket-js` targeting the v5 protocol (built into OBS Studio 28+).

**Rationale**: OBS Studio 28+ ships with obs-websocket v5 built-in (no separate plugin needed). The `obs-websocket-js` library provides a clean async API for all v5 requests: `CreateInput` for browser sources, `SetCurrentProgramScene` for scene switching, `GetInputList` for health monitoring. The v4 protocol is deprecated and unsupported in modern OBS.

**Alternatives considered**:
- **obs-websocket v4**: Deprecated, requires separate plugin installation, incompatible with OBS 30+.
- **OBS Lua script only (current approach)**: Limited — can't programmatically create sources or switch scenes from external processes.
- **NDI integration directly**: Only relevant for Studio Edition (B2B); not applicable to consumer product.

## R7: Cross-Platform Identity Linking

**Decision**: Manual linking via dashboard with fuzzy-match suggestions, stored in local SQLite database.

**Rationale**: Automated cross-platform identity resolution is error-prone (username similarity doesn't guarantee same person). The spec requires <1% false-positive rate (SC-010). A manual-link-with-suggestions approach lets the streamer confirm links while the system suggests candidates based on username similarity (Levenshtein distance), simultaneous activity patterns, and self-identification (viewers can claim identity via a chat command).

**Alternatives considered**:
- **Fully automated matching**: High false-positive risk; streamers would lose trust.
- **OAuth-based verification**: Requires viewers to authenticate — too much friction, violates local-first.
- **No suggestions (fully manual)**: Works but provides poor UX for streamers with large communities.

## R8: Session Data Retention & Rotation

**Decision**: SQLite-based sessions with 14-day default TTL, VACUUM on rotation, 80% disk warning.

**Rationale**: Per spec clarification, 14 days is the default retention. A background timer checks session age on startup and every hour. Sessions older than the retention period are deleted in a transaction, followed by `PRAGMA incremental_vacuum` to reclaim space. Disk usage is monitored via `PRAGMA page_count * PRAGMA page_size` compared to a configurable max (default: 2GB).

**Alternatives considered**:
- **Rolling file-based logs**: No transaction safety, harder to query for analytics.
- **External archival**: Violates local-first; adds complexity.
