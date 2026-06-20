import { TwitchConnector } from '@obs-chat/connector-twitch';
import { YouTubeConnector } from '@obs-chat/connector-youtube';
import { KickConnector } from '@obs-chat/connector-kick';
import { TikTokConnector } from '@obs-chat/connector-tiktok';
import { ModerationPipeline } from '@obs-chat/moderation-pipeline';
import { ChatServer } from './server';
import { Platform, StatusUpdateEvent, PlatformStatus } from '@obs-chat/event-schema';
import { loadConfig, getConfig } from './config';
import { logger, chatLogger } from './utils/logger';

async function bootstrap() {
  logger.info('Starting Local OBS Chat Server...');

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

  // 1. Load config and Start WebSocket Server
  const serverConfig = loadConfig();
  const server = new ChatServer(port, (command) => {
    if (command.action === 'reset_stats') {
      Object.values(streamStats).forEach(s => {
        s.totalMessages = 0;
        s.chatters.clear();
        s.recentTimestamps = [];
      });
      logger.info('Stream statistics reset manually.');
    } else if (command.action === 'reconnect_platform') {
      const platform = command.payload.platform;
      logger.info(`Manual reconnect requested for ${platform}`);
      const status = platformStatus[platform];
      if (status) {
        status.status = 'RECONNECTING';
        status.reconnectCount++;
        // Normally we'd call connector.reconnect() here
        // Simulating reconnect for now
        setTimeout(() => {
          status.status = 'CONNECTED';
          status.lastError = null;
          status.lastConnectedAt = new Date().toISOString();
        }, 2000);
      }
    } else if (command.action === 'update_settings') {
      const { settings } = command.payload;
      server.broadcast({
        type: 'settings_update',
        settings
      });
      logger.info('Broadcasted settings_update to all clients.');
    } else if (command.action === 'update_moderation') {
      const { config } = command.payload;
      const { loadConfig, saveConfig } = require('./config');
      const newConfig = { ...loadConfig(), ...config };
      saveConfig(newConfig);
      pipeline.updateConfig(newConfig);
      logger.info('Server configuration updated.');
    }
  });

  // 2. Initialize Moderation Pipeline
  const pipeline = new ModerationPipeline({
    ...serverConfig,
    maxMessageHistory: 1000
  });

  const streamStats: Record<Platform, { totalMessages: number, chatters: Set<string>, recentTimestamps: number[] }> = {
    twitch: { totalMessages: 0, chatters: new Set(), recentTimestamps: [] },
    youtube: { totalMessages: 0, chatters: new Set(), recentTimestamps: [] },
    kick: { totalMessages: 0, chatters: new Set(), recentTimestamps: [] },
    tiktok: { totalMessages: 0, chatters: new Set(), recentTimestamps: [] },
    custom: { totalMessages: 0, chatters: new Set(), recentTimestamps: [] },
  };

  const platformStatus: Record<Platform, PlatformStatus | undefined> = {
    twitch: undefined,
    youtube: undefined,
    kick: undefined,
    tiktok: undefined,
    custom: undefined,
  };

  // 3. Connect Pipeline to Server
  pipeline.on('chat_message', (event) => {
    chatLogger.logMessage(event);
    server.broadcast(event);
    const s = streamStats[event.platform as Platform];
    if (s) {
      s.totalMessages++;
      s.chatters.add(event.author.id);
      s.recentTimestamps.push(Date.now());
    }
  });
  
  pipeline.on('moderation_action', (event) => {
    server.broadcast(event);
  });

  pipeline.on('connector_error', ({ connector, error }) => {
    logger.error(`Connector Error (${connector.options.platform}):`, error.message);
    const status = platformStatus[connector.options.platform as Platform];
    if (status) {
      status.status = 'ERROR';
      status.lastError = error.message;
    }
  });

  // 4. Initialize Connectors based on CLI args
  const promises: Promise<void>[] = [];

  if (twitchChannel) {
    logger.info(`Initializing Twitch Connector for channel: ${twitchChannel}`);
    platformStatus.twitch = { platform: 'twitch', status: 'CONNECTING', reconnectCount: 0, channelId: twitchChannel };
    const twitchConnector = new TwitchConnector({
      platform: 'twitch',
      channelId: twitchChannel
    });
    pipeline.addConnector(twitchConnector);
    promises.push(twitchConnector.start().then(() => {
      if (platformStatus.twitch) {
        platformStatus.twitch.status = 'CONNECTED';
        platformStatus.twitch.lastConnectedAt = new Date().toISOString();
      }
    }).catch((err: any) => {
      logger.error('Failed to start Twitch connector:', err.message);
      if (platformStatus.twitch) {
        platformStatus.twitch.status = 'ERROR';
        platformStatus.twitch.lastError = err.message;
      }
    }));
  }

  if (youtubeChannel) {
    logger.info(`Initializing YouTube Connector for channel: ${youtubeChannel}`);
    platformStatus.youtube = { platform: 'youtube', status: 'CONNECTING', reconnectCount: 0, channelId: youtubeChannel };
    const ytConnector = new YouTubeConnector({
      platform: 'youtube',
      channelId: youtubeChannel
    });
    pipeline.addConnector(ytConnector);
    promises.push(ytConnector.start().then(() => {
      if (platformStatus.youtube) {
        platformStatus.youtube.status = 'CONNECTED';
        platformStatus.youtube.lastConnectedAt = new Date().toISOString();
      }
    }).catch((err: any) => {
      logger.error('Failed to start YouTube connector:', err.message);
      if (platformStatus.youtube) {
        platformStatus.youtube.status = 'ERROR';
        platformStatus.youtube.lastError = err.message;
      }
    }));
  }

  if (kickChannel) {
    logger.info(`Initializing Kick Connector for channel: ${kickChannel}`);
    const kickConnector = new KickConnector({
      platform: 'kick',
      channelId: kickChannel
    });
    pipeline.addConnector(kickConnector);
    promises.push(kickConnector.start().catch((err: any) => {
      logger.error('Failed to start Kick connector:', err.message);
    }));
  }

  if (tiktokChannel) {
    logger.info(`Initializing TikTok Connector for channel: ${tiktokChannel}`);
    const tiktokConnector = new TikTokConnector({
      platform: 'tiktok',
      channelId: tiktokChannel
    });
    pipeline.addConnector(tiktokConnector);
    promises.push(tiktokConnector.start().catch((err: any) => {
      logger.error('Failed to start TikTok connector:', err.message);
    }));
  }

  // 5. Start Extractors
  if (promises.length === 0) {
    logger.info('WARNING: No platforms configured. Please pass --twitch="<channel>" and/or --youtube="<channel>"');
  } else {
    logger.info('Connecting to platforms...');
    await Promise.all(promises);
  }

  // Periodic status update broadcast
  setInterval(() => {
    const now = Date.now();
    const oneMinAgo = now - 60000;
    
    const statistics = (Object.keys(streamStats) as Platform[]).map(platform => {
      const s = streamStats[platform];
      // remove old timestamps
      s.recentTimestamps = s.recentTimestamps.filter(t => t >= oneMinAgo);
      
      return {
        platform,
        totalMessages: s.totalMessages,
        uniqueChatters: s.chatters.size,
        messagesPerMinute: s.recentTimestamps.length
      };
    });

    const statusEvent: StatusUpdateEvent = {
      type: 'status_update',
      platforms: Object.values(platformStatus).filter(Boolean) as PlatformStatus[],
      statistics,
      serverConfig: getConfig()
    };
    server.broadcast(statusEvent);
  }, 2000);
  
  logger.info(`Server fully operational. Awaiting OBS connections on ws://localhost:${port}`);
}

bootstrap().catch(console.error);
