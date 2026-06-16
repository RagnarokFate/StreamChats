# OBS Chat Aggregator Plugin

This plugin integrates the OBS Multi-Platform Realtime Chat Aggregator engine directly into OBS Studio.

## Prerequisites

- OBS Studio v28 or higher
- Node.js v18+ installed on your system

## Installation

1. Open OBS Studio.
2. Go to **Tools > Scripts**.
3. Click the `+` button and browse to this directory (`plugins/obs/`) to select `obs-chat-aggregator.lua`.
4. In the settings panel on the right side of the Scripts window, enter your **Twitch Channel** and/or **YouTube Channel**.
5. The background server will start automatically.

## Adding the Overlay

1. In your OBS Scenes panel, add a new **Browser Source**.
2. Set the URL to `http://localhost:9090` (or whatever custom port you defined).
3. Set the dimensions (e.g., Width: 400, Height: 800).
4. **Important**: Ensure the background is transparent by leaving "Custom CSS" default or setting background color to `rgba(0,0,0,0)`.
5. The unified chat will now appear over your stream feed!
