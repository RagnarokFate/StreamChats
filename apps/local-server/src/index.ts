import crypto from 'crypto';
import { TwitchConnector } from '@obs-chat/connector-twitch';
import { YouTubeConnector } from '@obs-chat/connector-youtube';
import { KickConnector } from '@obs-chat/connector-kick';
import { TikTokConnector } from '@obs-chat/connector-tiktok';
import { ConnectorSupervisor, ConnectorStatus } from '@obs-chat/connector-sdk';
import { EventBus } from '@obs-chat/event-bus';
import { ChatServer } from './server';
import { Platform, StatusUpdateEvent, PlatformStatus, StreamEvent, PersistedEvent } from '@obs-chat/event-schema';
import { loadConfig, getConfig } from './config';
import { logger } from './utils/logger';
import { PluginManager, MarketplaceClient } from '@obs-chat/plugin-sdk';

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
    if (arg.startsWith('--twitch=')) twitchChannel = arg.substring('--twitch='.length);
    else if (arg.startsWith('--youtube=')) youtubeChannel = arg.substring('--youtube='.length);
    else if (arg.startsWith('--kick=')) kickChannel = arg.substring('--kick='.length);
    else if (arg.startsWith('--tiktok=')) tiktokChannel = arg.substring('--tiktok='.length);
    else if (arg.startsWith('--port=')) port = parseInt(arg.substring('--port='.length), 10);
  }

  // 1. Initialize Event Bus and Session
  const serverConfig = loadConfig();
  const eventBus = new EventBus('streamchats.db');
  
  const activePlatforms: Platform[] = [];
  if (twitchChannel || serverConfig.platforms?.twitch) activePlatforms.push('twitch');
  if (youtubeChannel || serverConfig.platforms?.youtube) activePlatforms.push('youtube');
  if (kickChannel || serverConfig.platforms?.kick) activePlatforms.push('kick');
  if (tiktokChannel || serverConfig.platforms?.tiktok) activePlatforms.push('tiktok');
  
  // T022: Session management
  const sessionManager = eventBus.getSessionManager();
  // check for crashed sessions (implicitly done in getActiveSession)
  const session = sessionManager.startSession(activePlatforms);
  logger.info(`Event Bus initialized. Session: ${session.sessionId}`);

  // T016 & T023: Connector Supervisor
  const supervisor = new ConnectorSupervisor({ healthCheckIntervalMs: 5000 });

  // T064: Plugin Ecosystem
  const pluginManager = new PluginManager(eventBus);
  pluginManager.setApprovedPermissions(serverConfig.pluginPermissions || {});
  await pluginManager.loadAllPlugins();
  const marketplace = new MarketplaceClient();

  // 2. Start WebSocket Server
  const server = new ChatServer(port, eventBus, async (cmd: any) => {
    const command = cmd as any;
    if (command.action === 'manage_platform') {
      const { platform, action, username } = command.payload;
      if (platform === 'custom') return;
      
      const { loadConfig, saveConfig } = require('./config');
      const currentConfig = loadConfig();
      if (!currentConfig.platforms) currentConfig.platforms = {};
      
      if (action === 'connect' && username) {
        currentConfig.platforms[platform] = username;
        saveConfig(currentConfig);
        
        let connector;
        if (platform === 'twitch') connector = new TwitchConnector({ platform: 'twitch', channelId: username });
        if (platform === 'youtube') connector = new YouTubeConnector({ platform: 'youtube', channelId: username });
        if (platform === 'kick') connector = new KickConnector({ platform: 'kick', channelId: username });
        if (platform === 'tiktok') connector = new TikTokConnector({ platform: 'tiktok', channelId: username });
        
        if (connector) {
           supervisor.addConnector(connector, platform, username);
           await supervisor.startConnector(platform, username);
        }
      } else if (action === 'disconnect') {
        const chan = currentConfig.platforms[platform] || '';
        currentConfig.platforms[platform] = undefined;
        saveConfig(currentConfig);
        const managed = supervisor.getConnectorByPlatform(platform);
        if (managed) {
          supervisor.removeConnector(platform, chan).catch((e: any) => console.error('[DEBUG] Failed to remove connector:', e));
        }
      }
    } else if (command.action === 'update_moderation') {
      const { loadConfig, saveConfig } = require('./config');
      const currentConfig = loadConfig();
      const newConfig = { ...currentConfig, ...command.payload.config };
      saveConfig(newConfig);
      
      // Notify the moderation pipeline
      if (modPipeline) {
        modPipeline.updateConfig(newConfig);
      }
      
      // Optionally broadcast status update so UI knows it saved
      const healths = supervisor.getAllHealth();
      server.broadcastToAll({
        type: 'status_update',
        platforms: healths.map((h: any) => ({
          platform: h.platform,
          status: (supervisor.getConnectorByPlatform(h.platform)?.getStatus() || 'IDLE') as any,
          reconnectCount: 0,
          channelId: supervisor.getConnectorByPlatform(h.platform)?.getChannelId() || '',
          lastError: null,
          health: h
        })),
        statistics: [],
        serverConfig: newConfig
      });
    } else if (command.action === 'link_identity') {
      // Assuming payload has platform, platformUserId, platformUsername, identityId
      const { platform, platformUserId, platformUsername, identityId } = command.payload;
      if (identityStore) {
        identityStore.linkAccount(platform, platformUserId, platformUsername, identityId);
        // Broadcast new state if needed, or rely on client refetching
      }
    } else if (command.action === 'get_identities') {
      if (identityStore) {
        const identities = identityStore.listIdentities();
        const accounts = identityStore.listIdentities().map((id: any) => identityStore.getAccountsForIdentity(id.id)).flat();
        
        server.broadcastToAll({
          type: 'command_response',
          action: 'identities_list',
          payload: { identities, accounts }
        } as any);
      }
    } else if (command.action === 'update_reputation_weights') {
      const { loadConfig, saveConfig } = require('./config');
      const currentConfig = loadConfig();
      currentConfig.reputationWeights = command.payload.weights;
      saveConfig(currentConfig);
      if (repCalculator) {
        repCalculator.updateWeights(currentConfig.reputationWeights);
      }
    } else if (command.action === 'request_analytics') {
      if (analyticsEngine) {
        const sessionId = command.payload?.sessionId || eventBus.getSessionManager().getActiveSession()?.sessionId || (eventBus.getStore().getDatabase().prepare('SELECT sessionId FROM sessions ORDER BY startedAt DESC LIMIT 1').get() as any)?.sessionId;
        if (sessionId) {
          const report = analyticsEngine.getReport(sessionId);
          const summary = analyticsEngine.getSessionSummary(sessionId);
          server.broadcastToAll({
            type: 'command_response',
            action: 'analytics_report',
            payload: { sessionId, report, summary }
          } as any);
        }
      }
    } else if (command.action === 'export_session') {
      if (sessionExporter) {
        const sessionId = command.payload?.sessionId || eventBus.getSessionManager().getActiveSession()?.sessionId || (eventBus.getStore().getDatabase().prepare('SELECT sessionId FROM sessions ORDER BY startedAt DESC LIMIT 1').get() as any)?.sessionId;
        if (sessionId) {
          const format = command.payload.format;
          const fs = require('fs');
          const path = require('path');
          let filePath = command.payload.destinationPath;
          if (!filePath) {
            const exportDir = path.resolve(process.cwd(), 'exports');
            if (!fs.existsSync(exportDir)) {
              fs.mkdirSync(exportDir, { recursive: true });
            }
            if (format === 'csv') {
              filePath = path.join(exportDir, `session-${sessionId}.csv`);
            } else if (format === 'timestamped_log') {
              filePath = path.join(exportDir, `session-${sessionId}.log`);
            } else if (format === 'json') {
              filePath = path.join(exportDir, `session-${sessionId}.json`);
            }
          }
          
          if (format === 'csv') {
            filePath = sessionExporter.exportToCSV(sessionId, filePath);
          } else if (format === 'timestamped_log') {
            filePath = sessionExporter.exportToTimestampedLog(sessionId, filePath);
          } else if (format === 'json') {
            filePath = sessionExporter.exportToVODFormat(sessionId, filePath);
          }
          
          server.broadcastToAll({
            type: 'command_response',
            action: 'export_complete',
            payload: { sessionId, format, filePath }
          } as any);
        }
      }
    } else if (command.action === 'fetch_session_replay') {
      if (sessionExporter) {
        const sessionId = command.payload?.sessionId || eventBus.getSessionManager().getActiveSession()?.sessionId || (eventBus.getStore().getDatabase().prepare('SELECT sessionId FROM sessions ORDER BY startedAt DESC LIMIT 1').get() as any)?.sessionId;
        if (sessionId) {
          const path = require('path');
          const tempPath = path.resolve(process.cwd(), 'exports', `replay-${sessionId}.json`);
          sessionExporter.exportToVODFormat(sessionId, tempPath);
          const events = require(tempPath);
          server.broadcastToAll({
            type: 'command_response',
            action: 'session_replay_data',
            payload: { sessionId, events }
          } as any);
        }
      }
    } else if (command.action === 'get_marketplace') {
      const catalog = await marketplace.fetchAvailablePlugins();
      server.broadcastToAll({
        type: 'command_response',
        action: 'marketplace_catalog',
        payload: { catalog }
      } as any);
    } else if (command.action === 'list_plugins') {
      const plugins = pluginManager.getPlugins();
      server.broadcastToAll({
        type: 'command_response',
        action: 'plugins_list',
        payload: { plugins }
      } as any);
    } else if (command.action === 'grant_plugin_capabilities') {
      const currentConfig = loadConfig();
      if (!currentConfig.pluginPermissions) currentConfig.pluginPermissions = {};
      currentConfig.pluginPermissions[command.payload.pluginId] = command.payload.capabilities;
      const { saveConfig } = require('./config');
      saveConfig(currentConfig);
      pluginManager.setApprovedPermissions(currentConfig.pluginPermissions);
      // Reload the plugin so it initializes with new permissions
      await pluginManager.loadPlugin(command.payload.pluginId);
      
      const plugins = pluginManager.getPlugins();
      server.broadcastToAll({
        type: 'command_response',
        action: 'plugins_list',
        payload: { plugins }
      } as any);
    } else if (command.action === 'delete_marker') {
      const db = eventBus.getStore().getDatabase();
      db.prepare('DELETE FROM stream_markers WHERE markerId = ?').run(command.payload.markerId);
    } else if (command.action === 'simulate_test_message') {
      const testEvent = {
        eventId: crypto.randomUUID(),
        type: 'chat',
        platform: 'twitch',
        timestamp: new Date().toISOString(),
        author: {
          id: 'test-user',
          name: 'TestStreamer',
          color: '#ff4d4f',
          badges: []
        },
        message: {
          text: 'This is a test message from Quick Actions! 👋',
          fragments: [
            { type: 'text', text: 'This is a test message from Quick Actions! 👋' }
          ]
        },
        moderationStatus: 'visible',
        toxicityScore: 0
      };
      eventBus.publish(testEvent as any);
    } else if (command.action === 'reset_stats') {
      const session = eventBus.getSessionManager().getActiveSession();
      if (session) {
        const db = eventBus.getStore().getDatabase();
        db.prepare('DELETE FROM events WHERE sessionId = ?').run(session.sessionId);
        // Reset in-memory session stats
        session.totalEvents = 0;
        session.lastSequenceNumber = 0;
        session.startedAt = new Date().toISOString();
        // Update DB
        db.prepare('UPDATE sessions SET totalEvents = 0, lastSequenceNumber = 0, startedAt = ? WHERE sessionId = ?').run(session.startedAt, session.sessionId);
      }
    } else if (command.action === 'delete_session') {
      const sessionId = command.payload.sessionId;
      const db = eventBus.getStore().getDatabase();
      db.prepare('DELETE FROM events WHERE sessionId = ?').run(sessionId);
      db.prepare('DELETE FROM stream_markers WHERE sessionId = ?').run(sessionId);
      db.prepare('DELETE FROM sessions WHERE sessionId = ?').run(sessionId);
      // If we just deleted the active session, clear it and create a new one
      const activeSession = eventBus.getSessionManager().getActiveSession();
      if (activeSession && activeSession.sessionId === sessionId) {
        (eventBus.getSessionManager() as any).clearSession();
        eventBus.getSessionManager().startSession();
      }
    } else if (command.action === 'get_sessions') {
      const db = eventBus.getStore().getDatabase();
      const sessions = db.prepare('SELECT * FROM sessions ORDER BY startedAt DESC').all() as any[];
      server.broadcastToAll({
        type: 'command_response',
        action: 'sessions_list',
        payload: { sessions: sessions.map(s => ({ ...s, platforms: JSON.parse(s.platforms) })) }
      } as any);
    } else if (command.action === 'manage_plugin') {
      const { pluginId, operation } = command.payload;
      if (operation === 'install') {
        const catalog = await marketplace.fetchAvailablePlugins();
        const plugin = catalog.find(p => p.id === pluginId);
        if (plugin) {
          // Mock download
          const fs = require('fs');
          const path = require('path');
          const pluginsDir = path.resolve(process.cwd(), 'plugins', pluginId);
          if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });
          fs.writeFileSync(path.join(pluginsDir, 'manifest.json'), JSON.stringify(plugin, null, 2));
          let code = '';
          if (pluginId === 'auto-welcomer') {
            code = `
              const seenUsers = new Set();
              function generateUUID() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                  var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                  return v.toString(16);
                });
              }
              StreamChats.subscribe((event) => {
                if (event.type === 'chat') {
                  const userId = event.author?.id || event.author?.name;
                  if (userId && !seenUsers.has(userId)) {
                    seenUsers.add(userId);
                    // Generate a welcome message event
                    const welcomeEvent = {
                      eventId: generateUUID(),
                      type: 'chat',
                      platform: event.platform,
                      timestamp: new Date().toISOString(),
                      author: {
                        id: 'system-welcomer',
                        name: 'AutoWelcomer',
                        color: '#ffaa00',
                        badges: []
                      },
                      message: {
                        text: 'Welcome to the stream, @' + (event.author?.name || 'user') + '!',
                        fragments: [{ type: 'text', text: 'Welcome to the stream, @' + (event.author?.name || 'user') + '!' }]
                      },
                      moderationStatus: 'visible',
                      toxicityScore: 0
                    };
                    StreamChats.publish(welcomeEvent);
                  }
                }
              });
            `;
          } else {
            code = `
              StreamChats.subscribe((event) => {
                console.log('Plugin ' + '${pluginId}' + ' received event:', event.type);
              });
            `;
          }
          fs.writeFileSync(path.join(pluginsDir, plugin.entryPoint), code);
          await pluginManager.loadPlugin(pluginId);
        }
      } else if (operation === 'uninstall') {
        pluginManager.uninstallPlugin(pluginId);
        const fs = require('fs');
        const path = require('path');
        const pluginsDir = path.resolve(process.cwd(), 'plugins', pluginId);
        if (fs.existsSync(pluginsDir)) {
          fs.rmSync(pluginsDir, { recursive: true, force: true });
        }
      } else if (operation === 'disable') {
        pluginManager.disablePlugin(pluginId);
      } else if (operation === 'enable') {
        await pluginManager.loadPlugin(pluginId);
      }
      
      const plugins = pluginManager.getPlugins();
      server.broadcastToAll({
        type: 'command_response',
        action: 'plugins_list',
        payload: { plugins }
      } as any);
    }
  });

  // Initialize Identity and Reputation
  const { IdentityStore, ReputationCalculator } = require('@obs-chat/identity');
  const identityStore = new IdentityStore(eventBus.getStore().getDatabase());
  const repCalculator = new ReputationCalculator(serverConfig.reputationWeights || {});

  // Initialize Analytics
  const { AnalyticsEngine, SessionExporter } = require('@obs-chat/analytics');
  const analyticsEngine = new AnalyticsEngine(eventBus.getStore());
  const sessionExporter = new SessionExporter(eventBus.getStore());

  // 2.5 Initialize Moderation Pipeline
  const { ModerationPipeline } = require('@obs-chat/moderation-pipeline');
  const modPipeline = new ModerationPipeline(serverConfig);
  modPipeline.init().catch(console.error);

  // 3. Connect Connectors -> Moderation -> Event Bus
  supervisor.on('stream_event', (event: StreamEvent) => {
    console.log('[DEBUG] Supervisor received stream_event:', event.type);
    // Phase 5: Pass chat and superchat through Moderation Pipeline
    if (event.type === 'chat' || event.type === 'superchat') {
      console.log('[DEBUG] Passing event to ModPipeline');
      modPipeline.handleStreamEventAsync(event).catch((e: any) => console.error('[DEBUG] ModPipeline Error:', e));
    } else {
      console.log('[DEBUG] Publishing non-chat event directly');
      eventBus.publish(event);
    }
  });

  // Moderated events are emitted back out to be published
  modPipeline.on('stream_event', (event: StreamEvent) => {
    console.log('[DEBUG] ModPipeline emitted stream_event:', event.type);
    const result = eventBus.publish(event);
    console.log('[DEBUG] EventBus publish result:', result ? 'Success' : 'Failed');
  });

  // T024: Consumer subscription
  eventBus.subscribe('ws-broadcaster', (persistedEvent: any) => {
    server.broadcastStreamEvent(persistedEvent);
  });

  // 4. Initialize Connectors based on CLI args
  if (twitchChannel || serverConfig.platforms?.twitch) {
    const channel = twitchChannel || serverConfig.platforms?.twitch!;
    supervisor.addConnector(new TwitchConnector({ platform: 'twitch', channelId: channel }), 'twitch', channel);
  }
  if (youtubeChannel || serverConfig.platforms?.youtube) {
    const channel = youtubeChannel || serverConfig.platforms?.youtube!;
    supervisor.addConnector(new YouTubeConnector({ platform: 'youtube', channelId: channel }), 'youtube', channel);
  }
  if (kickChannel || serverConfig.platforms?.kick) {
    const channel = kickChannel || serverConfig.platforms?.kick!;
    supervisor.addConnector(new KickConnector({ platform: 'kick', channelId: channel }), 'kick', channel);
  }
  if (tiktokChannel || serverConfig.platforms?.tiktok) {
    const channel = tiktokChannel || serverConfig.platforms?.tiktok!;
    supervisor.addConnector(new TikTokConnector({ platform: 'tiktok', channelId: channel }), 'tiktok', channel);
  }

  // 5. Start Extractors
  if (supervisor.getTotalCount() === 0) {
    logger.info('WARNING: No platforms configured. Please configure via UI or CLI.');
  } else {
    logger.info('Starting connectors...');
    await supervisor.startAll();
  }

  // Periodic status update broadcast
  setInterval(() => {
    const healths = supervisor.getAllHealth();
    const platformStatuses: PlatformStatus[] = healths.map((h: any) => {
      const conn = supervisor.getConnectorByPlatform(h.platform);
      return {
        platform: h.platform,
        status: conn ? conn.getStatus() : 'IDLE',
        reconnectCount: 0,
        channelId: conn ? conn.getChannelId() : '',
        lastError: null,
        health: h
      } as PlatformStatus;
    });

    const sessionId = sessionManager.getActiveSession()?.sessionId;
    let statsArray: any[] = [];
    if (sessionId && analyticsEngine) {
      try {
        const summary = analyticsEngine.getSessionSummary(sessionId);
        if (summary) {
          statsArray = Object.keys(summary.messagesByPlatform).map(platform => {
            const totalMsgs = summary.messagesByPlatform[platform] || 0;
            return {
              platform,
              totalMessages: totalMsgs,
              uniqueChatters: summary.totalUniqueChatters, // approximate globally
              messagesPerMinute: summary.durationMinutes > 0 ? Math.round(totalMsgs / summary.durationMinutes) : totalMsgs
            };
          });
        }
      } catch (e) {}
    }

    const statusEvent: StatusUpdateEvent = {
      type: 'status_update',
      platforms: platformStatuses,
      statistics: statsArray,
      serverConfig: getConfig()
    };
    server.broadcastToAll(statusEvent);
  }, 2000);
  
  // Handle Graceful Shutdown
  const shutdown = async () => {
    logger.info('Graceful shutdown initiated...');
    await supervisor.stopAll();
    sessionManager.endSession();
    eventBus.getStore().close();
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.info(`Server fully operational. Awaiting OBS connections on ws://localhost:${port}`);
}

process.on('uncaughtException', (err) => {
  logger.error(`FATAL: Uncaught Exception: ${err.message}`);
  process.exit(1);
});

bootstrap().catch((err) => {
  logger.error(`Bootstrap failed: ${err.message}`);
  process.exit(1);
});
