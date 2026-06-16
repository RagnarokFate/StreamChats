# Quickstart: Platform Chat Connectors

**Feature Branch**: `001-platform-connectors`
**Date**: 2026-06-16

## Prerequisites

- Node.js >= 18
- npm (workspace-aware)
- The monorepo packages (`@obs-chat/event-schema`, `@obs-chat/connector-sdk`) must be built first

## Setup

```bash
# From repository root
npm install
npm run build   # Builds all workspace packages
```

## Usage: Twitch Connector

```typescript
import { TwitchConnector } from '@obs-chat/connector-twitch';

const connector = new TwitchConnector({
  platform: 'twitch',
  channelId: 'shroud',       // or 'https://twitch.tv/shroud'
  maxRetries: 10,
  logLevel: 'info',
});

// Listen for chat messages
connector.on('chat_message', (event) => {
  console.log(`[${event.author.name}]: ${event.message.text}`);
});

// Listen for status changes
connector.on('status_change', (status) => {
  console.log(`Connector status: ${status}`);
});

// Listen for errors
connector.on('error', (err) => {
  console.error('Connector error:', err.message);
});

// Start extracting
await connector.start();

// Later: pause, resume, stop
connector.pause();
connector.resume();
await connector.stop();
```

## Usage: YouTube Connector

```typescript
import { YouTubeConnector } from '@obs-chat/connector-youtube';

const connector = new YouTubeConnector({
  platform: 'youtube',
  channelId: 'https://youtube.com/watch?v=VIDEO_ID', // or '@ChannelName'
  pollIntervalMs: 1000,       // Poll every 1 second
  maxRetries: 10,
  waitingPollIntervalMs: 30000,
  logLevel: 'info',
});

connector.on('chat_message', (event) => {
  console.log(`[${event.author.name}]: ${event.message.text}`);
});

connector.on('status_change', (status) => {
  console.log(`Connector status: ${status}`);
  if (status === 'WAITING') {
    console.log('Stream ended — waiting for a new stream...');
  }
});

await connector.start();
```

## Running Both Connectors Simultaneously

```typescript
const twitch = new TwitchConnector({ platform: 'twitch', channelId: 'shroud' });
const youtube = new YouTubeConnector({ platform: 'youtube', channelId: '@SomeChannel' });

// Both emit the same ChatEvent shape
const handler = (event) => {
  console.log(`[${event.platform}] ${event.author.name}: ${event.message.text}`);
};

twitch.on('chat_message', handler);
youtube.on('chat_message', handler);

await Promise.all([twitch.start(), youtube.start()]);
```

## Testing a Connector

```bash
# Run unit tests for a specific connector
npm test --workspace=connectors/twitch
npm test --workspace=connectors/youtube

# Run all tests
npm test
```

## Log Files

Log files are auto-generated in the connector's working directory by default. Override with `logFilePath` in the config. Logs are structured JSON (one entry per line) and can be filtered by level.

```bash
# Tail the log file
tail -f logs/twitch-shroud.log | jq .
```
