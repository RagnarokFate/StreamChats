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
});
export type DashboardSettings = z.infer<typeof DashboardSettingsSchema>;

export const ServerConfigSchema = z.object({
  bannedWords: z.array(z.string()),
  bannedWordAction: z.enum(['mask', 'drop', 'flag']),
  maskCharacter: z.string(),
  spamProtectionEnabled: z.boolean(),
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
]);
export type CommandEvent = z.infer<typeof CommandEventSchema>;

