"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityUpdateEventSchema = exports.PluginStatusEventSchema = exports.ExportReadyEventSchema = exports.AnalyticsReportEventSchema = exports.ReplyStatusEventSchema = exports.StreamEventWsSchema = exports.CommandEventV2Schema = exports.GetSessionsCommandSchema = exports.DeleteSessionCommandSchema = exports.DeleteMarkerCommandSchema = exports.GrantPluginCapabilitiesCommandSchema = exports.ListPluginsCommandSchema = exports.GetMarketplaceCommandSchema = exports.ManagePluginCommandSchema = exports.RequestAnalyticsCommandSchema = exports.ExportSessionCommandSchema = exports.UpdateReputationWeightsCommandSchema = exports.LinkIdentityCommandSchema = exports.ViewModeSchema = exports.SwitchViewModeCommandSchema = exports.PlaceMarkerCommandSchema = exports.ReplyMessageCommandSchema = exports.PersistedEventSchema = exports.StreamEventSchema = exports.ExtendedModerationEventSchema = exports.ExtendedChatEventSchema = exports.SuperChatEventSchema = exports.RaidEventSchema = exports.FollowEventSchema = exports.GiftEventSchema = exports.StreamEventBaseSchema = exports.ModerationStatusSchema = exports.StreamEventTypeSchema = exports.CommandEventSchema = exports.StatusUpdateEventSchema = exports.SettingsUpdateEventSchema = exports.StreamStatisticsSchema = exports.PlatformStatusSchema = exports.ConnectorStatusSchema = exports.ServerConfigSchema = exports.DashboardSettingsSchema = exports.ModerationEventSchema = exports.ChatEventSchema = exports.BaseEventSchema = exports.ChatMessageSchema = exports.ChatAuthorSchema = exports.MessageFragmentSchema = exports.TextFragmentSchema = exports.EmoteFragmentSchema = exports.PlatformSchema = void 0;
exports.ConnectorHealthSchema = exports.StreamMarkerSchema = exports.StreamSessionSchema = exports.SessionStatusSchema = void 0;
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
    moderationStatus: zod_1.z.enum(['suppressed', 'approved']).optional(),
    toxicityScore: zod_1.z.number().optional(),
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
    viewMode: zod_1.z.enum(['unified', 'split', 'priority', 'moderator']).default('unified'),
});
exports.ServerConfigSchema = zod_1.z.object({
    bannedWords: zod_1.z.array(zod_1.z.string()).default([]),
    bannedWordAction: zod_1.z.enum(['mask', 'drop']).default('mask'),
    maskCharacter: zod_1.z.string().default('*'),
    spamProtectionEnabled: zod_1.z.boolean().default(true),
    aiToxicityEnabled: zod_1.z.boolean().default(false),
    aiToxicityThreshold: zod_1.z.number().min(0).max(1).default(0.8),
    platforms: zod_1.z.object({
        twitch: zod_1.z.string().optional(),
        youtube: zod_1.z.string().optional(),
        kick: zod_1.z.string().optional(),
        tiktok: zod_1.z.string().optional(),
    }).optional(),
    reputationWeights: zod_1.z.object({
        messages: zod_1.z.number().default(0.01),
        gifts: zod_1.z.number().default(0.5),
        watchTime: zod_1.z.number().default(0.005),
        modActions: zod_1.z.number().default(-2.0),
        spamFlags: zod_1.z.number().default(-1.0),
    }).optional(),
    pluginPermissions: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string())).optional(),
});
exports.ConnectorStatusSchema = zod_1.z.enum(['IDLE', 'CONNECTING', 'CONNECTED', 'WAITING', 'RECONNECTING', 'ERROR']);
exports.PlatformStatusSchema = zod_1.z.object({
    platform: exports.PlatformSchema,
    status: exports.ConnectorStatusSchema,
    lastError: zod_1.z.string().nullable().optional(),
    reconnectCount: zod_1.z.number(),
    lastConnectedAt: zod_1.z.string().nullable().optional(),
    channelId: zod_1.z.string(),
    health: zod_1.z.object({
        platform: exports.PlatformSchema,
        latencyMs: zod_1.z.number(),
        lastEventTime: zod_1.z.string().datetime().nullable(),
        errorRate: zod_1.z.number().min(0).max(1),
        supportsOutbound: zod_1.z.boolean(),
    }).optional(),
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
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('manage_plugin'),
        payload: zod_1.z.object({
            pluginId: zod_1.z.string(),
            action: zod_1.z.enum(['enable', 'disable', 'list', 'install']),
        }),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('obs_action'),
        payload: zod_1.z.object({
            obsAction: zod_1.z.enum(['connect', 'disconnect', 'get_scenes', 'set_scene']),
            url: zod_1.z.string().optional(),
            password: zod_1.z.string().optional(),
            sceneName: zod_1.z.string().optional(),
        }),
    }),
]);
// ============================================================================
// V2 EVENT SCHEMA EXPANSION
// ============================================================================
// Stream Event Type enumeration
exports.StreamEventTypeSchema = zod_1.z.enum([
    'chat', 'gift', 'follow', 'raid', 'superchat', 'moderation'
]);
// Moderation status for events
exports.ModerationStatusSchema = zod_1.z.enum(['visible', 'suppressed', 'flagged']);
// StreamEvent base schema — extends BaseEvent with sequenceNumber and sessionId
exports.StreamEventBaseSchema = exports.BaseEventSchema.extend({
    sequenceNumber: zod_1.z.number().int().optional(), // Assigned by Event Bus on persist
    sessionId: zod_1.z.string().uuid().optional(), // Assigned by Event Bus on persist
    rawPayload: zod_1.z.unknown().optional(), // Original platform-specific data
});
// ── GiftEvent ──────────────────────────────────────────────────────────────
exports.GiftEventSchema = exports.StreamEventBaseSchema.extend({
    type: zod_1.z.literal('gift'),
    sender: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
    }),
    giftType: zod_1.z.string(), // Platform-normalized gift type (e.g., 'sub_gift', 'stars', 'roses')
    giftCount: zod_1.z.number().int().min(1),
    monetaryValue: zod_1.z.object({
        amount: zod_1.z.number(),
        currency: zod_1.z.string(), // ISO 4217
    }).optional(),
});
// ── FollowEvent ────────────────────────────────────────────────────────────
exports.FollowEventSchema = exports.StreamEventBaseSchema.extend({
    type: zod_1.z.literal('follow'),
    follower: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
    }),
});
// ── RaidEvent ──────────────────────────────────────────────────────────────
exports.RaidEventSchema = exports.StreamEventBaseSchema.extend({
    type: zod_1.z.literal('raid'),
    raider: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
    }),
    viewerCount: zod_1.z.number().int().min(0),
});
// ── SuperChatEvent ─────────────────────────────────────────────────────────
exports.SuperChatEventSchema = exports.StreamEventBaseSchema.extend({
    type: zod_1.z.literal('superchat'),
    sender: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
    }),
    amount: zod_1.z.number(),
    currency: zod_1.z.string(), // ISO 4217
    message: zod_1.z.string().optional(),
    tier: zod_1.z.string().optional(), // YouTube color tier, Twitch sub tier, etc.
});
// ── Extended ChatEvent with moderation fields ──────────────────────────────
exports.ExtendedChatEventSchema = exports.StreamEventBaseSchema.extend({
    type: zod_1.z.literal('chat'),
    author: exports.ChatAuthorSchema,
    message: exports.ChatMessageSchema,
    moderationStatus: exports.ModerationStatusSchema.default('visible'),
    toxicityScore: zod_1.z.number().min(0).max(1).optional(),
});
// ── Extended ModerationEvent ───────────────────────────────────────────────
exports.ExtendedModerationEventSchema = exports.StreamEventBaseSchema.extend({
    type: zod_1.z.literal('moderation'),
    action: zod_1.z.enum(['clear_chat', 'timeout', 'ban', 'suppress', 'flag', 'mask', 'drop', 'alert']),
    targetUserId: zod_1.z.string().optional(),
    moderationStatus: exports.ModerationStatusSchema.default('visible'),
    toxicityScore: zod_1.z.number().min(0).max(1).optional(),
});
// ── Discriminated Union: StreamEvent ───────────────────────────────────────
// Combines all event subtypes into a single discriminated union on 'type'
exports.StreamEventSchema = zod_1.z.discriminatedUnion('type', [
    exports.ExtendedChatEventSchema,
    exports.GiftEventSchema,
    exports.FollowEventSchema,
    exports.RaidEventSchema,
    exports.SuperChatEventSchema,
    exports.ExtendedModerationEventSchema,
]);
// ── Persisted Event ────────────────────────────────────────────────────────
// After being stored in the Event Bus, sequenceNumber and sessionId are guaranteed
exports.PersistedEventSchema = exports.StreamEventSchema.and(zod_1.z.object({
    sequenceNumber: zod_1.z.number().int(),
    sessionId: zod_1.z.string().uuid(),
}));
// ============================================================================
// V2 WEBSOCKET PROTOCOL — COMMAND SCHEMAS (Client → Server)
// ============================================================================
exports.ReplyMessageCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('reply_message'),
    payload: zod_1.z.object({
        platform: exports.PlatformSchema,
        message: zod_1.z.string(),
        replyToEventId: zod_1.z.string().uuid().optional(),
    }),
});
exports.PlaceMarkerCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('place_marker'),
    payload: zod_1.z.object({
        markerId: zod_1.z.string().optional(),
        label: zod_1.z.string().optional(),
    }),
});
exports.SwitchViewModeCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('switch_view_mode'),
    payload: zod_1.z.object({
        mode: zod_1.z.enum(['unified', 'split', 'priority', 'moderator']),
    }),
});
exports.ViewModeSchema = zod_1.z.enum(['unified', 'split', 'priority', 'moderator']);
exports.LinkIdentityCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('link_identity'),
    payload: zod_1.z.object({
        identityId: zod_1.z.string().uuid().nullable(),
        platform: exports.PlatformSchema,
        platformUserId: zod_1.z.string(),
        platformUsername: zod_1.z.string(),
        method: zod_1.z.enum(['manual', 'suggested', 'self_claim']),
    }),
});
exports.UpdateReputationWeightsCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('update_reputation_weights'),
    payload: zod_1.z.object({
        weights: zod_1.z.object({
            messages: zod_1.z.number(),
            gifts: zod_1.z.number(),
            watch_time: zod_1.z.number(),
            engagement: zod_1.z.number(),
            mod_actions: zod_1.z.number(),
            spam_flags: zod_1.z.number(),
        }),
    }),
});
exports.ExportSessionCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('export_session'),
    payload: zod_1.z.object({
        sessionId: zod_1.z.string().uuid(),
        format: zod_1.z.enum(['csv', 'timestamped_log']),
        includeModeration: zod_1.z.boolean().default(true),
    }),
});
exports.RequestAnalyticsCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('request_analytics'),
    payload: zod_1.z.object({
        sessionId: zod_1.z.string().uuid().optional(),
    }),
});
exports.ManagePluginCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('manage_plugin'),
    payload: zod_1.z.object({
        pluginId: zod_1.z.string(),
        operation: zod_1.z.enum(['install', 'enable', 'disable', 'uninstall']),
        capabilities: zod_1.z.array(zod_1.z.enum([
            'network', 'filesystem-read', 'filesystem-write', 'notifications', 'overlay-render'
        ])).optional(),
    }),
});
exports.GetMarketplaceCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('get_marketplace'),
    payload: zod_1.z.object({}),
});
exports.ListPluginsCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('list_plugins'),
    payload: zod_1.z.object({}),
});
exports.GrantPluginCapabilitiesCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('grant_plugin_capabilities'),
    payload: zod_1.z.object({
        pluginId: zod_1.z.string(),
        capabilities: zod_1.z.array(zod_1.z.string()),
    }),
});
exports.DeleteMarkerCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('delete_marker'),
    payload: zod_1.z.object({
        markerId: zod_1.z.string(),
    }),
});
exports.DeleteSessionCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('delete_session'),
    payload: zod_1.z.object({
        sessionId: zod_1.z.string().uuid(),
    }),
});
exports.GetSessionsCommandSchema = zod_1.z.object({
    type: zod_1.z.literal('command'),
    action: zod_1.z.literal('get_sessions'),
    payload: zod_1.z.object({}),
});
// Combined v2 command schema (extends v1 discriminated union)
exports.CommandEventV2Schema = zod_1.z.discriminatedUnion('action', [
    // v1 commands (preserved)
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
    // v2 commands (new)
    exports.ReplyMessageCommandSchema,
    exports.PlaceMarkerCommandSchema,
    exports.SwitchViewModeCommandSchema,
    exports.LinkIdentityCommandSchema,
    exports.UpdateReputationWeightsCommandSchema,
    exports.ExportSessionCommandSchema,
    exports.RequestAnalyticsCommandSchema,
    exports.ManagePluginCommandSchema,
    exports.GetMarketplaceCommandSchema,
    exports.ListPluginsCommandSchema,
    exports.GrantPluginCapabilitiesCommandSchema,
    exports.DeleteMarkerCommandSchema,
    exports.DeleteSessionCommandSchema,
    exports.GetSessionsCommandSchema,
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('backup_database'),
        payload: zod_1.z.object({}),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('restore_database'),
        payload: zod_1.z.object({}),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('get_identities'),
        payload: zod_1.z.object({}),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('manage_platform'),
        payload: zod_1.z.object({
            platform: exports.PlatformSchema,
            action: zod_1.z.enum(['connect', 'disconnect']),
            username: zod_1.z.string().optional(),
        }),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('obs_action'),
        payload: zod_1.z.object({
            obsAction: zod_1.z.enum(['connect', 'disconnect', 'get_scenes', 'set_scene']),
            url: zod_1.z.string().optional(),
            password: zod_1.z.string().optional(),
            sceneName: zod_1.z.string().optional(),
        }),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('get_markers'),
        payload: zod_1.z.object({
            sessionId: zod_1.z.string().uuid().optional()
        }),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('timeout'),
        payload: zod_1.z.object({
            userId: zod_1.z.string(),
            duration: zod_1.z.number().optional(),
            platform: exports.PlatformSchema.optional(),
        }),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('command'),
        action: zod_1.z.literal('ban'),
        payload: zod_1.z.object({
            userId: zod_1.z.string(),
            platform: exports.PlatformSchema.optional(),
        }),
    }),
]);
// ============================================================================
// V2 WEBSOCKET PROTOCOL — SERVER EVENT SCHEMAS (Server → Client)
// ============================================================================
exports.StreamEventWsSchema = zod_1.z.object({
    type: zod_1.z.literal('stream_event'),
    event: exports.StreamEventSchema,
});
exports.ReplyStatusEventSchema = zod_1.z.object({
    type: zod_1.z.literal('reply_status'),
    platform: exports.PlatformSchema,
    status: zod_1.z.enum(['sent', 'failed', 'read_only']),
    error: zod_1.z.string().optional(),
});
exports.AnalyticsReportEventSchema = zod_1.z.object({
    type: zod_1.z.literal('analytics_report'),
    sessionId: zod_1.z.string().uuid(),
    metrics: zod_1.z.object({
        messagesPerMinute: zod_1.z.array(zod_1.z.object({
            timestamp: zod_1.z.string(),
            count: zod_1.z.number(),
        })),
        platformShare: zod_1.z.record(exports.PlatformSchema, zod_1.z.number()),
        topChatters: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            platform: exports.PlatformSchema,
            messageCount: zod_1.z.number(),
        })),
        peakEngagement: zod_1.z.object({
            startTime: zod_1.z.string(),
            endTime: zod_1.z.string(),
            rate: zod_1.z.number(),
        }).optional(),
    }),
});
exports.ExportReadyEventSchema = zod_1.z.object({
    type: zod_1.z.literal('export_ready'),
    sessionId: zod_1.z.string().uuid(),
    format: zod_1.z.enum(['csv', 'timestamped_log']),
    downloadPath: zod_1.z.string(),
    sizeBytes: zod_1.z.number(),
});
exports.PluginStatusEventSchema = zod_1.z.object({
    type: zod_1.z.literal('plugin_status'),
    pluginId: zod_1.z.string(),
    status: zod_1.z.enum(['active', 'error', 'disabled', 'installed', 'listed']),
    error: zod_1.z.string().optional(),
    plugins: zod_1.z.array(zod_1.z.any()).optional(),
});
exports.IdentityUpdateEventSchema = zod_1.z.object({
    type: zod_1.z.literal('identity_update'),
    identity: zod_1.z.object({
        identityId: zod_1.z.string().uuid(),
        displayName: zod_1.z.string(),
        reputationScore: zod_1.z.number(),
        accounts: zod_1.z.array(zod_1.z.object({
            platform: exports.PlatformSchema,
            platformUserId: zod_1.z.string(),
            platformUsername: zod_1.z.string(),
        })),
    }),
});
// ── Session Status Types ───────────────────────────────────────────────────
exports.SessionStatusSchema = zod_1.z.enum(['active', 'ended', 'crashed']);
exports.StreamSessionSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid(),
    startedAt: zod_1.z.string().datetime(),
    endedAt: zod_1.z.string().datetime().nullable(),
    platforms: zod_1.z.array(exports.PlatformSchema),
    totalEvents: zod_1.z.number().int(),
    lastSequenceNumber: zod_1.z.number().int(),
    status: exports.SessionStatusSchema,
});
exports.StreamMarkerSchema = zod_1.z.object({
    markerId: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid(),
    timestamp: zod_1.z.string().datetime(),
    label: zod_1.z.string().nullable(),
    sequenceNumber: zod_1.z.number().int().nullable(),
});
// ── Connector Health ───────────────────────────────────────────────────────
exports.ConnectorHealthSchema = zod_1.z.object({
    platform: exports.PlatformSchema,
    latencyMs: zod_1.z.number(),
    lastEventTime: zod_1.z.string().datetime().nullable(),
    errorRate: zod_1.z.number().min(0).max(1),
    supportsOutbound: zod_1.z.boolean(),
});
