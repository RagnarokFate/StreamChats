# Data Model: Dashboard Controls Panel

**Branch**: `006-dashboard-controls` | **Date**: 2026-06-20

## Entities

### DashboardSettings (browser localStorage)

Display preferences persisted per browser instance.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `backgroundColor` | `string` (hex) | `"#1a1a1e"` | Dashboard background color |
| `fontFamily` | `string` | `"Inter"` | Overlay font family |
| `fontSize` | `number` (px) | `16` | Overlay font size |
| `fontWeight` | `number` | `400` | Overlay font weight (400, 600, 700) |
| `activeTheme` | `string` | `"glass"` | Currently selected overlay theme |
| `timestampMode` | `"relative" \| "absolute" \| "off"` | `"off"` | Message timestamp display mode |
| `emoteGlobalEnabled` | `boolean` | `true` | Global emote rendering toggle |
| `emotePlatformToggles` | `Record<Platform, boolean>` | `{ twitch: true, youtube: true, kick: true, tiktok: true }` | Per-platform emote toggles |

**Storage key**: `obs-chat-dashboard-settings`
**Lifecycle**: Created on first dashboard visit. Updated on every setting change. Never expires.

---

### ServerConfig (server-side JSON file)

Moderation and connector settings persisted across server restarts.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `bannedWords` | `string[]` | `["spam", "troll", "bot"]` | Words to filter from chat |
| `bannedWordAction` | `"mask" \| "drop" \| "flag"` | `"mask"` | Action to take on banned words |
| `maskCharacter` | `string` | `"*"` | Character used for masking |
| `spamProtectionEnabled` | `boolean` | `true` | Enable/disable spam protection |

**File path**: `<project-root>/config/server-settings.json`
**Lifecycle**: Created with defaults on first server start if missing. Updated atomically on dashboard changes. Read on server startup.

---

### PlatformStatus (in-memory, server-side)

Live state of each platform connector, broadcast to dashboard clients.

| Field | Type | Description |
|-------|------|-------------|
| `platform` | `Platform` | Platform identifier (twitch, youtube, kick, tiktok) |
| `status` | `ConnectorStatus` | Current status (IDLE, CONNECTING, CONNECTED, WAITING, RECONNECTING, ERROR) |
| `lastError` | `string \| null` | Last error message, if any |
| `reconnectCount` | `number` | Number of reconnection attempts |
| `lastConnectedAt` | `string \| null` | ISO timestamp of last successful connection |
| `channelId` | `string` | Configured channel identifier |

**Lifecycle**: Created when connector is initialized. Updated on every status change event. Reset on server restart.

---

### StreamStatistics (in-memory, server-side)

Real-time engagement metrics tracked per platform.

| Field | Type | Description |
|-------|------|-------------|
| `platform` | `Platform` | Platform identifier |
| `totalMessages` | `number` | Total messages received this session |
| `uniqueChatters` | `number` | Count of unique author IDs |
| `messagesPerMinute` | `number` | Messages in the last 60-second sliding window |

**Aggregate**: A combined `StreamStatistics` entry is computed by summing `totalMessages`, `uniqueChatters`, and `messagesPerMinute` across all platforms.

**Lifecycle**: Initialized to zero on server start. Incremented on each `chat_message` event. Reset to zero on server restart or manual "Reset Stats" command.

---

### SettingsChangeEvent (WebSocket event)

Broadcast from server to all connected overlay clients when a display setting changes.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"settings_update"` | Event type discriminator |
| `settings` | `Partial<DashboardSettings>` | Changed settings key-value pairs |

---

### CommandEvent (WebSocket event, client → server)

Sent from dashboard to server to trigger actions.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"command"` | Event type discriminator |
| `action` | `string` | Command action identifier |
| `payload` | `object` | Action-specific payload |

**Supported actions**:

| Action | Payload | Effect |
|--------|---------|--------|
| `clear_chat` | `{}` | Broadcasts `clear_chat` moderation event to all clients |
| `update_settings` | `{ settings: Partial<DashboardSettings> }` | Broadcasts settings to all overlays |
| `update_moderation` | `{ config: Partial<ServerConfig> }` | Updates server config + moderation pipeline |
| `reconnect_platform` | `{ platform: Platform }` | Triggers reconnect on specified connector |
| `reset_stats` | `{}` | Resets all statistics counters to zero |

---

### StatusBroadcast (WebSocket event, server → dashboard)

Periodic broadcast of platform health and statistics to dashboard clients.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"status_update"` | Event type discriminator |
| `platforms` | `PlatformStatus[]` | Current status of all connectors |
| `statistics` | `StreamStatistics[]` | Current stats for all platforms |
| `serverConfig` | `ServerConfig` | Current moderation config |

**Broadcast interval**: Every 2 seconds while at least one dashboard client is connected.

## State Transitions

### ConnectorStatus (existing, no changes)

```
IDLE → CONNECTING → CONNECTED → PAUSED → CONNECTED
                  → WAITING → CONNECTING (retry)
                  → ERROR → RECONNECTING → CONNECTING
```

### DashboardSettings Lifecycle

```
[First Visit] → Load defaults → [User changes setting] → Save to localStorage + Send via WS → [Server broadcasts to overlays]
[Return Visit] → Load from localStorage → [User changes setting] → Save + Send → [Broadcast]
```

## Validation Rules

- `backgroundColor` must be a valid hex color string (`#RRGGBB`)
- `fontFamily` must be one of the allowed font families
- `fontSize` must be between 10 and 48 (pixels)
- `fontWeight` must be one of: 400, 600, 700
- `activeTheme` must be one of the 9 valid theme identifiers
- `bannedWords` entries must be non-empty strings, max 100 entries
- `maskCharacter` must be exactly 1 character
