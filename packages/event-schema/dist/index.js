"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandEventSchema = exports.StatusUpdateEventSchema = exports.SettingsUpdateEventSchema = exports.StreamStatisticsSchema = exports.PlatformStatusSchema = exports.ConnectorStatusSchema = exports.ServerConfigSchema = exports.DashboardSettingsSchema = exports.ModerationEventSchema = exports.ChatEventSchema = exports.BaseEventSchema = exports.ChatMessageSchema = exports.ChatAuthorSchema = exports.MessageFragmentSchema = exports.TextFragmentSchema = exports.EmoteFragmentSchema = exports.PlatformSchema = void 0;
const zod_1 = require("zod");
// Define the supported platforms
exports.PlatformSchema = zod_1.z.enum(['youtube', 'twitch', 'kick', 'tiktok', 'custom']);
// Represents an emote fragment inside a chat message
exports.EmoteFragmentSchema = zod_1.z.object({
    type: zod_1.z.literal('emote'),
    id: zod_1.z.string(),
    url: zod_1.z.string().url(),
    alt: zod_1.z.string().optional(),
});
// Represents a text fragment inside a chat message
exports.TextFragmentSchema = zod_1.z.object({
    type: zod_1.z.literal('text'),
    text: zod_1.z.string(),
});
exports.MessageFragmentSchema = zod_1.z.discriminatedUnion('type', [
    exports.EmoteFragmentSchema,
    exports.TextFragmentSchema,
]);
// Author information
exports.ChatAuthorSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    color: zod_1.z.string().optional(),
    badges: zod_1.z.array(zod_1.z.string()).optional(), // Array of badge URLs or identifiers
});
// The main Chat Message content
exports.ChatMessageSchema = zod_1.z.object({
    text: zod_1.z.string(), // The full raw text of the message
    fragments: zod_1.z.array(exports.MessageFragmentSchema).optional(), // Parsed chunks of text and emotes
});
// The base payload for all Realtime Events
exports.BaseEventSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid(),
    platform: exports.PlatformSchema,
    timestamp: zod_1.z.string().datetime(), // ISO-8601 string
});
// The final Chat Event Schema
exports.ChatEventSchema = exports.BaseEventSchema.extend({
    type: zod_1.z.literal('chat'),
    author: exports.ChatAuthorSchema,
    message: exports.ChatMessageSchema,
});
exports.ModerationEventSchema = exports.BaseEventSchema.extend({
    type: zod_1.z.literal('moderation'),
    action: zod_1.z.enum(['clear_chat', 'timeout', 'ban']),
    targetUserId: zod_1.z.string().optional(),
});
// Dashboard specific schemas
exports.DashboardSettingsSchema = zod_1.z.object({
    backgroundColor: zod_1.z.string(),
    fontFamily: zod_1.z.string(),
    fontSize: zod_1.z.number(),
    fontWeight: zod_1.z.number(),
    activeTheme: zod_1.z.string(),
    timestampMode: zod_1.z.enum(['relative', 'absolute', 'off']),
    emoteGlobalEnabled: zod_1.z.boolean(),
    emotePlatformToggles: zod_1.z.record(exports.PlatformSchema, zod_1.z.boolean()),
});
exports.ServerConfigSchema = zod_1.z.object({
    bannedWords: zod_1.z.array(zod_1.z.string()),
    bannedWordAction: zod_1.z.enum(['mask', 'drop', 'flag']),
    maskCharacter: zod_1.z.string(),
    spamProtectionEnabled: zod_1.z.boolean(),
});
exports.ConnectorStatusSchema = zod_1.z.enum(['IDLE', 'CONNECTING', 'CONNECTED', 'WAITING', 'RECONNECTING', 'ERROR']);
exports.PlatformStatusSchema = zod_1.z.object({
    platform: exports.PlatformSchema,
    status: exports.ConnectorStatusSchema,
    lastError: zod_1.z.string().nullable().optional(),
    reconnectCount: zod_1.z.number(),
    lastConnectedAt: zod_1.z.string().nullable().optional(),
    channelId: zod_1.z.string(),
});
exports.StreamStatisticsSchema = zod_1.z.object({
    platform: exports.PlatformSchema,
    totalMessages: zod_1.z.number(),
    uniqueChatters: zod_1.z.number(),
    messagesPerMinute: zod_1.z.number(),
});
// WebSocket Event Types (Server -> Client)
exports.SettingsUpdateEventSchema = zod_1.z.object({
    type: zod_1.z.literal('settings_update'),
    settings: exports.DashboardSettingsSchema.partial(),
});
exports.StatusUpdateEventSchema = zod_1.z.object({
    type: zod_1.z.literal('status_update'),
    platforms: zod_1.z.array(exports.PlatformStatusSchema),
    statistics: zod_1.z.array(exports.StreamStatisticsSchema),
    serverConfig: exports.ServerConfigSchema,
});
// WebSocket Command Types (Client -> Server)
exports.CommandEventSchema = zod_1.z.discriminatedUnion('action', [
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('clear_chat'),
        payload: zod_1.z.object({}),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('update_settings'),
        payload: zod_1.z.object({
            settings: exports.DashboardSettingsSchema.partial(),
        }),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('update_moderation'),
        payload: zod_1.z.object({
            config: exports.ServerConfigSchema.partial(),
        }),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('reconnect_platform'),
        payload: zod_1.z.object({
            platform: exports.PlatformSchema,
        }),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('reset_stats'),
        payload: zod_1.z.object({}),
    }),
]);
