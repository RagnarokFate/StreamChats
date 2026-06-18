import { TwitchConnector } from '@obs-chat/connector-twitch';
import { YouTubeConnector } from '@obs-chat/connector-youtube';
import { KickConnector } from '@obs-chat/connector-kick';
import { TikTokConnector } from '@obs-chat/connector-tiktok';
import { ModerationPipeline } from '@obs-chat/moderation-pipeline';
import { ChatServer } from './server';

async function bootstrap() {
  console.log('[App] Starting Local OBS Chat Server...');

  // Parse command line arguments
  const args = process.argv.slice(2);
  let twitchChannel: string | null = null;
  let youtubeChannel: string | null = null;
  let kickChannel: string | null = null;
  let tiktokChannel: string | null = null;
  let port = 9090;

  for (const arg of args) {
    if (arg.startsWith('--twitch=')) {
      twitchChannel = arg.substring('--twitch='.length);
    } else if (arg.startsWith('--youtube=')) {
      youtubeChannel = arg.substring('--youtube='.length);
    } else if (arg.startsWith('--kick=')) {
      kickChannel = arg.substring('--kick='.length);
    } else if (arg.startsWith('--tiktok=')) {
      tiktokChannel = arg.substring('--tiktok='.length);
    } else if (arg.startsWith('--port=')) {
      port = parseInt(arg.substring('--port='.length), 10);
    }
  }

  // 1. Start WebSocket Server
  const server = new ChatServer(port);

  // 2. Initialize Moderation Pipeline
  const pipeline = new ModerationPipeline({
    bannedWords: ['spam', 'troll', 'bot'],
    bannedWordAction: 'mask',
    maskCharacter: '*',
    spamProtectionEnabled: true,
    maxMessageHistory: 1000
  });

  // 3. Connect Pipeline to Server
  pipeline.on('chat_message', (event) => {
    server.broadcast(event);
  });
  
  pipeline.on('moderation_action', (event) => {
    server.broadcast(event);
  });

  // 4. Initialize Connectors based on CLI args
  const promises: Promise<void>[] = [];

  if (twitchChannel) {
    console.log(`[App] Initializing Twitch Connector for channel: ${twitchChannel}`);
    const twitchConnector = new TwitchConnector({
      platform: 'twitch',
      channelId: twitchChannel
    });
    pipeline.addConnector(twitchConnector);
    promises.push(twitchConnector.start().catch((err: any) => {
      console.error('[App] Failed to start Twitch connector:', err.message);
    }));
  }

  if (youtubeChannel) {
    console.log(`[App] Initializing YouTube Connector for channel: ${youtubeChannel}`);
    const ytConnector = new YouTubeConnector({
      platform: 'youtube',
      channelId: youtubeChannel
    });
    pipeline.addConnector(ytConnector);
    promises.push(ytConnector.start().catch((err: any) => {
      console.error('[App] Failed to start YouTube connector:', err.message);
    }));
  }

  if (kickChannel) {
    console.log(`[App] Initializing Kick Connector for channel: ${kickChannel}`);
    const kickConnector = new KickConnector({
      platform: 'kick',
      channelId: kickChannel
    });
    pipeline.addConnector(kickConnector);
    promises.push(kickConnector.start().catch((err: any) => {
      console.error('[App] Failed to start Kick connector:', err.message);
    }));
  }

  if (tiktokChannel) {
    console.log(`[App] Initializing TikTok Connector for channel: ${tiktokChannel}`);
    const tiktokConnector = new TikTokConnector({
      platform: 'tiktok',
      channelId: tiktokChannel
    });
    pipeline.addConnector(tiktokConnector);
    promises.push(tiktokConnector.start().catch((err: any) => {
      console.error('[App] Failed to start TikTok connector:', err.message);
    }));
  }

  // 5. Start Extractors
  if (promises.length === 0) {
    console.warn('[App] WARNING: No platforms configured. Please pass --twitch="<channel>" and/or --youtube="<channel>"');
  } else {
    console.log('[App] Connecting to platforms...');
    await Promise.all(promises);
  }
  
  console.log(`[App] Server fully operational. Awaiting OBS connections on ws://localhost:${port}`);
}

bootstrap().catch(console.error);
