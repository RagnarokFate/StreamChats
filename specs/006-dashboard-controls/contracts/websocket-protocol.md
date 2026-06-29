# WebSocket Command Protocol

**Branch**: `006-dashboard-controls` | **Date**: 2026-06-20

## Overview

All communication between the dashboard and server uses the existing WebSocket connection on port 9090. Messages are JSON-encoded and discriminated by the `type` field.

## Message Types

### Existing (unchanged)

| Type | Direction | Description |
|------|-----------|-------------|
| `chat` | Server → Client | Chat message from a platform connector |
| `moderation` | Server → Client | Moderation event (clear_chat, ban, timeout) |

### New

| Type | Direction | Description |
|------|-----------|-------------|
| `command` | Client → Server | Dashboard command (clear chat, update settings, reconnect, etc.) |
| `settings_update` | Server → Client | Broadcast of changed display settings to all overlay clients |
| `status_update` | Server → Client | Periodic broadcast of platform health + statistics |

## Command Messages (Client → Server)

### `clear_chat`

```json
{
  "type": "command",
  "action": "clear_chat",
  "payload": {}
}
```

**Server behavior**: Broadcasts a `moderation` event with `action: "clear_chat"` to all connected clients.

---

### `update_settings`

```json
{
  "type": "command",
  "action": "update_settings",
  "payload": {
    "settings": {
      "fontFamily": "Fira Code",
      "fontSize": 14,
      "activeTheme": "neon"
    }
  }
}
```

**Server behavior**: Broadcasts a `settings_update` event to all connected overlay clients (excluding the sender dashboard, which already applied the change locally).

---

### `update_moderation`

```json
{
  "type": "command",
  "action": "update_moderation",
  "payload": {
    "config": {
      "bannedWords": ["spam", "troll", "bot", "follow4follow"],
      "bannedWordAction": "drop",
      "spamProtectionEnabled": true
    }
  }
}
```

**Server behavior**: Updates the in-memory moderation pipeline config, writes to `config/server-settings.json`, and broadcasts an acknowledgment.

---

### `reconnect_platform`

```json
{
  "type": "command",
  "action": "reconnect_platform",
  "payload": {
    "platform": "youtube"
  }
}
```

**Server behavior**: Calls `connector.reconnect()` on the specified platform's connector. Status changes are reflected in the next `status_update` broadcast.

---

### `reset_stats`

```json
{
  "type": "command",
  "action": "reset_stats",
  "payload": {}
}
```

**Server behavior**: Resets all statistics counters (totalMessages, uniqueChatters, messagesPerMinute sliding window) to zero for all platforms. Broadcasts updated stats immediately.

## Server Broadcast Messages (Server → Client)

### `settings_update`

```json
{
  "type": "settings_update",
  "settings": {
    "fontFamily": "Fira Code",
    "fontSize": 14,
    "activeTheme": "neon"
  }
}
```

**Client behavior**: Overlay clients apply the received settings as CSS custom property overrides. Dashboard clients update their local state to stay in sync (multi-tab support).

---

### `status_update`

```json
{
  "type": "status_update",
  "platforms": [
    {
      "platform": "twitch",
      "status": "CONNECTED",
      "lastError": null,
      "reconnectCount": 0,
      "lastConnectedAt": "2026-06-20T16:00:00.000Z",
      "channelId": "ragnarokfate"
    },
    {
      "platform": "youtube",
      "status": "WAITING",
      "lastError": null,
      "reconnectCount": 0,
      "lastConnectedAt": null,
      "channelId": "@RagnarokFate"
    }
  ],
  "statistics": [
    {
      "platform": "twitch",
      "totalMessages": 142,
      "uniqueChatters": 28,
      "messagesPerMinute": 12
    },
    {
      "platform": "youtube",
      "totalMessages": 0,
      "uniqueChatters": 0,
      "messagesPerMinute": 0
    }
  ],
  "serverConfig": {
    "bannedWords": ["spam", "troll", "bot"],
    "bannedWordAction": "mask",
    "maskCharacter": "*",
    "spamProtectionEnabled": true
  }
}
```

**Broadcast interval**: Every 2 seconds while at least one client is connected.

## Error Handling

- Malformed JSON messages from clients are silently ignored with a server-side log warning.
- Unknown `action` values return a `{ type: "error", message: "Unknown action: ..." }` response to the sender only.
- Server config write failures are logged and the client receives a `{ type: "error", message: "Failed to save config" }` response.
