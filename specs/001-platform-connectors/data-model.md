# Data Model: Platform Chat Connectors

**Feature Branch**: `001-platform-connectors`
**Date**: 2026-06-16

## Entities

### ConnectorStatus (Enum — extends existing SDK)

The existing `ConnectorStatus` enum in `@obs-chat/connector-sdk` must be extended with the `WAITING` state.

| Value | Description |
|-------|-------------|
| `IDLE` | Not started |
| `CONNECTING` | Bootstrapping connection (WebSocket handshake or initial page fetch) |
| `CONNECTED` | Actively extracting and emitting chat data |
| `PAUSED` | Temporarily ignoring incoming events |
| `RECONNECTING` | Recovering from a connection drop |
| `WAITING` | Stream ended; periodically checking for a new stream |
| `ERROR` | Unrecoverable error (max retries exhausted) |

**State Transitions**:

```
IDLE → CONNECTING → CONNECTED ↔ PAUSED
                  ↘ RECONNECTING → CONNECTED (success) or ERROR (max retries)
                  ↘ WAITING → CONNECTING (new stream detected)
CONNECTED → WAITING (stream ended)
Any → ERROR (unrecoverable)
Any → IDLE (stop() called)
```

---

### ConnectorConfig

User-provided configuration for a connector instance.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `platform` | `Platform` | Yes | — | Target platform (`twitch` or `youtube`) |
| `input` | `string` | Yes | — | Channel URL, username, or handle |
| `pollIntervalMs` | `number` | No | `1000` (YT) / N/A (Twitch) | Retrieval interval in milliseconds. For Twitch (WebSocket push), this is ignored. For YouTube (HTTP poll), this overrides the YouTube-suggested interval. |
| `maxRetries` | `number` | No | `10` | Maximum reconnection attempts before transitioning to ERROR |
| `waitingPollIntervalMs` | `number` | No | `30000` | How often to check for a new stream when in WAITING state |
| `logLevel` | `LogLevel` | No | `'info'` | Minimum log level for file logging (`debug`, `info`, `warn`, `error`) |
| `logFilePath` | `string` | No | Auto-generated | Path for the log file output |

**Validation Rules**:
- `input` must be a non-empty string
- `pollIntervalMs` must be >= 100 if provided
- `maxRetries` must be >= 1 if provided
- `waitingPollIntervalMs` must be >= 5000 if provided

---

### ConnectorMetrics (Internal)

Runtime metrics tracked by each connector instance for observability.

| Field | Type | Description |
|-------|------|-------------|
| `messagesReceived` | `number` | Total chat messages received since start |
| `messagesEmitted` | `number` | Total chat messages emitted (excludes paused period) |
| `reconnectCount` | `number` | Number of reconnections performed |
| `currentRetryCount` | `number` | Current consecutive retry count (resets on success) |
| `lastMessageAt` | `Date \| null` | Timestamp of last received message |
| `startedAt` | `Date` | Timestamp when connector was started |
| `memoryUsageMB` | `number` | Current memory usage estimate |

---

### TwitchIRCMessage (Internal — parsed from raw IRC)

Intermediate representation parsed from Twitch IRC `PRIVMSG` lines before normalization to ChatEvent.

| Field | Type | Description |
|-------|------|-------------|
| `tags` | `Map<string, string>` | IRC tags (display-name, color, badges, emotes, user-id, etc.) |
| `channel` | `string` | Channel name (without `#` prefix) |
| `username` | `string` | Sender's login name |
| `message` | `string` | Raw message text |

---

### YouTubeChatAction (Internal — parsed from InnerTube response)

Intermediate representation parsed from YouTube InnerTube API response before normalization to ChatEvent.

| Field | Type | Description |
|-------|------|-------------|
| `authorName` | `string` | Display name |
| `authorChannelId` | `string` | YouTube channel ID |
| `authorBadges` | `string[]` | Badge identifiers (owner, moderator, member) |
| `messageRuns` | `Array<TextRun \| EmojiRun>` | Parsed message segments |
| `timestampUsec` | `string` | Microsecond timestamp from YouTube |
| `id` | `string` | YouTube's internal message ID |

**TextRun**: `{ text: string }`
**EmojiRun**: `{ emoji: { emojiId: string, image: { url: string }, label: string } }`

---

### LogEvent (Observability)

Structured log entry emitted both as EventEmitter events and written to file.

| Field | Type | Description |
|-------|------|-------------|
| `level` | `LogLevel` | `debug`, `info`, `warn`, `error` |
| `timestamp` | `string` | ISO-8601 timestamp |
| `connector` | `string` | Connector identifier (`twitch:<channel>` or `youtube:<input>`) |
| `message` | `string` | Human-readable log message |
| `data` | `Record<string, unknown> \| undefined` | Optional structured context data |

---

## Relationships

```
ConnectorConfig ──1:1──▶ BaseConnector instance
BaseConnector ──emits──▶ ChatEvent (from @obs-chat/event-schema)
BaseConnector ──emits──▶ LogEvent
BaseConnector ──tracks──▶ ConnectorMetrics
BaseConnector ──has──▶ ConnectorStatus

TwitchConnector ──parses──▶ TwitchIRCMessage ──normalizes──▶ ChatEvent
YouTubeConnector ──parses──▶ YouTubeChatAction ──normalizes──▶ ChatEvent
```
