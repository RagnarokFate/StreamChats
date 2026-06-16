# Quickstart: OBS Plugin Wrapper

## Prerequisites

- OBS Studio v28 or higher.
- Node.js v18+ installed on your system.

## Installation

1. Open OBS Studio.
2. Go to **Tools > Scripts**.
3. Click the `+` button and browse to `plugins/obs/obs-chat-aggregator.lua`.
4. In the settings panel on the right side of the Scripts window, enter your Twitch and/or YouTube channel IDs.
5. The local engine will automatically start in the background.

## Adding the Overlay

1. In your OBS Scenes panel, add a new **Browser Source**.
2. Set the URL to `http://localhost:9090`.
3. Set the dimensions (e.g., Width: 400, Height: 800).
4. **Important**: Leave "Custom CSS" empty or ensure the background is set to transparent (`rgba(0,0,0,0)`).
5. The unified chat will now appear over your stream feed!
