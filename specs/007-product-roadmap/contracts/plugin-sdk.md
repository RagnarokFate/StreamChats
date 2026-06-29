# Plugin SDK Contract

**Version**: 1.0.0 | **Protocol**: JavaScript/TypeScript API (isolated-vm)

## Overview

The Plugin SDK defines how third-party plugins interact with StreamChats. Plugins run in V8 isolates (`isolated-vm`) and can only access host APIs that match their approved capabilities.

## Plugin Manifest

Every plugin must include a `streamchats-plugin.json` manifest:

```json
{
  "id": "tts-reader",
  "name": "Text-to-Speech Reader",
  "version": "1.0.0",
  "description": "Reads chat messages aloud using system TTS",
  "author": "community-dev",
  "main": "dist/index.js",
  "capabilities": ["notifications"],
  "events": ["chat", "gift", "superchat"],
  "settings": {
    "voice": { "type": "string", "default": "system", "label": "TTS Voice" },
    "speed": { "type": "number", "default": 1.0, "min": 0.5, "max": 2.0, "label": "Speed" }
  }
}
```

## Capability Definitions

| Capability | Grants Access To |
|-----------|-----------------|
| `network` | HTTP/HTTPS fetch to user-approved domains |
| `filesystem-read` | Read files within the plugin's own directory |
| `filesystem-write` | Write files within the plugin's data directory |
| `notifications` | Display system notifications and play sounds |
| `overlay-render` | Inject HTML/CSS into the OBS overlay |

## Plugin Lifecycle Hooks

```typescript
interface StreamChatsPlugin {
  /** Called when the plugin is first loaded */
  onActivate(context: PluginContext): Promise<void>;

  /** Called for each matching event (per manifest `events` filter) */
  onEvent(event: StreamEvent): Promise<void>;

  /** Called when the plugin is being disabled or uninstalled */
  onDeactivate(): Promise<void>;

  /** Called when the user changes a plugin setting */
  onSettingChange?(key: string, value: unknown): void;
}
```

## Plugin Context (Host API)

```typescript
interface PluginContext {
  /** Plugin metadata from manifest */
  readonly manifest: PluginManifest;

  /** Logger scoped to this plugin */
  readonly logger: PluginLogger;

  /** Access to plugin-specific persistent storage (key-value) */
  readonly storage: PluginStorage;

  /** Access to approved capabilities only */
  readonly capabilities: ApprovedCapabilities;

  /** Read current plugin settings */
  getSettings(): Record<string, unknown>;
}

interface PluginStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

interface PluginLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}
```

## Sandbox Enforcement

- Plugins run in `isolated-vm` V8 isolates — separate heap, no access to Node.js globals.
- Only APIs matching approved capabilities are injected into the isolate.
- Resource limits: 128MB memory per isolate, 5-second CPU timeout per `onEvent` call.
- If a plugin exceeds limits, the isolate is terminated and the plugin status is set to `error`.
- Plugins cannot access the Event Bus directly — they receive events via the `onEvent` callback.
