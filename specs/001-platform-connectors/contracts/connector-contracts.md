# Connector SDK Contract: Platform Connectors

**Feature Branch**: `001-platform-connectors`
**Date**: 2026-06-16

## Overview

This document defines the public interface contracts for the connector packages. All connectors extend `BaseConnector` from `@obs-chat/connector-sdk` and emit events conforming to `@obs-chat/event-schema`.

---

## 1. TwitchConnector Contract

**Package**: `@obs-chat/connector-twitch`
**Extends**: `BaseConnector` from `@obs-chat/connector-sdk`

### Constructor

```typescript
new TwitchConnector(config: TwitchConnectorConfig)
```

**TwitchConnectorConfig** extends `ConnectorOptions`:
```typescript
interface TwitchConnectorConfig {
  platform: 'twitch';          // Literal
  channelId: string;            // Resolved channel name (no '#' prefix)
  maxRetries?: number;          // Default: 10
  logLevel?: LogLevel;          // Default: 'info'
  logFilePath?: string;         // Default: auto-generated
}
```

### Input Resolution

| Input Format | Example | Resolved `channelId` |
|-------------|---------|---------------------|
| Bare username | `shroud` | `shroud` |
| Full URL | `https://www.twitch.tv/shroud` | `shroud` |
| URL with path segments | `https://twitch.tv/shroud/chat` | `shroud` |

### Events Emitted

| Event | Payload | When |
|-------|---------|------|
| `chat_message` | `ChatEvent` | Each new chat message received |
| `status_change` | `ConnectorStatus` | Any state transition |
| `log` | `LogEvent` | Info-level operational messages |
| `warning` | `LogEvent` | Non-critical issues (e.g., parse failure for single message) |
| `error` | `Error` | Unrecoverable errors |

### Lifecycle Methods

| Method | Return | Behavior |
|--------|--------|----------|
| `start()` | `Promise<void>` | Opens WebSocket to `wss://irc-ws.chat.twitch.tv:443`, authenticates as `justinfan`, joins channel. Transitions: IDLE → CONNECTING → CONNECTED |
| `stop()` | `Promise<void>` | Closes WebSocket, cleans up resources. Transitions: Any → IDLE |
| `pause()` | `void` | Stops emitting `chat_message` events (WebSocket remains open). Transitions: CONNECTED → PAUSED |
| `resume()` | `void` | Resumes emitting `chat_message` events. Transitions: PAUSED → CONNECTED |
| `reconnect()` | `Promise<void>` | Tears down and re-establishes WebSocket. Transitions: Any → RECONNECTING → CONNECTED |
| `getStatus()` | `ConnectorStatus` | Returns current lifecycle state |

---

## 2. YouTubeConnector Contract

**Package**: `@obs-chat/connector-youtube`
**Extends**: `BaseConnector` from `@obs-chat/connector-sdk`

### Constructor

```typescript
new YouTubeConnector(config: YouTubeConnectorConfig)
```

**YouTubeConnectorConfig** extends `ConnectorOptions`:
```typescript
interface YouTubeConnectorConfig {
  platform: 'youtube';          // Literal
  channelId: string;            // Resolved video ID, channel handle, or channel ID
  pollIntervalMs?: number;      // Default: 1000. Overrides YouTube-suggested interval
  maxRetries?: number;          // Default: 10
  waitingPollIntervalMs?: number; // Default: 30000
  logLevel?: LogLevel;          // Default: 'info'
  logFilePath?: string;         // Default: auto-generated
}
```

### Input Resolution

| Input Format | Example | Resolution Strategy |
|-------------|---------|-------------------|
| Video URL | `https://youtube.com/watch?v=VIDEO_ID` | Extract `VIDEO_ID` directly |
| Short URL | `https://youtu.be/VIDEO_ID` | Extract `VIDEO_ID` from path |
| Channel handle | `@ChannelName` | Fetch channel page → find active live stream → extract video ID |
| Channel URL | `https://youtube.com/@ChannelName` | Extract handle → resolve as above |
| Channel URL (live tab) | `https://youtube.com/@ChannelName/live` | Extract handle → resolve active live stream |

### Events Emitted

| Event | Payload | When |
|-------|---------|------|
| `chat_message` | `ChatEvent` | Each new chat message received per poll cycle |
| `status_change` | `ConnectorStatus` | Any state transition |
| `log` | `LogEvent` | Info-level operational messages |
| `warning` | `LogEvent` | Non-critical issues |
| `error` | `Error` | Unrecoverable errors |

### Lifecycle Methods

| Method | Return | Behavior |
|--------|--------|----------|
| `start()` | `Promise<void>` | Resolves video ID, fetches initial page, extracts continuation token, begins polling. Transitions: IDLE → CONNECTING → CONNECTED |
| `stop()` | `Promise<void>` | Stops polling loop, cleans up resources. Transitions: Any → IDLE |
| `pause()` | `void` | Continues polling (to maintain continuation token freshness) but stops emitting `chat_message` events. Transitions: CONNECTED → PAUSED |
| `resume()` | `void` | Resumes emitting `chat_message` events. Transitions: PAUSED → CONNECTED |
| `reconnect()` | `Promise<void>` | Re-fetches page and re-extracts continuation token. Transitions: Any → RECONNECTING → CONNECTED |
| `getStatus()` | `ConnectorStatus` | Returns current lifecycle state |

### WAITING State Behavior

When the YouTube connector detects the live stream has ended (InnerTube returns no continuation or signals stream end):
1. Transitions to `WAITING`
2. Polls the channel page at `waitingPollIntervalMs` intervals to check for a new live stream
3. When a new stream is detected, automatically transitions to `CONNECTING` → `CONNECTED`

---

## 3. Shared Utilities Contract

### `resolveInput(platform: Platform, input: string): ResolvedInput`

Parses and resolves the user-provided input string into a platform-specific identifier.

```typescript
interface ResolvedInput {
  platform: Platform;
  channelId: string;       // Normalized channel/video identifier
  originalInput: string;   // Preserved for logging
}
```

**Throws**: `InvalidInputError` if the input cannot be parsed.

### `createLogger(config: LoggerConfig): ConnectorLogger`

Creates a structured logger instance for a connector.

```typescript
interface LoggerConfig {
  connectorId: string;     // e.g., "twitch:shroud"
  level: LogLevel;
  filePath?: string;
}

interface ConnectorLogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}
```

The logger simultaneously:
1. Writes structured JSON to the configured log file
2. Emits `LogEvent` objects on the connector's EventEmitter
