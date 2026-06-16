# Data Model & Interface Contracts: OBS Plugin

## OBS Settings Profile (Local Configuration)

The OBS Lua script automatically persists its state via the OBS `obs_data_t` object. The key properties stored are:

- `twitch_channel`: (String) The Twitch username to monitor.
- `youtube_channel`: (String) The YouTube channel ID or username to monitor.
- `server_port`: (Integer, default 9090) The port on which the Node.js server will run.

## Command-Line Contract (Plugin to Local Server)

When the Lua script spawns the Local Server, it passes the configuration as command-line arguments or environment variables to the Node process:

```bash
node apps/local-server/dist/index.js --twitch="<channel>" --youtube="<channel>" --port=9090
```

*This acts as the primary interface between the OBS plugin and the underlying extraction engine.*
