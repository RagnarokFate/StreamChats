# WebSocket Command Protocol v2

**Version**: 2.0.0 | **Protocol**: WebSocket JSON

## Overview

Extends the existing WebSocket command protocol (v1) with new commands for the expanded dashboard, reply-to-platform, session management, analytics, and plugin communication.

## Existing Commands (v1 — unchanged)

| Direction | Action | Payload |
|-----------|--------|---------|
| Client → Server | `clear_chat` | `{}` |
| Client → Server | `update_settings` | `{ settings: Partial<DashboardSettings> }` |
| Client → Server | `update_moderation` | `{ config: Partial<ServerConfig> }` |
| Client → Server | `reconnect_platform` | `{ platform: Platform }` |
| Client → Server | `reset_stats` | `{}` |
| Server → Client | `settings_update` | `{ settings: Partial<DashboardSettings> }` |
| Server → Client | `status_update` | `{ platforms, statistics, serverConfig }` |

## New Commands (v2)

### Client → Server

#### `reply_message`
Send a reply to a specific platform's chat.

```json
{
  "type": "command",
  "action": "reply_message",
  "payload": {
    "platform": "twitch",
    "message": "Hello from the dashboard!",
    "replyToEventId": "uuid-optional"
  }
}
```

**Response**: `reply_status` event (see below).

#### `place_marker`
Log a stream marker at the current timestamp.

```json
{
  "type": "command",
  "action": "place_marker",
  "payload": {
    "label": "highlight"
  }
}
```

#### `switch_view_mode`
Change the dashboard chat view mode.

```json
{
  "type": "command",
  "action": "switch_view_mode",
  "payload": {
    "mode": "unified" | "split" | "priority" | "moderator"
  }
}
```

#### `link_identity`
Link a platform account to a viewer identity.

```json
{
  "type": "command",
  "action": "link_identity",
  "payload": {
    "identityId": "uuid-or-null",
    "platform": "twitch",
    "platformUserId": "user123",
    "platformUsername": "JohnYT",
    "method": "manual"
  }
}
```

#### `update_reputation_weights`
Update the streamer's reputation score category weights.

```json
{
  "type": "command",
  "action": "update_reputation_weights",
  "payload": {
    "weights": {
      "messages": 1.0,
      "gifts": 2.0,
      "watch_time": 1.5,
      "engagement": 1.0,
      "mod_actions": -3.0,
      "spam_flags": -2.0
    }
  }
}
```

#### `export_session`
Request a session data export.

```json
{
  "type": "command",
  "action": "export_session",
  "payload": {
    "sessionId": "uuid",
    "format": "csv" | "timestamped_log",
    "includeModeration": true
  }
}
```

#### `manage_plugin`
Install, enable, disable, or uninstall a plugin.

```json
{
  "type": "command",
  "action": "manage_plugin",
  "payload": {
    "pluginId": "tts-reader",
    "operation": "install" | "enable" | "disable" | "uninstall",
    "capabilities": ["network", "notifications"]
  }
}
```

### Server → Client

#### `stream_event`
Unified event dispatch for all event types (replaces direct `chat_message` broadcast).

```json
{
  "type": "stream_event",
  "event": {
    "eventId": "uuid",
    "sequenceNumber": 12345,
    "platform": "twitch",
    "type": "chat",
    "timestamp": "2026-06-27T12:00:00Z",
    "author": { ... },
    "message": { ... },
    "moderationStatus": "visible"
  }
}
```

#### `reply_status`
Acknowledgement of a reply_message command.

```json
{
  "type": "reply_status",
  "platform": "twitch",
  "status": "sent" | "failed" | "read_only",
  "error": "Platform does not support outbound messages"
}
```

#### `analytics_report`
Post-stream analytics summary.

```json
{
  "type": "analytics_report",
  "sessionId": "uuid",
  "metrics": {
    "messagesPerMinute": [...],
    "platformShare": { "twitch": 0.6, "youtube": 0.4 },
    "topChatters": [...],
    "peakEngagement": { "startTime": "...", "endTime": "...", "rate": 42 }
  }
}
```

#### `export_ready`
Notification that a requested export is ready for download.

```json
{
  "type": "export_ready",
  "sessionId": "uuid",
  "format": "csv",
  "downloadPath": "/exports/session-uuid.csv",
  "sizeBytes": 1234567
}
```

#### `plugin_status`
Plugin lifecycle update.

```json
{
  "type": "plugin_status",
  "pluginId": "tts-reader",
  "status": "active" | "error" | "disabled",
  "error": "Optional error message"
}
```

#### `identity_update`
Viewer identity change notification.

```json
{
  "type": "identity_update",
  "identity": {
    "identityId": "uuid",
    "displayName": "John",
    "reputationScore": 72.5,
    "accounts": [...]
  }
}
```

## Backward Compatibility

- v1 `chat_message` events continue to be broadcast for existing overlay consumers.
- v2 adds the `stream_event` wrapper for new consumers that need sequence numbers and moderation status.
- Clients send a `protocol_version` field on connection handshake to indicate v1 or v2 support.
