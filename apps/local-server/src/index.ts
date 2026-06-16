import { TwitchConnector } from '@obs-chat/connector-twitch';
import { YouTubeConnector } from '@obs-chat/connector-youtube';
import { ModerationPipeline } from '@obs-chat/moderation-pipeline';
import { ChatServer } from './server';

async function bootstrap() {
  console.log('[App] Starting Local OBS Chat Server...');

  // 1. Start WebSocket Server
  const server = new ChatServer(9090);

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

  // 4. Initialize Connectors
  const twitchConnector = new TwitchConnector({
    platform: 'twitch',
    channelId: 'skynews' // Arbitrary active 24/7 channel for default testing
  });

  const ytConnector = new YouTubeConnector({
    platform: 'youtube',
    channelId: 'UC16niRr50-MSBwiO3YDb3RA' // BBC News Live
  });

  // 5. Link Connectors to Pipeline
  pipeline.addConnector(twitchConnector);
  pipeline.addConnector(ytConnector);

  // 6. Start Extractors
  console.log('[App] Connecting to platforms...');
  await Promise.all([
    twitchConnector.start(),
    ytConnector.start()
  ]).catch(err => {
    console.error('[App] Failed to start one or more connectors:', err);
  });
  
  console.log('[App] Server fully operational. Awaiting OBS connections on ws://localhost:9090');
}

bootstrap().catch(console.error);
