import { z } from 'zod';

// Define the supported platforms
export const PlatformSchema = z.enum(['youtube', 'twitch', 'kick', 'tiktok', 'custom']);
export type Platform = z.infer<typeof PlatformSchema>;

// Represents an emote fragment inside a chat message
export const EmoteFragmentSchema = z.object({
  type: z.literal('emote'),
  id: z.string(),
  url: z.string().url(),
  alt: z.string().optional(),
});
export type EmoteFragment = z.infer<typeof EmoteFragmentSchema>;

// Represents a text fragment inside a chat message
export const TextFragmentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});
export type TextFragment = z.infer<typeof TextFragmentSchema>;

export const MessageFragmentSchema = z.discriminatedUnion('type', [
  EmoteFragmentSchema,
  TextFragmentSchema,
]);
export type MessageFragment = z.infer<typeof MessageFragmentSchema>;

// Author information
export const ChatAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  badges: z.array(z.string()).optional(), // Array of badge URLs or identifiers
});
export type ChatAuthor = z.infer<typeof ChatAuthorSchema>;

// The main Chat Message content
export const ChatMessageSchema = z.object({
  text: z.string(), // The full raw text of the message
  fragments: z.array(MessageFragmentSchema).optional(), // Parsed chunks of text and emotes
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// The base payload for all Realtime Events
export const BaseEventSchema = z.object({
  eventId: z.string().uuid(),
  platform: PlatformSchema,
  timestamp: z.string().datetime(), // ISO-8601 string
});

// The final Chat Event Schema
export const ChatEventSchema = BaseEventSchema.extend({
  type: z.literal('chat'),
  author: ChatAuthorSchema,
  message: ChatMessageSchema,
  moderationStatus: z.enum(['suppressed', 'approved']).optional(),
  toxicityScore: z.number().optional(),
});
export type ChatEvent = z.infer<typeof ChatEventSchema>;

export const ModerationEventSchema = BaseEventSchema.extend({
  type: z.literal('moderation'),
  action: z.enum(['clear_chat', 'timeout', 'ban']),
  targetUserId: z.string().optional(),
});
export type ModerationEvent = z.infer<typeof ModerationEventSchema>;

// Dashboard specific schemas
export const DashboardSettingsSchema = z.object({
  backgroundColor: z.string(),
  fontFamily: z.string(),
  fontSize: z.number(),
  fontWeight: z.number(),
  activeTheme: z.string(),
  timestampMode: z.enum(['relative', 'absolute', 'off']),
  emoteGlobalEnabled: z.boolean(),
  emotePlatformToggles: z.record(PlatformSchema, z.boolean()),
  viewMode: z.enum(['unified', 'split', 'priority', 'moderator']).default('unified'),
});
export type DashboardSettings = z.infer<typeof DashboardSettingsSchema>;

export const ServerConfigSchema = z.object({
  bannedWords: z.array(z.string()).default([]),
  bannedWordAction: z.enum(['mask', 'drop']).default('mask'),
  maskCharacter: z.string().default('*'),
  spamProtectionEnabled: z.boolean().default(true),
  platforms: z.object({
    twitch: z.string().optional(),
    youtube: z.string().optional(),
    kick: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional(),
});
export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export const ConnectorStatusSchema = z.enum(['IDLE', 'CONNECTING', 'CONNECTED', 'WAITING', 'RECONNECTING', 'ERROR']);
export type ConnectorStatus = z.infer<typeof ConnectorStatusSchema>;

export const PlatformStatusSchema = z.object({
  platform: PlatformSchema,
  status: ConnectorStatusSchema,
  lastError: z.string().nullable().optional(),
  reconnectCount: z.number(),
  lastConnectedAt: z.string().nullable().optional(),
  channelId: z.string(),
});
export type PlatformStatus = z.infer<typeof PlatformStatusSchema>;

export const StreamStatisticsSchema = z.object({
  platform: PlatformSchema,
  totalMessages: z.number(),
  uniqueChatters: z.number(),
  messagesPerMinute: z.number(),
});
export type StreamStatistics = z.infer<typeof StreamStatisticsSchema>;

// WebSocket Event Types (Server -> Client)
export const SettingsUpdateEventSchema = z.object({
  type: z.literal('settings_update'),
  settings: DashboardSettingsSchema.partial(),
});
export type SettingsUpdateEvent = z.infer<typeof SettingsUpdateEventSchema>;

export const StatusUpdateEventSchema = z.object({
  type: z.literal('status_update'),
  platforms: z.array(PlatformStatusSchema),
  statistics: z.array(StreamStatisticsSchema),
  serverConfig: ServerConfigSchema,
});
export type StatusUpdateEvent = z.infer<typeof StatusUpdateEventSchema>;

// WebSocket Command Types (Client -> Server)
export const CommandEventSchema = z.discriminatedUnion('action', [
  z.object({
    type: z.literal('command'),
    action: z.literal('clear_chat'),
    payload: z.object({}),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('update_settings'),
    payload: z.object({
      settings: DashboardSettingsSchema.partial(),
    }),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('update_moderation'),
    payload: z.object({
      config: ServerConfigSchema.partial(),
    }),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('reconnect_platform'),
    payload: z.object({
      platform: PlatformSchema,
    }),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('reset_stats'),
    payload: z.object({}),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('manage_plugin'),
    payload: z.object({
      pluginId: z.string(),
      action: z.enum(['enable', 'disable', 'list', 'install']),
    }),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('obs_action'),
    payload: z.object({
      obsAction: z.enum(['connect', 'disconnect', 'get_scenes', 'set_scene']),
      url: z.string().optional(),
      password: z.string().optional(),
      sceneName: z.string().optional(),
    }),
  }),
]);
export type CommandEvent = z.infer<typeof CommandEventSchema>;

// ============================================================================
// V2 EVENT SCHEMA EXPANSION
// ============================================================================

// Stream Event Type enumeration
export const StreamEventTypeSchema = z.enum([
  'chat', 'gift', 'follow', 'raid', 'superchat', 'moderation'
]);
export type StreamEventType = z.infer<typeof StreamEventTypeSchema>;

// Moderation status for events
export const ModerationStatusSchema = z.enum(['visible', 'suppressed', 'flagged']);
export type ModerationStatus = z.infer<typeof ModerationStatusSchema>;

// StreamEvent base schema — extends BaseEvent with sequenceNumber and sessionId
export const StreamEventBaseSchema = BaseEventSchema.extend({
  sequenceNumber: z.number().int().optional(), // Assigned by Event Bus on persist
  sessionId: z.string().uuid().optional(),      // Assigned by Event Bus on persist
  rawPayload: z.unknown().optional(),           // Original platform-specific data
});

// ── GiftEvent ──────────────────────────────────────────────────────────────
export const GiftEventSchema = StreamEventBaseSchema.extend({
  type: z.literal('gift'),
  sender: z.object({
    id: z.string(),
    name: z.string(),
  }),
  giftType: z.string(),    // Platform-normalized gift type (e.g., 'sub_gift', 'stars', 'roses')
  giftCount: z.number().int().min(1),
  monetaryValue: z.object({
    amount: z.number(),
    currency: z.string(),   // ISO 4217
  }).optional(),
});
export type GiftEvent = z.infer<typeof GiftEventSchema>;

// ── FollowEvent ────────────────────────────────────────────────────────────
export const FollowEventSchema = StreamEventBaseSchema.extend({
  type: z.literal('follow'),
  follower: z.object({
    id: z.string(),
    name: z.string(),
  }),
});
export type FollowEvent = z.infer<typeof FollowEventSchema>;

// ── RaidEvent ──────────────────────────────────────────────────────────────
export const RaidEventSchema = StreamEventBaseSchema.extend({
  type: z.literal('raid'),
  raider: z.object({
    id: z.string(),
    name: z.string(),
  }),
  viewerCount: z.number().int().min(0),
});
export type RaidEvent = z.infer<typeof RaidEventSchema>;

// ── SuperChatEvent ─────────────────────────────────────────────────────────
export const SuperChatEventSchema = StreamEventBaseSchema.extend({
  type: z.literal('superchat'),
  sender: z.object({
    id: z.string(),
    name: z.string(),
  }),
  amount: z.number(),
  currency: z.string(),    // ISO 4217
  message: z.string().optional(),
  tier: z.string().optional(), // YouTube color tier, Twitch sub tier, etc.
});
export type SuperChatEvent = z.infer<typeof SuperChatEventSchema>;

// ── Extended ChatEvent with moderation fields ──────────────────────────────
export const ExtendedChatEventSchema = StreamEventBaseSchema.extend({
  type: z.literal('chat'),
  author: ChatAuthorSchema,
  message: ChatMessageSchema,
  moderationStatus: ModerationStatusSchema.default('visible'),
  toxicityScore: z.number().min(0).max(1).optional(),
});
export type ExtendedChatEvent = z.infer<typeof ExtendedChatEventSchema>;

// ── Extended ModerationEvent ───────────────────────────────────────────────
export const ExtendedModerationEventSchema = StreamEventBaseSchema.extend({
  type: z.literal('moderation'),
  action: z.enum(['clear_chat', 'timeout', 'ban', 'suppress', 'flag', 'mask', 'drop', 'alert']),
  targetUserId: z.string().optional(),
  moderationStatus: ModerationStatusSchema.default('visible'),
  toxicityScore: z.number().min(0).max(1).optional(),
});
export type ExtendedModerationEvent = z.infer<typeof ExtendedModerationEventSchema>;

// ── Discriminated Union: StreamEvent ───────────────────────────────────────
// Combines all event subtypes into a single discriminated union on 'type'
export const StreamEventSchema = z.discriminatedUnion('type', [
  ExtendedChatEventSchema,
  GiftEventSchema,
  FollowEventSchema,
  RaidEventSchema,
  SuperChatEventSchema,
  ExtendedModerationEventSchema,
]);
export type StreamEvent = z.infer<typeof StreamEventSchema>;

// ── Persisted Event ────────────────────────────────────────────────────────
// After being stored in the Event Bus, sequenceNumber and sessionId are guaranteed
export const PersistedEventSchema = StreamEventSchema.and(z.object({
  sequenceNumber: z.number().int(),
  sessionId: z.string().uuid(),
}));
export type PersistedEvent = z.infer<typeof PersistedEventSchema>;

// ============================================================================
// V2 WEBSOCKET PROTOCOL — COMMAND SCHEMAS (Client → Server)
// ============================================================================

export const ReplyMessageCommandSchema = z.object({
  type: z.literal('command'),
  action: z.literal('reply_message'),
  payload: z.object({
    platform: PlatformSchema,
    message: z.string(),
    replyToEventId: z.string().uuid().optional(),
  }),
});
export type ReplyMessageCommand = z.infer<typeof ReplyMessageCommandSchema>;

export const PlaceMarkerCommandSchema = z.object({
  type: z.literal('command'),
  action: z.literal('place_marker'),
  payload: z.object({
    label: z.string().optional(),
  }),
});
export type PlaceMarkerCommand = z.infer<typeof PlaceMarkerCommandSchema>;

export const SwitchViewModeCommandSchema = z.object({
  type: z.literal('command'),
  action: z.literal('switch_view_mode'),
  payload: z.object({
    mode: z.enum(['unified', 'split', 'priority', 'moderator']),
  }),
});
export type SwitchViewModeCommand = z.infer<typeof SwitchViewModeCommandSchema>;

export const ViewModeSchema = z.enum(['unified', 'split', 'priority', 'moderator']);
export type ViewMode = z.infer<typeof ViewModeSchema>;

export const LinkIdentityCommandSchema = z.object({
  type: z.literal('command'),
  action: z.literal('link_identity'),
  payload: z.object({
    identityId: z.string().uuid().nullable(),
    platform: PlatformSchema,
    platformUserId: z.string(),
    platformUsername: z.string(),
    method: z.enum(['manual', 'suggested', 'self_claim']),
  }),
});
export type LinkIdentityCommand = z.infer<typeof LinkIdentityCommandSchema>;

export const UpdateReputationWeightsCommandSchema = z.object({
  type: z.literal('command'),
  action: z.literal('update_reputation_weights'),
  payload: z.object({
    weights: z.object({
      messages: z.number(),
      gifts: z.number(),
      watch_time: z.number(),
      engagement: z.number(),
      mod_actions: z.number(),
      spam_flags: z.number(),
    }),
  }),
});
export type UpdateReputationWeightsCommand = z.infer<typeof UpdateReputationWeightsCommandSchema>;

export const ExportSessionCommandSchema = z.object({
  type: z.literal('command'),
  action: z.literal('export_session'),
  payload: z.object({
    sessionId: z.string().uuid(),
    format: z.enum(['csv', 'timestamped_log']),
    includeModeration: z.boolean().default(true),
  }),
});
export type ExportSessionCommand = z.infer<typeof ExportSessionCommandSchema>;

export const RequestAnalyticsCommandSchema = z.object({
  type: z.literal('command'),
  action: z.literal('request_analytics'),
  payload: z.object({
    sessionId: z.string().uuid().optional(),
  }),
});
export type RequestAnalyticsCommand = z.infer<typeof RequestAnalyticsCommandSchema>;

export const ManagePluginCommandSchema = z.object({
  type: z.literal('command'),
  action: z.literal('manage_plugin'),
  payload: z.object({
    pluginId: z.string(),
    operation: z.enum(['install', 'enable', 'disable', 'uninstall']),
    capabilities: z.array(z.enum([
      'network', 'filesystem-read', 'filesystem-write', 'notifications', 'overlay-render'
    ])).optional(),
  }),
});
export type ManagePluginCommand = z.infer<typeof ManagePluginCommandSchema>;

// Combined v2 command schema (extends v1 discriminated union)
export const CommandEventV2Schema = z.discriminatedUnion('action', [
  // v1 commands (preserved)
  z.object({
    type: z.literal('command'),
    action: z.literal('clear_chat'),
    payload: z.object({}),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('update_settings'),
    payload: z.object({
      settings: DashboardSettingsSchema.partial(),
    }),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('update_moderation'),
    payload: z.object({
      config: ServerConfigSchema.partial(),
    }),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('reconnect_platform'),
    payload: z.object({
      platform: PlatformSchema,
    }),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('reset_stats'),
    payload: z.object({}),
  }),
  // v2 commands (new)
  ReplyMessageCommandSchema,
  PlaceMarkerCommandSchema,
  SwitchViewModeCommandSchema,
  LinkIdentityCommandSchema,
  UpdateReputationWeightsCommandSchema,
  ExportSessionCommandSchema,
  RequestAnalyticsCommandSchema,
  ManagePluginCommandSchema,
  z.object({
    type: z.literal('command'),
    action: z.literal('manage_platform'),
    payload: z.object({
      platform: PlatformSchema,
      action: z.enum(['connect', 'disconnect']),
      username: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('command'),
    action: z.literal('obs_action'),
    payload: z.object({
      obsAction: z.enum(['connect', 'disconnect', 'get_scenes', 'set_scene']),
      url: z.string().optional(),
      password: z.string().optional(),
      sceneName: z.string().optional(),
    }),
  }),
]);
export type CommandEventV2 = z.infer<typeof CommandEventV2Schema>;

// ============================================================================
// V2 WEBSOCKET PROTOCOL — SERVER EVENT SCHEMAS (Server → Client)
// ============================================================================

export const StreamEventWsSchema = z.object({
  type: z.literal('stream_event'),
  event: StreamEventSchema,
});
export type StreamEventWs = z.infer<typeof StreamEventWsSchema>;

export const ReplyStatusEventSchema = z.object({
  type: z.literal('reply_status'),
  platform: PlatformSchema,
  status: z.enum(['sent', 'failed', 'read_only']),
  error: z.string().optional(),
});
export type ReplyStatusEvent = z.infer<typeof ReplyStatusEventSchema>;

export const AnalyticsReportEventSchema = z.object({
  type: z.literal('analytics_report'),
  sessionId: z.string().uuid(),
  metrics: z.object({
    messagesPerMinute: z.array(z.object({
      timestamp: z.string(),
      count: z.number(),
    })),
    platformShare: z.record(PlatformSchema, z.number()),
    topChatters: z.array(z.object({
      name: z.string(),
      platform: PlatformSchema,
      messageCount: z.number(),
    })),
    peakEngagement: z.object({
      startTime: z.string(),
      endTime: z.string(),
      rate: z.number(),
    }).optional(),
  }),
});
export type AnalyticsReportEvent = z.infer<typeof AnalyticsReportEventSchema>;

export const ExportReadyEventSchema = z.object({
  type: z.literal('export_ready'),
  sessionId: z.string().uuid(),
  format: z.enum(['csv', 'timestamped_log']),
  downloadPath: z.string(),
  sizeBytes: z.number(),
});
export type ExportReadyEvent = z.infer<typeof ExportReadyEventSchema>;

export const PluginStatusEventSchema = z.object({
  type: z.literal('plugin_status'),
  pluginId: z.string(),
  status: z.enum(['active', 'error', 'disabled', 'installed', 'listed']),
  error: z.string().optional(),
  plugins: z.array(z.any()).optional(),
});
export type PluginStatusEvent = z.infer<typeof PluginStatusEventSchema>;

export const IdentityUpdateEventSchema = z.object({
  type: z.literal('identity_update'),
  identity: z.object({
    identityId: z.string().uuid(),
    displayName: z.string(),
    reputationScore: z.number(),
    accounts: z.array(z.object({
      platform: PlatformSchema,
      platformUserId: z.string(),
      platformUsername: z.string(),
    })),
  }),
});
export type IdentityUpdateEvent = z.infer<typeof IdentityUpdateEventSchema>;

// ── Session Status Types ───────────────────────────────────────────────────
export const SessionStatusSchema = z.enum(['active', 'ended', 'crashed']);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const StreamSessionSchema = z.object({
  sessionId: z.string().uuid(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  platforms: z.array(PlatformSchema),
  totalEvents: z.number().int(),
  lastSequenceNumber: z.number().int(),
  status: SessionStatusSchema,
});
export type StreamSession = z.infer<typeof StreamSessionSchema>;

export const StreamMarkerSchema = z.object({
  markerId: z.string().uuid(),
  sessionId: z.string().uuid(),
  timestamp: z.string().datetime(),
  label: z.string().nullable(),
  sequenceNumber: z.number().int().nullable(),
});
export type StreamMarker = z.infer<typeof StreamMarkerSchema>;

// ── Connector Health ───────────────────────────────────────────────────────
export const ConnectorHealthSchema = z.object({
  platform: PlatformSchema,
  latencyMs: z.number(),
  lastEventTime: z.string().datetime().nullable(),
  errorRate: z.number().min(0).max(1),
  supportsOutbound: z.boolean(),
});
export type ConnectorHealth = z.infer<typeof ConnectorHealthSchema>;


