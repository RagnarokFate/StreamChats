import { z } from 'zod';
export declare const PlatformSchema: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
export type Platform = z.infer<typeof PlatformSchema>;
export declare const EmoteFragmentSchema: z.ZodObject<{
    type: z.ZodLiteral<"emote">;
    id: z.ZodString;
    url: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "emote";
    id: string;
    url: string;
    alt?: string | undefined;
}, {
    type: "emote";
    id: string;
    url: string;
    alt?: string | undefined;
}>;
export type EmoteFragment = z.infer<typeof EmoteFragmentSchema>;
export declare const TextFragmentSchema: z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "text";
    text: string;
}, {
    type: "text";
    text: string;
}>;
export type TextFragment = z.infer<typeof TextFragmentSchema>;
export declare const MessageFragmentSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"emote">;
    id: z.ZodString;
    url: z.ZodString;
    alt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "emote";
    id: string;
    url: string;
    alt?: string | undefined;
}, {
    type: "emote";
    id: string;
    url: string;
    alt?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "text";
    text: string;
}, {
    type: "text";
    text: string;
}>]>;
export type MessageFragment = z.infer<typeof MessageFragmentSchema>;
export declare const ChatAuthorSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
    badges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    color?: string | undefined;
    badges?: string[] | undefined;
}, {
    id: string;
    name: string;
    color?: string | undefined;
    badges?: string[] | undefined;
}>;
export type ChatAuthor = z.infer<typeof ChatAuthorSchema>;
export declare const ChatMessageSchema: z.ZodObject<{
    text: z.ZodString;
    fragments: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"emote">;
        id: z.ZodString;
        url: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "emote";
        id: string;
        url: string;
        alt?: string | undefined;
    }, {
        type: "emote";
        id: string;
        url: string;
        alt?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
    }, {
        type: "text";
        text: string;
    }>]>, "many">>;
}, "strip", z.ZodTypeAny, {
    text: string;
    fragments?: ({
        type: "emote";
        id: string;
        url: string;
        alt?: string | undefined;
    } | {
        type: "text";
        text: string;
    })[] | undefined;
}, {
    text: string;
    fragments?: ({
        type: "emote";
        id: string;
        url: string;
        alt?: string | undefined;
    } | {
        type: "text";
        text: string;
    })[] | undefined;
}>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export declare const BaseEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
}, {
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
}>;
export declare const ChatEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    type: z.ZodLiteral<"chat">;
    author: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        badges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    }, {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    }>;
    message: z.ZodObject<{
        text: z.ZodString;
        fragments: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            type: z.ZodLiteral<"emote">;
            id: z.ZodString;
            url: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        }, {
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
        }, {
            type: "text";
            text: string;
        }>]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    }, {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    }>;
    moderationStatus: z.ZodOptional<z.ZodEnum<["suppressed", "approved"]>>;
    toxicityScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    message: {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    };
    type: "chat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    author: {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    };
    moderationStatus?: "suppressed" | "approved" | undefined;
    toxicityScore?: number | undefined;
}, {
    message: {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    };
    type: "chat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    author: {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    };
    moderationStatus?: "suppressed" | "approved" | undefined;
    toxicityScore?: number | undefined;
}>;
export type ChatEvent = z.infer<typeof ChatEventSchema>;
export declare const ModerationEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    type: z.ZodLiteral<"moderation">;
    action: z.ZodEnum<["clear_chat", "timeout", "ban"]>;
    targetUserId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "moderation";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    action: "clear_chat" | "timeout" | "ban";
    targetUserId?: string | undefined;
}, {
    type: "moderation";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    action: "clear_chat" | "timeout" | "ban";
    targetUserId?: string | undefined;
}>;
export type ModerationEvent = z.infer<typeof ModerationEventSchema>;
export declare const DashboardSettingsSchema: z.ZodObject<{
    backgroundColor: z.ZodString;
    fontFamily: z.ZodString;
    fontSize: z.ZodNumber;
    fontWeight: z.ZodNumber;
    activeTheme: z.ZodString;
    timestampMode: z.ZodEnum<["relative", "absolute", "off"]>;
    emoteGlobalEnabled: z.ZodBoolean;
    emotePlatformToggles: z.ZodRecord<z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>, z.ZodBoolean>;
    viewMode: z.ZodDefault<z.ZodEnum<["unified", "split", "priority", "moderator"]>>;
}, "strip", z.ZodTypeAny, {
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    activeTheme: string;
    timestampMode: "relative" | "absolute" | "off";
    emoteGlobalEnabled: boolean;
    emotePlatformToggles: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>>;
    viewMode: "unified" | "split" | "priority" | "moderator";
}, {
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    activeTheme: string;
    timestampMode: "relative" | "absolute" | "off";
    emoteGlobalEnabled: boolean;
    emotePlatformToggles: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>>;
    viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
}>;
export type DashboardSettings = z.infer<typeof DashboardSettingsSchema>;
export declare const ServerConfigSchema: z.ZodObject<{
    bannedWords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    bannedWordAction: z.ZodDefault<z.ZodEnum<["mask", "drop"]>>;
    maskCharacter: z.ZodDefault<z.ZodString>;
    spamProtectionEnabled: z.ZodDefault<z.ZodBoolean>;
    aiToxicityEnabled: z.ZodDefault<z.ZodBoolean>;
    aiToxicityThreshold: z.ZodDefault<z.ZodNumber>;
    platforms: z.ZodOptional<z.ZodObject<{
        twitch: z.ZodOptional<z.ZodString>;
        youtube: z.ZodOptional<z.ZodString>;
        kick: z.ZodOptional<z.ZodString>;
        tiktok: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        youtube?: string | undefined;
        twitch?: string | undefined;
        kick?: string | undefined;
        tiktok?: string | undefined;
    }, {
        youtube?: string | undefined;
        twitch?: string | undefined;
        kick?: string | undefined;
        tiktok?: string | undefined;
    }>>;
    reputationWeights: z.ZodOptional<z.ZodObject<{
        messages: z.ZodDefault<z.ZodNumber>;
        gifts: z.ZodDefault<z.ZodNumber>;
        watchTime: z.ZodDefault<z.ZodNumber>;
        modActions: z.ZodDefault<z.ZodNumber>;
        spamFlags: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        messages: number;
        gifts: number;
        watchTime: number;
        modActions: number;
        spamFlags: number;
    }, {
        messages?: number | undefined;
        gifts?: number | undefined;
        watchTime?: number | undefined;
        modActions?: number | undefined;
        spamFlags?: number | undefined;
    }>>;
    pluginPermissions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    bannedWords: string[];
    bannedWordAction: "mask" | "drop";
    maskCharacter: string;
    spamProtectionEnabled: boolean;
    aiToxicityEnabled: boolean;
    aiToxicityThreshold: number;
    platforms?: {
        youtube?: string | undefined;
        twitch?: string | undefined;
        kick?: string | undefined;
        tiktok?: string | undefined;
    } | undefined;
    reputationWeights?: {
        messages: number;
        gifts: number;
        watchTime: number;
        modActions: number;
        spamFlags: number;
    } | undefined;
    pluginPermissions?: Record<string, string[]> | undefined;
}, {
    bannedWords?: string[] | undefined;
    bannedWordAction?: "mask" | "drop" | undefined;
    maskCharacter?: string | undefined;
    spamProtectionEnabled?: boolean | undefined;
    aiToxicityEnabled?: boolean | undefined;
    aiToxicityThreshold?: number | undefined;
    platforms?: {
        youtube?: string | undefined;
        twitch?: string | undefined;
        kick?: string | undefined;
        tiktok?: string | undefined;
    } | undefined;
    reputationWeights?: {
        messages?: number | undefined;
        gifts?: number | undefined;
        watchTime?: number | undefined;
        modActions?: number | undefined;
        spamFlags?: number | undefined;
    } | undefined;
    pluginPermissions?: Record<string, string[]> | undefined;
}>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export declare const ConnectorStatusSchema: z.ZodEnum<["IDLE", "CONNECTING", "CONNECTED", "WAITING", "RECONNECTING", "ERROR"]>;
export type ConnectorStatus = z.infer<typeof ConnectorStatusSchema>;
export declare const PlatformStatusSchema: z.ZodObject<{
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    status: z.ZodEnum<["IDLE", "CONNECTING", "CONNECTED", "WAITING", "RECONNECTING", "ERROR"]>;
    lastError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reconnectCount: z.ZodNumber;
    lastConnectedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    channelId: z.ZodString;
    health: z.ZodOptional<z.ZodObject<{
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        latencyMs: z.ZodNumber;
        lastEventTime: z.ZodNullable<z.ZodString>;
        errorRate: z.ZodNumber;
        supportsOutbound: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        latencyMs: number;
        lastEventTime: string | null;
        errorRate: number;
        supportsOutbound: boolean;
    }, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        latencyMs: number;
        lastEventTime: string | null;
        errorRate: number;
        supportsOutbound: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    reconnectCount: number;
    channelId: string;
    lastError?: string | null | undefined;
    lastConnectedAt?: string | null | undefined;
    health?: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        latencyMs: number;
        lastEventTime: string | null;
        errorRate: number;
        supportsOutbound: boolean;
    } | undefined;
}, {
    status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    reconnectCount: number;
    channelId: string;
    lastError?: string | null | undefined;
    lastConnectedAt?: string | null | undefined;
    health?: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        latencyMs: number;
        lastEventTime: string | null;
        errorRate: number;
        supportsOutbound: boolean;
    } | undefined;
}>;
export type PlatformStatus = z.infer<typeof PlatformStatusSchema>;
export declare const StreamStatisticsSchema: z.ZodObject<{
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    totalMessages: z.ZodNumber;
    uniqueChatters: z.ZodNumber;
    messagesPerMinute: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    totalMessages: number;
    uniqueChatters: number;
    messagesPerMinute: number;
}, {
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    totalMessages: number;
    uniqueChatters: number;
    messagesPerMinute: number;
}>;
export type StreamStatistics = z.infer<typeof StreamStatisticsSchema>;
export declare const SettingsUpdateEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"settings_update">;
    settings: z.ZodObject<{
        backgroundColor: z.ZodOptional<z.ZodString>;
        fontFamily: z.ZodOptional<z.ZodString>;
        fontSize: z.ZodOptional<z.ZodNumber>;
        fontWeight: z.ZodOptional<z.ZodNumber>;
        activeTheme: z.ZodOptional<z.ZodString>;
        timestampMode: z.ZodOptional<z.ZodEnum<["relative", "absolute", "off"]>>;
        emoteGlobalEnabled: z.ZodOptional<z.ZodBoolean>;
        emotePlatformToggles: z.ZodOptional<z.ZodRecord<z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>, z.ZodBoolean>>;
        viewMode: z.ZodOptional<z.ZodDefault<z.ZodEnum<["unified", "split", "priority", "moderator"]>>>;
    }, "strip", z.ZodTypeAny, {
        backgroundColor?: string | undefined;
        fontFamily?: string | undefined;
        fontSize?: number | undefined;
        fontWeight?: number | undefined;
        activeTheme?: string | undefined;
        timestampMode?: "relative" | "absolute" | "off" | undefined;
        emoteGlobalEnabled?: boolean | undefined;
        emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
        viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
    }, {
        backgroundColor?: string | undefined;
        fontFamily?: string | undefined;
        fontSize?: number | undefined;
        fontWeight?: number | undefined;
        activeTheme?: string | undefined;
        timestampMode?: "relative" | "absolute" | "off" | undefined;
        emoteGlobalEnabled?: boolean | undefined;
        emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
        viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "settings_update";
    settings: {
        backgroundColor?: string | undefined;
        fontFamily?: string | undefined;
        fontSize?: number | undefined;
        fontWeight?: number | undefined;
        activeTheme?: string | undefined;
        timestampMode?: "relative" | "absolute" | "off" | undefined;
        emoteGlobalEnabled?: boolean | undefined;
        emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
        viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
    };
}, {
    type: "settings_update";
    settings: {
        backgroundColor?: string | undefined;
        fontFamily?: string | undefined;
        fontSize?: number | undefined;
        fontWeight?: number | undefined;
        activeTheme?: string | undefined;
        timestampMode?: "relative" | "absolute" | "off" | undefined;
        emoteGlobalEnabled?: boolean | undefined;
        emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
        viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
    };
}>;
export type SettingsUpdateEvent = z.infer<typeof SettingsUpdateEventSchema>;
export declare const StatusUpdateEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"status_update">;
    platforms: z.ZodArray<z.ZodObject<{
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        status: z.ZodEnum<["IDLE", "CONNECTING", "CONNECTED", "WAITING", "RECONNECTING", "ERROR"]>;
        lastError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        reconnectCount: z.ZodNumber;
        lastConnectedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        channelId: z.ZodString;
        health: z.ZodOptional<z.ZodObject<{
            platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
            latencyMs: z.ZodNumber;
            lastEventTime: z.ZodNullable<z.ZodString>;
            errorRate: z.ZodNumber;
            supportsOutbound: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            latencyMs: number;
            lastEventTime: string | null;
            errorRate: number;
            supportsOutbound: boolean;
        }, {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            latencyMs: number;
            lastEventTime: string | null;
            errorRate: number;
            supportsOutbound: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        reconnectCount: number;
        channelId: string;
        lastError?: string | null | undefined;
        lastConnectedAt?: string | null | undefined;
        health?: {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            latencyMs: number;
            lastEventTime: string | null;
            errorRate: number;
            supportsOutbound: boolean;
        } | undefined;
    }, {
        status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        reconnectCount: number;
        channelId: string;
        lastError?: string | null | undefined;
        lastConnectedAt?: string | null | undefined;
        health?: {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            latencyMs: number;
            lastEventTime: string | null;
            errorRate: number;
            supportsOutbound: boolean;
        } | undefined;
    }>, "many">;
    statistics: z.ZodArray<z.ZodObject<{
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        totalMessages: z.ZodNumber;
        uniqueChatters: z.ZodNumber;
        messagesPerMinute: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        totalMessages: number;
        uniqueChatters: number;
        messagesPerMinute: number;
    }, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        totalMessages: number;
        uniqueChatters: number;
        messagesPerMinute: number;
    }>, "many">;
    serverConfig: z.ZodObject<{
        bannedWords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        bannedWordAction: z.ZodDefault<z.ZodEnum<["mask", "drop"]>>;
        maskCharacter: z.ZodDefault<z.ZodString>;
        spamProtectionEnabled: z.ZodDefault<z.ZodBoolean>;
        aiToxicityEnabled: z.ZodDefault<z.ZodBoolean>;
        aiToxicityThreshold: z.ZodDefault<z.ZodNumber>;
        platforms: z.ZodOptional<z.ZodObject<{
            twitch: z.ZodOptional<z.ZodString>;
            youtube: z.ZodOptional<z.ZodString>;
            kick: z.ZodOptional<z.ZodString>;
            tiktok: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            youtube?: string | undefined;
            twitch?: string | undefined;
            kick?: string | undefined;
            tiktok?: string | undefined;
        }, {
            youtube?: string | undefined;
            twitch?: string | undefined;
            kick?: string | undefined;
            tiktok?: string | undefined;
        }>>;
        reputationWeights: z.ZodOptional<z.ZodObject<{
            messages: z.ZodDefault<z.ZodNumber>;
            gifts: z.ZodDefault<z.ZodNumber>;
            watchTime: z.ZodDefault<z.ZodNumber>;
            modActions: z.ZodDefault<z.ZodNumber>;
            spamFlags: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            messages: number;
            gifts: number;
            watchTime: number;
            modActions: number;
            spamFlags: number;
        }, {
            messages?: number | undefined;
            gifts?: number | undefined;
            watchTime?: number | undefined;
            modActions?: number | undefined;
            spamFlags?: number | undefined;
        }>>;
        pluginPermissions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        bannedWords: string[];
        bannedWordAction: "mask" | "drop";
        maskCharacter: string;
        spamProtectionEnabled: boolean;
        aiToxicityEnabled: boolean;
        aiToxicityThreshold: number;
        platforms?: {
            youtube?: string | undefined;
            twitch?: string | undefined;
            kick?: string | undefined;
            tiktok?: string | undefined;
        } | undefined;
        reputationWeights?: {
            messages: number;
            gifts: number;
            watchTime: number;
            modActions: number;
            spamFlags: number;
        } | undefined;
        pluginPermissions?: Record<string, string[]> | undefined;
    }, {
        bannedWords?: string[] | undefined;
        bannedWordAction?: "mask" | "drop" | undefined;
        maskCharacter?: string | undefined;
        spamProtectionEnabled?: boolean | undefined;
        aiToxicityEnabled?: boolean | undefined;
        aiToxicityThreshold?: number | undefined;
        platforms?: {
            youtube?: string | undefined;
            twitch?: string | undefined;
            kick?: string | undefined;
            tiktok?: string | undefined;
        } | undefined;
        reputationWeights?: {
            messages?: number | undefined;
            gifts?: number | undefined;
            watchTime?: number | undefined;
            modActions?: number | undefined;
            spamFlags?: number | undefined;
        } | undefined;
        pluginPermissions?: Record<string, string[]> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "status_update";
    platforms: {
        status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        reconnectCount: number;
        channelId: string;
        lastError?: string | null | undefined;
        lastConnectedAt?: string | null | undefined;
        health?: {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            latencyMs: number;
            lastEventTime: string | null;
            errorRate: number;
            supportsOutbound: boolean;
        } | undefined;
    }[];
    statistics: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        totalMessages: number;
        uniqueChatters: number;
        messagesPerMinute: number;
    }[];
    serverConfig: {
        bannedWords: string[];
        bannedWordAction: "mask" | "drop";
        maskCharacter: string;
        spamProtectionEnabled: boolean;
        aiToxicityEnabled: boolean;
        aiToxicityThreshold: number;
        platforms?: {
            youtube?: string | undefined;
            twitch?: string | undefined;
            kick?: string | undefined;
            tiktok?: string | undefined;
        } | undefined;
        reputationWeights?: {
            messages: number;
            gifts: number;
            watchTime: number;
            modActions: number;
            spamFlags: number;
        } | undefined;
        pluginPermissions?: Record<string, string[]> | undefined;
    };
}, {
    type: "status_update";
    platforms: {
        status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        reconnectCount: number;
        channelId: string;
        lastError?: string | null | undefined;
        lastConnectedAt?: string | null | undefined;
        health?: {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            latencyMs: number;
            lastEventTime: string | null;
            errorRate: number;
            supportsOutbound: boolean;
        } | undefined;
    }[];
    statistics: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        totalMessages: number;
        uniqueChatters: number;
        messagesPerMinute: number;
    }[];
    serverConfig: {
        bannedWords?: string[] | undefined;
        bannedWordAction?: "mask" | "drop" | undefined;
        maskCharacter?: string | undefined;
        spamProtectionEnabled?: boolean | undefined;
        aiToxicityEnabled?: boolean | undefined;
        aiToxicityThreshold?: number | undefined;
        platforms?: {
            youtube?: string | undefined;
            twitch?: string | undefined;
            kick?: string | undefined;
            tiktok?: string | undefined;
        } | undefined;
        reputationWeights?: {
            messages?: number | undefined;
            gifts?: number | undefined;
            watchTime?: number | undefined;
            modActions?: number | undefined;
            spamFlags?: number | undefined;
        } | undefined;
        pluginPermissions?: Record<string, string[]> | undefined;
    };
}>;
export type StatusUpdateEvent = z.infer<typeof StatusUpdateEventSchema>;
export declare const CommandEventSchema: z.ZodDiscriminatedUnion<"action", [z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"clear_chat">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "clear_chat";
    payload: {};
}, {
    type: "command";
    action: "clear_chat";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"update_settings">;
    payload: z.ZodObject<{
        settings: z.ZodObject<{
            backgroundColor: z.ZodOptional<z.ZodString>;
            fontFamily: z.ZodOptional<z.ZodString>;
            fontSize: z.ZodOptional<z.ZodNumber>;
            fontWeight: z.ZodOptional<z.ZodNumber>;
            activeTheme: z.ZodOptional<z.ZodString>;
            timestampMode: z.ZodOptional<z.ZodEnum<["relative", "absolute", "off"]>>;
            emoteGlobalEnabled: z.ZodOptional<z.ZodBoolean>;
            emotePlatformToggles: z.ZodOptional<z.ZodRecord<z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>, z.ZodBoolean>>;
            viewMode: z.ZodOptional<z.ZodDefault<z.ZodEnum<["unified", "split", "priority", "moderator"]>>>;
        }, "strip", z.ZodTypeAny, {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        }, {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        settings: {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        };
    }, {
        settings: {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "update_settings";
    payload: {
        settings: {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        };
    };
}, {
    type: "command";
    action: "update_settings";
    payload: {
        settings: {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        };
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"update_moderation">;
    payload: z.ZodObject<{
        config: z.ZodObject<{
            bannedWords: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
            bannedWordAction: z.ZodOptional<z.ZodDefault<z.ZodEnum<["mask", "drop"]>>>;
            maskCharacter: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            spamProtectionEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            aiToxicityEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            aiToxicityThreshold: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            platforms: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                twitch: z.ZodOptional<z.ZodString>;
                youtube: z.ZodOptional<z.ZodString>;
                kick: z.ZodOptional<z.ZodString>;
                tiktok: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            }, {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            }>>>;
            reputationWeights: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                messages: z.ZodDefault<z.ZodNumber>;
                gifts: z.ZodDefault<z.ZodNumber>;
                watchTime: z.ZodDefault<z.ZodNumber>;
                modActions: z.ZodDefault<z.ZodNumber>;
                spamFlags: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                messages: number;
                gifts: number;
                watchTime: number;
                modActions: number;
                spamFlags: number;
            }, {
                messages?: number | undefined;
                gifts?: number | undefined;
                watchTime?: number | undefined;
                modActions?: number | undefined;
                spamFlags?: number | undefined;
            }>>>;
            pluginPermissions: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>>;
        }, "strip", z.ZodTypeAny, {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages: number;
                gifts: number;
                watchTime: number;
                modActions: number;
                spamFlags: number;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        }, {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages?: number | undefined;
                gifts?: number | undefined;
                watchTime?: number | undefined;
                modActions?: number | undefined;
                spamFlags?: number | undefined;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages: number;
                gifts: number;
                watchTime: number;
                modActions: number;
                spamFlags: number;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        };
    }, {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages?: number | undefined;
                gifts?: number | undefined;
                watchTime?: number | undefined;
                modActions?: number | undefined;
                spamFlags?: number | undefined;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "update_moderation";
    payload: {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages: number;
                gifts: number;
                watchTime: number;
                modActions: number;
                spamFlags: number;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        };
    };
}, {
    type: "command";
    action: "update_moderation";
    payload: {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages?: number | undefined;
                gifts?: number | undefined;
                watchTime?: number | undefined;
                modActions?: number | undefined;
                spamFlags?: number | undefined;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        };
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"reconnect_platform">;
    payload: z.ZodObject<{
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    }, "strip", z.ZodTypeAny, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    }, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "reconnect_platform";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    };
}, {
    type: "command";
    action: "reconnect_platform";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"reset_stats">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "reset_stats";
    payload: {};
}, {
    type: "command";
    action: "reset_stats";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"manage_plugin">;
    payload: z.ZodObject<{
        pluginId: z.ZodString;
        action: z.ZodEnum<["enable", "disable", "list", "install"]>;
    }, "strip", z.ZodTypeAny, {
        action: "enable" | "disable" | "list" | "install";
        pluginId: string;
    }, {
        action: "enable" | "disable" | "list" | "install";
        pluginId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "manage_plugin";
    payload: {
        action: "enable" | "disable" | "list" | "install";
        pluginId: string;
    };
}, {
    type: "command";
    action: "manage_plugin";
    payload: {
        action: "enable" | "disable" | "list" | "install";
        pluginId: string;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"obs_action">;
    payload: z.ZodObject<{
        obsAction: z.ZodEnum<["connect", "disconnect", "get_scenes", "set_scene"]>;
        url: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        sceneName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        obsAction: "connect" | "disconnect" | "get_scenes" | "set_scene";
        url?: string | undefined;
        password?: string | undefined;
        sceneName?: string | undefined;
    }, {
        obsAction: "connect" | "disconnect" | "get_scenes" | "set_scene";
        url?: string | undefined;
        password?: string | undefined;
        sceneName?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "obs_action";
    payload: {
        obsAction: "connect" | "disconnect" | "get_scenes" | "set_scene";
        url?: string | undefined;
        password?: string | undefined;
        sceneName?: string | undefined;
    };
}, {
    type: "command";
    action: "obs_action";
    payload: {
        obsAction: "connect" | "disconnect" | "get_scenes" | "set_scene";
        url?: string | undefined;
        password?: string | undefined;
        sceneName?: string | undefined;
    };
}>]>;
export type CommandEvent = z.infer<typeof CommandEventSchema>;
export declare const StreamEventTypeSchema: z.ZodEnum<["chat", "gift", "follow", "raid", "superchat", "moderation"]>;
export type StreamEventType = z.infer<typeof StreamEventTypeSchema>;
export declare const ModerationStatusSchema: z.ZodEnum<["visible", "suppressed", "flagged"]>;
export type ModerationStatus = z.infer<typeof ModerationStatusSchema>;
export declare const StreamEventBaseSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>;
export declare const GiftEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"gift">;
    sender: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    giftType: z.ZodString;
    giftCount: z.ZodNumber;
    monetaryValue: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        currency: string;
    }, {
        amount: number;
        currency: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "gift";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    giftType: string;
    giftCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    monetaryValue?: {
        amount: number;
        currency: string;
    } | undefined;
}, {
    type: "gift";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    giftType: string;
    giftCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    monetaryValue?: {
        amount: number;
        currency: string;
    } | undefined;
}>;
export type GiftEvent = z.infer<typeof GiftEventSchema>;
export declare const FollowEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"follow">;
    follower: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "follow";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    follower: {
        id: string;
        name: string;
    };
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    type: "follow";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    follower: {
        id: string;
        name: string;
    };
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>;
export type FollowEvent = z.infer<typeof FollowEventSchema>;
export declare const RaidEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"raid">;
    raider: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    viewerCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "raid";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    raider: {
        id: string;
        name: string;
    };
    viewerCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    type: "raid";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    raider: {
        id: string;
        name: string;
    };
    viewerCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>;
export type RaidEvent = z.infer<typeof RaidEventSchema>;
export declare const SuperChatEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"superchat">;
    sender: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    amount: z.ZodNumber;
    currency: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
    tier: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "superchat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    amount: number;
    currency: string;
    message?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    tier?: string | undefined;
}, {
    type: "superchat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    amount: number;
    currency: string;
    message?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    tier?: string | undefined;
}>;
export type SuperChatEvent = z.infer<typeof SuperChatEventSchema>;
export declare const ExtendedChatEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"chat">;
    author: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        badges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    }, {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    }>;
    message: z.ZodObject<{
        text: z.ZodString;
        fragments: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            type: z.ZodLiteral<"emote">;
            id: z.ZodString;
            url: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        }, {
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
        }, {
            type: "text";
            text: string;
        }>]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    }, {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    }>;
    moderationStatus: z.ZodDefault<z.ZodEnum<["visible", "suppressed", "flagged"]>>;
    toxicityScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    message: {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    };
    type: "chat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    author: {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    };
    moderationStatus: "suppressed" | "visible" | "flagged";
    toxicityScore?: number | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    message: {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    };
    type: "chat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    author: {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    };
    moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
    toxicityScore?: number | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>;
export type ExtendedChatEvent = z.infer<typeof ExtendedChatEventSchema>;
export declare const ExtendedModerationEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"moderation">;
    action: z.ZodEnum<["clear_chat", "timeout", "ban", "suppress", "flag", "mask", "drop", "alert"]>;
    targetUserId: z.ZodOptional<z.ZodString>;
    moderationStatus: z.ZodDefault<z.ZodEnum<["visible", "suppressed", "flagged"]>>;
    toxicityScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "moderation";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    moderationStatus: "suppressed" | "visible" | "flagged";
    action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
    toxicityScore?: number | undefined;
    targetUserId?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    type: "moderation";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
    moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
    toxicityScore?: number | undefined;
    targetUserId?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>;
export type ExtendedModerationEvent = z.infer<typeof ExtendedModerationEventSchema>;
export declare const StreamEventSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"chat">;
    author: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        badges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    }, {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    }>;
    message: z.ZodObject<{
        text: z.ZodString;
        fragments: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            type: z.ZodLiteral<"emote">;
            id: z.ZodString;
            url: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        }, {
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
        }, {
            type: "text";
            text: string;
        }>]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    }, {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    }>;
    moderationStatus: z.ZodDefault<z.ZodEnum<["visible", "suppressed", "flagged"]>>;
    toxicityScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    message: {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    };
    type: "chat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    author: {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    };
    moderationStatus: "suppressed" | "visible" | "flagged";
    toxicityScore?: number | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    message: {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    };
    type: "chat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    author: {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    };
    moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
    toxicityScore?: number | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"gift">;
    sender: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    giftType: z.ZodString;
    giftCount: z.ZodNumber;
    monetaryValue: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        currency: string;
    }, {
        amount: number;
        currency: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "gift";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    giftType: string;
    giftCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    monetaryValue?: {
        amount: number;
        currency: string;
    } | undefined;
}, {
    type: "gift";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    giftType: string;
    giftCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    monetaryValue?: {
        amount: number;
        currency: string;
    } | undefined;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"follow">;
    follower: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "follow";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    follower: {
        id: string;
        name: string;
    };
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    type: "follow";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    follower: {
        id: string;
        name: string;
    };
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"raid">;
    raider: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    viewerCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "raid";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    raider: {
        id: string;
        name: string;
    };
    viewerCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    type: "raid";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    raider: {
        id: string;
        name: string;
    };
    viewerCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"superchat">;
    sender: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    amount: z.ZodNumber;
    currency: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
    tier: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "superchat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    amount: number;
    currency: string;
    message?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    tier?: string | undefined;
}, {
    type: "superchat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    amount: number;
    currency: string;
    message?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    tier?: string | undefined;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"moderation">;
    action: z.ZodEnum<["clear_chat", "timeout", "ban", "suppress", "flag", "mask", "drop", "alert"]>;
    targetUserId: z.ZodOptional<z.ZodString>;
    moderationStatus: z.ZodDefault<z.ZodEnum<["visible", "suppressed", "flagged"]>>;
    toxicityScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "moderation";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    moderationStatus: "suppressed" | "visible" | "flagged";
    action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
    toxicityScore?: number | undefined;
    targetUserId?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    type: "moderation";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
    moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
    toxicityScore?: number | undefined;
    targetUserId?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>]>;
export type StreamEvent = z.infer<typeof StreamEventSchema>;
export declare const PersistedEventSchema: z.ZodIntersection<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"chat">;
    author: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        badges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    }, {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    }>;
    message: z.ZodObject<{
        text: z.ZodString;
        fragments: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            type: z.ZodLiteral<"emote">;
            id: z.ZodString;
            url: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        }, {
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
        }, {
            type: "text";
            text: string;
        }>]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    }, {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    }>;
    moderationStatus: z.ZodDefault<z.ZodEnum<["visible", "suppressed", "flagged"]>>;
    toxicityScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    message: {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    };
    type: "chat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    author: {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    };
    moderationStatus: "suppressed" | "visible" | "flagged";
    toxicityScore?: number | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    message: {
        text: string;
        fragments?: ({
            type: "emote";
            id: string;
            url: string;
            alt?: string | undefined;
        } | {
            type: "text";
            text: string;
        })[] | undefined;
    };
    type: "chat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    author: {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    };
    moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
    toxicityScore?: number | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"gift">;
    sender: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    giftType: z.ZodString;
    giftCount: z.ZodNumber;
    monetaryValue: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        currency: string;
    }, {
        amount: number;
        currency: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "gift";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    giftType: string;
    giftCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    monetaryValue?: {
        amount: number;
        currency: string;
    } | undefined;
}, {
    type: "gift";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    giftType: string;
    giftCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    monetaryValue?: {
        amount: number;
        currency: string;
    } | undefined;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"follow">;
    follower: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "follow";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    follower: {
        id: string;
        name: string;
    };
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    type: "follow";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    follower: {
        id: string;
        name: string;
    };
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"raid">;
    raider: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    viewerCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "raid";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    raider: {
        id: string;
        name: string;
    };
    viewerCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    type: "raid";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    raider: {
        id: string;
        name: string;
    };
    viewerCount: number;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"superchat">;
    sender: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>;
    amount: z.ZodNumber;
    currency: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
    tier: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "superchat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    amount: number;
    currency: string;
    message?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    tier?: string | undefined;
}, {
    type: "superchat";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    sender: {
        id: string;
        name: string;
    };
    amount: number;
    currency: string;
    message?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
    tier?: string | undefined;
}>, z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    timestamp: z.ZodString;
} & {
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    rawPayload: z.ZodOptional<z.ZodUnknown>;
} & {
    type: z.ZodLiteral<"moderation">;
    action: z.ZodEnum<["clear_chat", "timeout", "ban", "suppress", "flag", "mask", "drop", "alert"]>;
    targetUserId: z.ZodOptional<z.ZodString>;
    moderationStatus: z.ZodDefault<z.ZodEnum<["visible", "suppressed", "flagged"]>>;
    toxicityScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "moderation";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    moderationStatus: "suppressed" | "visible" | "flagged";
    action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
    toxicityScore?: number | undefined;
    targetUserId?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}, {
    type: "moderation";
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    timestamp: string;
    action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
    moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
    toxicityScore?: number | undefined;
    targetUserId?: string | undefined;
    sequenceNumber?: number | undefined;
    sessionId?: string | undefined;
    rawPayload?: unknown;
}>]>, z.ZodObject<{
    sequenceNumber: z.ZodNumber;
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sequenceNumber: number;
    sessionId: string;
}, {
    sequenceNumber: number;
    sessionId: string;
}>>;
export type PersistedEvent = z.infer<typeof PersistedEventSchema>;
export declare const ReplyMessageCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"reply_message">;
    payload: z.ZodObject<{
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        message: z.ZodString;
        replyToEventId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        replyToEventId?: string | undefined;
    }, {
        message: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        replyToEventId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "reply_message";
    payload: {
        message: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        replyToEventId?: string | undefined;
    };
}, {
    type: "command";
    action: "reply_message";
    payload: {
        message: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        replyToEventId?: string | undefined;
    };
}>;
export type ReplyMessageCommand = z.infer<typeof ReplyMessageCommandSchema>;
export declare const PlaceMarkerCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"place_marker">;
    payload: z.ZodObject<{
        markerId: z.ZodOptional<z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        markerId?: string | undefined;
        label?: string | undefined;
    }, {
        markerId?: string | undefined;
        label?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "place_marker";
    payload: {
        markerId?: string | undefined;
        label?: string | undefined;
    };
}, {
    type: "command";
    action: "place_marker";
    payload: {
        markerId?: string | undefined;
        label?: string | undefined;
    };
}>;
export type PlaceMarkerCommand = z.infer<typeof PlaceMarkerCommandSchema>;
export declare const SwitchViewModeCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"switch_view_mode">;
    payload: z.ZodObject<{
        mode: z.ZodEnum<["unified", "split", "priority", "moderator"]>;
    }, "strip", z.ZodTypeAny, {
        mode: "unified" | "split" | "priority" | "moderator";
    }, {
        mode: "unified" | "split" | "priority" | "moderator";
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "switch_view_mode";
    payload: {
        mode: "unified" | "split" | "priority" | "moderator";
    };
}, {
    type: "command";
    action: "switch_view_mode";
    payload: {
        mode: "unified" | "split" | "priority" | "moderator";
    };
}>;
export type SwitchViewModeCommand = z.infer<typeof SwitchViewModeCommandSchema>;
export declare const ViewModeSchema: z.ZodEnum<["unified", "split", "priority", "moderator"]>;
export type ViewMode = z.infer<typeof ViewModeSchema>;
export declare const LinkIdentityCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"link_identity">;
    payload: z.ZodObject<{
        identityId: z.ZodNullable<z.ZodString>;
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        platformUserId: z.ZodString;
        platformUsername: z.ZodString;
        method: z.ZodEnum<["manual", "suggested", "self_claim"]>;
    }, "strip", z.ZodTypeAny, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        identityId: string | null;
        platformUserId: string;
        platformUsername: string;
        method: "manual" | "suggested" | "self_claim";
    }, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        identityId: string | null;
        platformUserId: string;
        platformUsername: string;
        method: "manual" | "suggested" | "self_claim";
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "link_identity";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        identityId: string | null;
        platformUserId: string;
        platformUsername: string;
        method: "manual" | "suggested" | "self_claim";
    };
}, {
    type: "command";
    action: "link_identity";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        identityId: string | null;
        platformUserId: string;
        platformUsername: string;
        method: "manual" | "suggested" | "self_claim";
    };
}>;
export type LinkIdentityCommand = z.infer<typeof LinkIdentityCommandSchema>;
export declare const UpdateReputationWeightsCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"update_reputation_weights">;
    payload: z.ZodObject<{
        weights: z.ZodObject<{
            messages: z.ZodNumber;
            gifts: z.ZodNumber;
            watch_time: z.ZodNumber;
            engagement: z.ZodNumber;
            mod_actions: z.ZodNumber;
            spam_flags: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        }, {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        weights: {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        };
    }, {
        weights: {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "update_reputation_weights";
    payload: {
        weights: {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        };
    };
}, {
    type: "command";
    action: "update_reputation_weights";
    payload: {
        weights: {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        };
    };
}>;
export type UpdateReputationWeightsCommand = z.infer<typeof UpdateReputationWeightsCommandSchema>;
export declare const ExportSessionCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"export_session">;
    payload: z.ZodObject<{
        sessionId: z.ZodString;
        format: z.ZodEnum<["csv", "timestamped_log", "json"]>;
        includeModeration: z.ZodDefault<z.ZodBoolean>;
        destinationPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        format: "csv" | "timestamped_log" | "json";
        includeModeration: boolean;
        destinationPath?: string | undefined;
    }, {
        sessionId: string;
        format: "csv" | "timestamped_log" | "json";
        includeModeration?: boolean | undefined;
        destinationPath?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "export_session";
    payload: {
        sessionId: string;
        format: "csv" | "timestamped_log" | "json";
        includeModeration: boolean;
        destinationPath?: string | undefined;
    };
}, {
    type: "command";
    action: "export_session";
    payload: {
        sessionId: string;
        format: "csv" | "timestamped_log" | "json";
        includeModeration?: boolean | undefined;
        destinationPath?: string | undefined;
    };
}>;
export type ExportSessionCommand = z.infer<typeof ExportSessionCommandSchema>;
export declare const RequestAnalyticsCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"request_analytics">;
    payload: z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sessionId?: string | undefined;
    }, {
        sessionId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "request_analytics";
    payload: {
        sessionId?: string | undefined;
    };
}, {
    type: "command";
    action: "request_analytics";
    payload: {
        sessionId?: string | undefined;
    };
}>;
export type RequestAnalyticsCommand = z.infer<typeof RequestAnalyticsCommandSchema>;
export declare const ManagePluginCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"manage_plugin">;
    payload: z.ZodObject<{
        pluginId: z.ZodString;
        operation: z.ZodEnum<["install", "enable", "disable", "uninstall"]>;
        capabilities: z.ZodOptional<z.ZodArray<z.ZodEnum<["network", "filesystem-read", "filesystem-write", "notifications", "overlay-render"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        pluginId: string;
        operation: "enable" | "disable" | "install" | "uninstall";
        capabilities?: ("network" | "filesystem-read" | "filesystem-write" | "notifications" | "overlay-render")[] | undefined;
    }, {
        pluginId: string;
        operation: "enable" | "disable" | "install" | "uninstall";
        capabilities?: ("network" | "filesystem-read" | "filesystem-write" | "notifications" | "overlay-render")[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "manage_plugin";
    payload: {
        pluginId: string;
        operation: "enable" | "disable" | "install" | "uninstall";
        capabilities?: ("network" | "filesystem-read" | "filesystem-write" | "notifications" | "overlay-render")[] | undefined;
    };
}, {
    type: "command";
    action: "manage_plugin";
    payload: {
        pluginId: string;
        operation: "enable" | "disable" | "install" | "uninstall";
        capabilities?: ("network" | "filesystem-read" | "filesystem-write" | "notifications" | "overlay-render")[] | undefined;
    };
}>;
export type ManagePluginCommand = z.infer<typeof ManagePluginCommandSchema>;
export declare const GetMarketplaceCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"get_marketplace">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "get_marketplace";
    payload: {};
}, {
    type: "command";
    action: "get_marketplace";
    payload: {};
}>;
export type GetMarketplaceCommand = z.infer<typeof GetMarketplaceCommandSchema>;
export declare const ListPluginsCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"list_plugins">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "list_plugins";
    payload: {};
}, {
    type: "command";
    action: "list_plugins";
    payload: {};
}>;
export type ListPluginsCommand = z.infer<typeof ListPluginsCommandSchema>;
export declare const GrantPluginCapabilitiesCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"grant_plugin_capabilities">;
    payload: z.ZodObject<{
        pluginId: z.ZodString;
        capabilities: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        pluginId: string;
        capabilities: string[];
    }, {
        pluginId: string;
        capabilities: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "grant_plugin_capabilities";
    payload: {
        pluginId: string;
        capabilities: string[];
    };
}, {
    type: "command";
    action: "grant_plugin_capabilities";
    payload: {
        pluginId: string;
        capabilities: string[];
    };
}>;
export type GrantPluginCapabilitiesCommand = z.infer<typeof GrantPluginCapabilitiesCommandSchema>;
export declare const DeleteMarkerCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"delete_marker">;
    payload: z.ZodObject<{
        markerId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        markerId: string;
    }, {
        markerId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "delete_marker";
    payload: {
        markerId: string;
    };
}, {
    type: "command";
    action: "delete_marker";
    payload: {
        markerId: string;
    };
}>;
export type DeleteMarkerCommand = z.infer<typeof DeleteMarkerCommandSchema>;
export declare const DeleteSessionCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"delete_session">;
    payload: z.ZodObject<{
        sessionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
    }, {
        sessionId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "delete_session";
    payload: {
        sessionId: string;
    };
}, {
    type: "command";
    action: "delete_session";
    payload: {
        sessionId: string;
    };
}>;
export type DeleteSessionCommand = z.infer<typeof DeleteSessionCommandSchema>;
export declare const GetSessionsCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"get_sessions">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "get_sessions";
    payload: {};
}, {
    type: "command";
    action: "get_sessions";
    payload: {};
}>;
export type GetSessionsCommand = z.infer<typeof GetSessionsCommandSchema>;
export declare const CommandEventV2Schema: z.ZodDiscriminatedUnion<"action", [z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"clear_chat">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "clear_chat";
    payload: {};
}, {
    type: "command";
    action: "clear_chat";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"update_settings">;
    payload: z.ZodObject<{
        settings: z.ZodObject<{
            backgroundColor: z.ZodOptional<z.ZodString>;
            fontFamily: z.ZodOptional<z.ZodString>;
            fontSize: z.ZodOptional<z.ZodNumber>;
            fontWeight: z.ZodOptional<z.ZodNumber>;
            activeTheme: z.ZodOptional<z.ZodString>;
            timestampMode: z.ZodOptional<z.ZodEnum<["relative", "absolute", "off"]>>;
            emoteGlobalEnabled: z.ZodOptional<z.ZodBoolean>;
            emotePlatformToggles: z.ZodOptional<z.ZodRecord<z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>, z.ZodBoolean>>;
            viewMode: z.ZodOptional<z.ZodDefault<z.ZodEnum<["unified", "split", "priority", "moderator"]>>>;
        }, "strip", z.ZodTypeAny, {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        }, {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        settings: {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        };
    }, {
        settings: {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "update_settings";
    payload: {
        settings: {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        };
    };
}, {
    type: "command";
    action: "update_settings";
    payload: {
        settings: {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
            viewMode?: "unified" | "split" | "priority" | "moderator" | undefined;
        };
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"update_moderation">;
    payload: z.ZodObject<{
        config: z.ZodObject<{
            bannedWords: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
            bannedWordAction: z.ZodOptional<z.ZodDefault<z.ZodEnum<["mask", "drop"]>>>;
            maskCharacter: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            spamProtectionEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            aiToxicityEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            aiToxicityThreshold: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            platforms: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                twitch: z.ZodOptional<z.ZodString>;
                youtube: z.ZodOptional<z.ZodString>;
                kick: z.ZodOptional<z.ZodString>;
                tiktok: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            }, {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            }>>>;
            reputationWeights: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                messages: z.ZodDefault<z.ZodNumber>;
                gifts: z.ZodDefault<z.ZodNumber>;
                watchTime: z.ZodDefault<z.ZodNumber>;
                modActions: z.ZodDefault<z.ZodNumber>;
                spamFlags: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                messages: number;
                gifts: number;
                watchTime: number;
                modActions: number;
                spamFlags: number;
            }, {
                messages?: number | undefined;
                gifts?: number | undefined;
                watchTime?: number | undefined;
                modActions?: number | undefined;
                spamFlags?: number | undefined;
            }>>>;
            pluginPermissions: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>>;
        }, "strip", z.ZodTypeAny, {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages: number;
                gifts: number;
                watchTime: number;
                modActions: number;
                spamFlags: number;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        }, {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages?: number | undefined;
                gifts?: number | undefined;
                watchTime?: number | undefined;
                modActions?: number | undefined;
                spamFlags?: number | undefined;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages: number;
                gifts: number;
                watchTime: number;
                modActions: number;
                spamFlags: number;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        };
    }, {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages?: number | undefined;
                gifts?: number | undefined;
                watchTime?: number | undefined;
                modActions?: number | undefined;
                spamFlags?: number | undefined;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "update_moderation";
    payload: {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages: number;
                gifts: number;
                watchTime: number;
                modActions: number;
                spamFlags: number;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        };
    };
}, {
    type: "command";
    action: "update_moderation";
    payload: {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
            aiToxicityEnabled?: boolean | undefined;
            aiToxicityThreshold?: number | undefined;
            platforms?: {
                youtube?: string | undefined;
                twitch?: string | undefined;
                kick?: string | undefined;
                tiktok?: string | undefined;
            } | undefined;
            reputationWeights?: {
                messages?: number | undefined;
                gifts?: number | undefined;
                watchTime?: number | undefined;
                modActions?: number | undefined;
                spamFlags?: number | undefined;
            } | undefined;
            pluginPermissions?: Record<string, string[]> | undefined;
        };
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"reconnect_platform">;
    payload: z.ZodObject<{
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    }, "strip", z.ZodTypeAny, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    }, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "reconnect_platform";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    };
}, {
    type: "command";
    action: "reconnect_platform";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"reset_stats">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "reset_stats";
    payload: {};
}, {
    type: "command";
    action: "reset_stats";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"reply_message">;
    payload: z.ZodObject<{
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        message: z.ZodString;
        replyToEventId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        replyToEventId?: string | undefined;
    }, {
        message: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        replyToEventId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "reply_message";
    payload: {
        message: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        replyToEventId?: string | undefined;
    };
}, {
    type: "command";
    action: "reply_message";
    payload: {
        message: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        replyToEventId?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"place_marker">;
    payload: z.ZodObject<{
        markerId: z.ZodOptional<z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        markerId?: string | undefined;
        label?: string | undefined;
    }, {
        markerId?: string | undefined;
        label?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "place_marker";
    payload: {
        markerId?: string | undefined;
        label?: string | undefined;
    };
}, {
    type: "command";
    action: "place_marker";
    payload: {
        markerId?: string | undefined;
        label?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"switch_view_mode">;
    payload: z.ZodObject<{
        mode: z.ZodEnum<["unified", "split", "priority", "moderator"]>;
    }, "strip", z.ZodTypeAny, {
        mode: "unified" | "split" | "priority" | "moderator";
    }, {
        mode: "unified" | "split" | "priority" | "moderator";
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "switch_view_mode";
    payload: {
        mode: "unified" | "split" | "priority" | "moderator";
    };
}, {
    type: "command";
    action: "switch_view_mode";
    payload: {
        mode: "unified" | "split" | "priority" | "moderator";
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"link_identity">;
    payload: z.ZodObject<{
        identityId: z.ZodNullable<z.ZodString>;
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        platformUserId: z.ZodString;
        platformUsername: z.ZodString;
        method: z.ZodEnum<["manual", "suggested", "self_claim"]>;
    }, "strip", z.ZodTypeAny, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        identityId: string | null;
        platformUserId: string;
        platformUsername: string;
        method: "manual" | "suggested" | "self_claim";
    }, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        identityId: string | null;
        platformUserId: string;
        platformUsername: string;
        method: "manual" | "suggested" | "self_claim";
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "link_identity";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        identityId: string | null;
        platformUserId: string;
        platformUsername: string;
        method: "manual" | "suggested" | "self_claim";
    };
}, {
    type: "command";
    action: "link_identity";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        identityId: string | null;
        platformUserId: string;
        platformUsername: string;
        method: "manual" | "suggested" | "self_claim";
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"update_reputation_weights">;
    payload: z.ZodObject<{
        weights: z.ZodObject<{
            messages: z.ZodNumber;
            gifts: z.ZodNumber;
            watch_time: z.ZodNumber;
            engagement: z.ZodNumber;
            mod_actions: z.ZodNumber;
            spam_flags: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        }, {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        weights: {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        };
    }, {
        weights: {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "update_reputation_weights";
    payload: {
        weights: {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        };
    };
}, {
    type: "command";
    action: "update_reputation_weights";
    payload: {
        weights: {
            messages: number;
            gifts: number;
            watch_time: number;
            engagement: number;
            mod_actions: number;
            spam_flags: number;
        };
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"export_session">;
    payload: z.ZodObject<{
        sessionId: z.ZodString;
        format: z.ZodEnum<["csv", "timestamped_log", "json"]>;
        includeModeration: z.ZodDefault<z.ZodBoolean>;
        destinationPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        format: "csv" | "timestamped_log" | "json";
        includeModeration: boolean;
        destinationPath?: string | undefined;
    }, {
        sessionId: string;
        format: "csv" | "timestamped_log" | "json";
        includeModeration?: boolean | undefined;
        destinationPath?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "export_session";
    payload: {
        sessionId: string;
        format: "csv" | "timestamped_log" | "json";
        includeModeration: boolean;
        destinationPath?: string | undefined;
    };
}, {
    type: "command";
    action: "export_session";
    payload: {
        sessionId: string;
        format: "csv" | "timestamped_log" | "json";
        includeModeration?: boolean | undefined;
        destinationPath?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"request_analytics">;
    payload: z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sessionId?: string | undefined;
    }, {
        sessionId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "request_analytics";
    payload: {
        sessionId?: string | undefined;
    };
}, {
    type: "command";
    action: "request_analytics";
    payload: {
        sessionId?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"manage_plugin">;
    payload: z.ZodObject<{
        pluginId: z.ZodString;
        operation: z.ZodEnum<["install", "enable", "disable", "uninstall"]>;
        capabilities: z.ZodOptional<z.ZodArray<z.ZodEnum<["network", "filesystem-read", "filesystem-write", "notifications", "overlay-render"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        pluginId: string;
        operation: "enable" | "disable" | "install" | "uninstall";
        capabilities?: ("network" | "filesystem-read" | "filesystem-write" | "notifications" | "overlay-render")[] | undefined;
    }, {
        pluginId: string;
        operation: "enable" | "disable" | "install" | "uninstall";
        capabilities?: ("network" | "filesystem-read" | "filesystem-write" | "notifications" | "overlay-render")[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "manage_plugin";
    payload: {
        pluginId: string;
        operation: "enable" | "disable" | "install" | "uninstall";
        capabilities?: ("network" | "filesystem-read" | "filesystem-write" | "notifications" | "overlay-render")[] | undefined;
    };
}, {
    type: "command";
    action: "manage_plugin";
    payload: {
        pluginId: string;
        operation: "enable" | "disable" | "install" | "uninstall";
        capabilities?: ("network" | "filesystem-read" | "filesystem-write" | "notifications" | "overlay-render")[] | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"get_marketplace">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "get_marketplace";
    payload: {};
}, {
    type: "command";
    action: "get_marketplace";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"list_plugins">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "list_plugins";
    payload: {};
}, {
    type: "command";
    action: "list_plugins";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"grant_plugin_capabilities">;
    payload: z.ZodObject<{
        pluginId: z.ZodString;
        capabilities: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        pluginId: string;
        capabilities: string[];
    }, {
        pluginId: string;
        capabilities: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "grant_plugin_capabilities";
    payload: {
        pluginId: string;
        capabilities: string[];
    };
}, {
    type: "command";
    action: "grant_plugin_capabilities";
    payload: {
        pluginId: string;
        capabilities: string[];
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"delete_marker">;
    payload: z.ZodObject<{
        markerId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        markerId: string;
    }, {
        markerId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "delete_marker";
    payload: {
        markerId: string;
    };
}, {
    type: "command";
    action: "delete_marker";
    payload: {
        markerId: string;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"delete_session">;
    payload: z.ZodObject<{
        sessionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
    }, {
        sessionId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "delete_session";
    payload: {
        sessionId: string;
    };
}, {
    type: "command";
    action: "delete_session";
    payload: {
        sessionId: string;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"get_sessions">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "get_sessions";
    payload: {};
}, {
    type: "command";
    action: "get_sessions";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"backup_database">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "backup_database";
    payload: {};
}, {
    type: "command";
    action: "backup_database";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"restore_database">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "restore_database";
    payload: {};
}, {
    type: "command";
    action: "restore_database";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"simulate_test_message">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "simulate_test_message";
    payload: {};
}, {
    type: "command";
    action: "simulate_test_message";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"get_identities">;
    payload: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "get_identities";
    payload: {};
}, {
    type: "command";
    action: "get_identities";
    payload: {};
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"manage_platform">;
    payload: z.ZodObject<{
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        action: z.ZodEnum<["connect", "disconnect"]>;
        username: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        action: "connect" | "disconnect";
        username?: string | undefined;
    }, {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        action: "connect" | "disconnect";
        username?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "manage_platform";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        action: "connect" | "disconnect";
        username?: string | undefined;
    };
}, {
    type: "command";
    action: "manage_platform";
    payload: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        action: "connect" | "disconnect";
        username?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"obs_action">;
    payload: z.ZodObject<{
        obsAction: z.ZodEnum<["connect", "disconnect", "get_scenes", "set_scene"]>;
        url: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        sceneName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        obsAction: "connect" | "disconnect" | "get_scenes" | "set_scene";
        url?: string | undefined;
        password?: string | undefined;
        sceneName?: string | undefined;
    }, {
        obsAction: "connect" | "disconnect" | "get_scenes" | "set_scene";
        url?: string | undefined;
        password?: string | undefined;
        sceneName?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "obs_action";
    payload: {
        obsAction: "connect" | "disconnect" | "get_scenes" | "set_scene";
        url?: string | undefined;
        password?: string | undefined;
        sceneName?: string | undefined;
    };
}, {
    type: "command";
    action: "obs_action";
    payload: {
        obsAction: "connect" | "disconnect" | "get_scenes" | "set_scene";
        url?: string | undefined;
        password?: string | undefined;
        sceneName?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"get_markers">;
    payload: z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sessionId?: string | undefined;
    }, {
        sessionId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "get_markers";
    payload: {
        sessionId?: string | undefined;
    };
}, {
    type: "command";
    action: "get_markers";
    payload: {
        sessionId?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"timeout">;
    payload: z.ZodObject<{
        userId: z.ZodString;
        duration: z.ZodOptional<z.ZodNumber>;
        platform: z.ZodOptional<z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        platform?: "youtube" | "twitch" | "kick" | "tiktok" | "custom" | undefined;
        duration?: number | undefined;
    }, {
        userId: string;
        platform?: "youtube" | "twitch" | "kick" | "tiktok" | "custom" | undefined;
        duration?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "timeout";
    payload: {
        userId: string;
        platform?: "youtube" | "twitch" | "kick" | "tiktok" | "custom" | undefined;
        duration?: number | undefined;
    };
}, {
    type: "command";
    action: "timeout";
    payload: {
        userId: string;
        platform?: "youtube" | "twitch" | "kick" | "tiktok" | "custom" | undefined;
        duration?: number | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"ban">;
    payload: z.ZodObject<{
        userId: z.ZodString;
        platform: z.ZodOptional<z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        platform?: "youtube" | "twitch" | "kick" | "tiktok" | "custom" | undefined;
    }, {
        userId: string;
        platform?: "youtube" | "twitch" | "kick" | "tiktok" | "custom" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "ban";
    payload: {
        userId: string;
        platform?: "youtube" | "twitch" | "kick" | "tiktok" | "custom" | undefined;
    };
}, {
    type: "command";
    action: "ban";
    payload: {
        userId: string;
        platform?: "youtube" | "twitch" | "kick" | "tiktok" | "custom" | undefined;
    };
}>]>;
export type CommandEventV2 = z.infer<typeof CommandEventV2Schema>;
export declare const StreamEventWsSchema: z.ZodObject<{
    type: z.ZodLiteral<"stream_event">;
    event: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        eventId: z.ZodString;
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        timestamp: z.ZodString;
    } & {
        sequenceNumber: z.ZodOptional<z.ZodNumber>;
        sessionId: z.ZodOptional<z.ZodString>;
        rawPayload: z.ZodOptional<z.ZodUnknown>;
    } & {
        type: z.ZodLiteral<"chat">;
        author: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            color: z.ZodOptional<z.ZodString>;
            badges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            color?: string | undefined;
            badges?: string[] | undefined;
        }, {
            id: string;
            name: string;
            color?: string | undefined;
            badges?: string[] | undefined;
        }>;
        message: z.ZodObject<{
            text: z.ZodString;
            fragments: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
                type: z.ZodLiteral<"emote">;
                id: z.ZodString;
                url: z.ZodString;
                alt: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: "emote";
                id: string;
                url: string;
                alt?: string | undefined;
            }, {
                type: "emote";
                id: string;
                url: string;
                alt?: string | undefined;
            }>, z.ZodObject<{
                type: z.ZodLiteral<"text">;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
            }, {
                type: "text";
                text: string;
            }>]>, "many">>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            fragments?: ({
                type: "emote";
                id: string;
                url: string;
                alt?: string | undefined;
            } | {
                type: "text";
                text: string;
            })[] | undefined;
        }, {
            text: string;
            fragments?: ({
                type: "emote";
                id: string;
                url: string;
                alt?: string | undefined;
            } | {
                type: "text";
                text: string;
            })[] | undefined;
        }>;
        moderationStatus: z.ZodDefault<z.ZodEnum<["visible", "suppressed", "flagged"]>>;
        toxicityScore: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        message: {
            text: string;
            fragments?: ({
                type: "emote";
                id: string;
                url: string;
                alt?: string | undefined;
            } | {
                type: "text";
                text: string;
            })[] | undefined;
        };
        type: "chat";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        author: {
            id: string;
            name: string;
            color?: string | undefined;
            badges?: string[] | undefined;
        };
        moderationStatus: "suppressed" | "visible" | "flagged";
        toxicityScore?: number | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    }, {
        message: {
            text: string;
            fragments?: ({
                type: "emote";
                id: string;
                url: string;
                alt?: string | undefined;
            } | {
                type: "text";
                text: string;
            })[] | undefined;
        };
        type: "chat";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        author: {
            id: string;
            name: string;
            color?: string | undefined;
            badges?: string[] | undefined;
        };
        moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
        toxicityScore?: number | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    }>, z.ZodObject<{
        eventId: z.ZodString;
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        timestamp: z.ZodString;
    } & {
        sequenceNumber: z.ZodOptional<z.ZodNumber>;
        sessionId: z.ZodOptional<z.ZodString>;
        rawPayload: z.ZodOptional<z.ZodUnknown>;
    } & {
        type: z.ZodLiteral<"gift">;
        sender: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>;
        giftType: z.ZodString;
        giftCount: z.ZodNumber;
        monetaryValue: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            amount: number;
            currency: string;
        }, {
            amount: number;
            currency: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "gift";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        sender: {
            id: string;
            name: string;
        };
        giftType: string;
        giftCount: number;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
        monetaryValue?: {
            amount: number;
            currency: string;
        } | undefined;
    }, {
        type: "gift";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        sender: {
            id: string;
            name: string;
        };
        giftType: string;
        giftCount: number;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
        monetaryValue?: {
            amount: number;
            currency: string;
        } | undefined;
    }>, z.ZodObject<{
        eventId: z.ZodString;
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        timestamp: z.ZodString;
    } & {
        sequenceNumber: z.ZodOptional<z.ZodNumber>;
        sessionId: z.ZodOptional<z.ZodString>;
        rawPayload: z.ZodOptional<z.ZodUnknown>;
    } & {
        type: z.ZodLiteral<"follow">;
        follower: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "follow";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        follower: {
            id: string;
            name: string;
        };
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    }, {
        type: "follow";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        follower: {
            id: string;
            name: string;
        };
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    }>, z.ZodObject<{
        eventId: z.ZodString;
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        timestamp: z.ZodString;
    } & {
        sequenceNumber: z.ZodOptional<z.ZodNumber>;
        sessionId: z.ZodOptional<z.ZodString>;
        rawPayload: z.ZodOptional<z.ZodUnknown>;
    } & {
        type: z.ZodLiteral<"raid">;
        raider: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>;
        viewerCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "raid";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        raider: {
            id: string;
            name: string;
        };
        viewerCount: number;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    }, {
        type: "raid";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        raider: {
            id: string;
            name: string;
        };
        viewerCount: number;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    }>, z.ZodObject<{
        eventId: z.ZodString;
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        timestamp: z.ZodString;
    } & {
        sequenceNumber: z.ZodOptional<z.ZodNumber>;
        sessionId: z.ZodOptional<z.ZodString>;
        rawPayload: z.ZodOptional<z.ZodUnknown>;
    } & {
        type: z.ZodLiteral<"superchat">;
        sender: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>;
        amount: z.ZodNumber;
        currency: z.ZodString;
        message: z.ZodOptional<z.ZodString>;
        tier: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "superchat";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        sender: {
            id: string;
            name: string;
        };
        amount: number;
        currency: string;
        message?: string | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
        tier?: string | undefined;
    }, {
        type: "superchat";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        sender: {
            id: string;
            name: string;
        };
        amount: number;
        currency: string;
        message?: string | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
        tier?: string | undefined;
    }>, z.ZodObject<{
        eventId: z.ZodString;
        platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
        timestamp: z.ZodString;
    } & {
        sequenceNumber: z.ZodOptional<z.ZodNumber>;
        sessionId: z.ZodOptional<z.ZodString>;
        rawPayload: z.ZodOptional<z.ZodUnknown>;
    } & {
        type: z.ZodLiteral<"moderation">;
        action: z.ZodEnum<["clear_chat", "timeout", "ban", "suppress", "flag", "mask", "drop", "alert"]>;
        targetUserId: z.ZodOptional<z.ZodString>;
        moderationStatus: z.ZodDefault<z.ZodEnum<["visible", "suppressed", "flagged"]>>;
        toxicityScore: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "moderation";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        moderationStatus: "suppressed" | "visible" | "flagged";
        action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
        toxicityScore?: number | undefined;
        targetUserId?: string | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    }, {
        type: "moderation";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
        moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
        toxicityScore?: number | undefined;
        targetUserId?: string | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    }>]>;
}, "strip", z.ZodTypeAny, {
    type: "stream_event";
    event: {
        type: "gift";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        sender: {
            id: string;
            name: string;
        };
        giftType: string;
        giftCount: number;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
        monetaryValue?: {
            amount: number;
            currency: string;
        } | undefined;
    } | {
        type: "follow";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        follower: {
            id: string;
            name: string;
        };
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    } | {
        type: "raid";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        raider: {
            id: string;
            name: string;
        };
        viewerCount: number;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    } | {
        type: "superchat";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        sender: {
            id: string;
            name: string;
        };
        amount: number;
        currency: string;
        message?: string | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
        tier?: string | undefined;
    } | {
        message: {
            text: string;
            fragments?: ({
                type: "emote";
                id: string;
                url: string;
                alt?: string | undefined;
            } | {
                type: "text";
                text: string;
            })[] | undefined;
        };
        type: "chat";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        author: {
            id: string;
            name: string;
            color?: string | undefined;
            badges?: string[] | undefined;
        };
        moderationStatus: "suppressed" | "visible" | "flagged";
        toxicityScore?: number | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    } | {
        type: "moderation";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        moderationStatus: "suppressed" | "visible" | "flagged";
        action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
        toxicityScore?: number | undefined;
        targetUserId?: string | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    };
}, {
    type: "stream_event";
    event: {
        type: "gift";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        sender: {
            id: string;
            name: string;
        };
        giftType: string;
        giftCount: number;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
        monetaryValue?: {
            amount: number;
            currency: string;
        } | undefined;
    } | {
        type: "follow";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        follower: {
            id: string;
            name: string;
        };
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    } | {
        type: "raid";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        raider: {
            id: string;
            name: string;
        };
        viewerCount: number;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    } | {
        type: "superchat";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        sender: {
            id: string;
            name: string;
        };
        amount: number;
        currency: string;
        message?: string | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
        tier?: string | undefined;
    } | {
        message: {
            text: string;
            fragments?: ({
                type: "emote";
                id: string;
                url: string;
                alt?: string | undefined;
            } | {
                type: "text";
                text: string;
            })[] | undefined;
        };
        type: "chat";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        author: {
            id: string;
            name: string;
            color?: string | undefined;
            badges?: string[] | undefined;
        };
        moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
        toxicityScore?: number | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    } | {
        type: "moderation";
        eventId: string;
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        timestamp: string;
        action: "clear_chat" | "timeout" | "ban" | "mask" | "drop" | "suppress" | "flag" | "alert";
        moderationStatus?: "suppressed" | "visible" | "flagged" | undefined;
        toxicityScore?: number | undefined;
        targetUserId?: string | undefined;
        sequenceNumber?: number | undefined;
        sessionId?: string | undefined;
        rawPayload?: unknown;
    };
}>;
export type StreamEventWs = z.infer<typeof StreamEventWsSchema>;
export declare const ReplyStatusEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"reply_status">;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    status: z.ZodEnum<["sent", "failed", "read_only"]>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "reply_status";
    status: "sent" | "failed" | "read_only";
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    error?: string | undefined;
}, {
    type: "reply_status";
    status: "sent" | "failed" | "read_only";
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    error?: string | undefined;
}>;
export type ReplyStatusEvent = z.infer<typeof ReplyStatusEventSchema>;
export declare const AnalyticsReportEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"analytics_report">;
    sessionId: z.ZodString;
    metrics: z.ZodObject<{
        messagesPerMinute: z.ZodArray<z.ZodObject<{
            timestamp: z.ZodString;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timestamp: string;
            count: number;
        }, {
            timestamp: string;
            count: number;
        }>, "many">;
        platformShare: z.ZodRecord<z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>, z.ZodNumber>;
        topChatters: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
            messageCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            messageCount: number;
        }, {
            name: string;
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            messageCount: number;
        }>, "many">;
        peakEngagement: z.ZodOptional<z.ZodObject<{
            startTime: z.ZodString;
            endTime: z.ZodString;
            rate: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startTime: string;
            endTime: string;
            rate: number;
        }, {
            startTime: string;
            endTime: string;
            rate: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        messagesPerMinute: {
            timestamp: string;
            count: number;
        }[];
        platformShare: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", number>>;
        topChatters: {
            name: string;
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            messageCount: number;
        }[];
        peakEngagement?: {
            startTime: string;
            endTime: string;
            rate: number;
        } | undefined;
    }, {
        messagesPerMinute: {
            timestamp: string;
            count: number;
        }[];
        platformShare: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", number>>;
        topChatters: {
            name: string;
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            messageCount: number;
        }[];
        peakEngagement?: {
            startTime: string;
            endTime: string;
            rate: number;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "analytics_report";
    sessionId: string;
    metrics: {
        messagesPerMinute: {
            timestamp: string;
            count: number;
        }[];
        platformShare: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", number>>;
        topChatters: {
            name: string;
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            messageCount: number;
        }[];
        peakEngagement?: {
            startTime: string;
            endTime: string;
            rate: number;
        } | undefined;
    };
}, {
    type: "analytics_report";
    sessionId: string;
    metrics: {
        messagesPerMinute: {
            timestamp: string;
            count: number;
        }[];
        platformShare: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", number>>;
        topChatters: {
            name: string;
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            messageCount: number;
        }[];
        peakEngagement?: {
            startTime: string;
            endTime: string;
            rate: number;
        } | undefined;
    };
}>;
export type AnalyticsReportEvent = z.infer<typeof AnalyticsReportEventSchema>;
export declare const ExportReadyEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"export_ready">;
    sessionId: z.ZodString;
    format: z.ZodEnum<["csv", "timestamped_log"]>;
    downloadPath: z.ZodString;
    sizeBytes: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "export_ready";
    sessionId: string;
    format: "csv" | "timestamped_log";
    downloadPath: string;
    sizeBytes: number;
}, {
    type: "export_ready";
    sessionId: string;
    format: "csv" | "timestamped_log";
    downloadPath: string;
    sizeBytes: number;
}>;
export type ExportReadyEvent = z.infer<typeof ExportReadyEventSchema>;
export declare const PluginStatusEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"plugin_status">;
    pluginId: z.ZodString;
    status: z.ZodEnum<["active", "error", "disabled", "installed", "listed"]>;
    error: z.ZodOptional<z.ZodString>;
    plugins: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "plugin_status";
    status: "error" | "active" | "disabled" | "installed" | "listed";
    pluginId: string;
    error?: string | undefined;
    plugins?: any[] | undefined;
}, {
    type: "plugin_status";
    status: "error" | "active" | "disabled" | "installed" | "listed";
    pluginId: string;
    error?: string | undefined;
    plugins?: any[] | undefined;
}>;
export type PluginStatusEvent = z.infer<typeof PluginStatusEventSchema>;
export declare const IdentityUpdateEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"identity_update">;
    identity: z.ZodObject<{
        identityId: z.ZodString;
        displayName: z.ZodString;
        reputationScore: z.ZodNumber;
        accounts: z.ZodArray<z.ZodObject<{
            platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
            platformUserId: z.ZodString;
            platformUsername: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            platformUserId: string;
            platformUsername: string;
        }, {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            platformUserId: string;
            platformUsername: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        identityId: string;
        displayName: string;
        reputationScore: number;
        accounts: {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            platformUserId: string;
            platformUsername: string;
        }[];
    }, {
        identityId: string;
        displayName: string;
        reputationScore: number;
        accounts: {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            platformUserId: string;
            platformUsername: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    type: "identity_update";
    identity: {
        identityId: string;
        displayName: string;
        reputationScore: number;
        accounts: {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            platformUserId: string;
            platformUsername: string;
        }[];
    };
}, {
    type: "identity_update";
    identity: {
        identityId: string;
        displayName: string;
        reputationScore: number;
        accounts: {
            platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
            platformUserId: string;
            platformUsername: string;
        }[];
    };
}>;
export type IdentityUpdateEvent = z.infer<typeof IdentityUpdateEventSchema>;
export declare const SessionStatusSchema: z.ZodEnum<["active", "ended", "crashed"]>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export declare const StreamSessionSchema: z.ZodObject<{
    sessionId: z.ZodString;
    startedAt: z.ZodString;
    endedAt: z.ZodNullable<z.ZodString>;
    platforms: z.ZodArray<z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>, "many">;
    totalEvents: z.ZodNumber;
    lastSequenceNumber: z.ZodNumber;
    status: z.ZodEnum<["active", "ended", "crashed"]>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "ended" | "crashed";
    platforms: ("youtube" | "twitch" | "kick" | "tiktok" | "custom")[];
    sessionId: string;
    startedAt: string;
    endedAt: string | null;
    totalEvents: number;
    lastSequenceNumber: number;
}, {
    status: "active" | "ended" | "crashed";
    platforms: ("youtube" | "twitch" | "kick" | "tiktok" | "custom")[];
    sessionId: string;
    startedAt: string;
    endedAt: string | null;
    totalEvents: number;
    lastSequenceNumber: number;
}>;
export type StreamSession = z.infer<typeof StreamSessionSchema>;
export declare const StreamMarkerSchema: z.ZodObject<{
    markerId: z.ZodString;
    sessionId: z.ZodString;
    timestamp: z.ZodString;
    label: z.ZodNullable<z.ZodString>;
    sequenceNumber: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    sequenceNumber: number | null;
    sessionId: string;
    markerId: string;
    label: string | null;
}, {
    timestamp: string;
    sequenceNumber: number | null;
    sessionId: string;
    markerId: string;
    label: string | null;
}>;
export type StreamMarker = z.infer<typeof StreamMarkerSchema>;
export declare const ConnectorHealthSchema: z.ZodObject<{
    platform: z.ZodEnum<["youtube", "twitch", "kick", "tiktok", "custom"]>;
    latencyMs: z.ZodNumber;
    lastEventTime: z.ZodNullable<z.ZodString>;
    errorRate: z.ZodNumber;
    supportsOutbound: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    latencyMs: number;
    lastEventTime: string | null;
    errorRate: number;
    supportsOutbound: boolean;
}, {
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    latencyMs: number;
    lastEventTime: string | null;
    errorRate: number;
    supportsOutbound: boolean;
}>;
export type ConnectorHealth = z.infer<typeof ConnectorHealthSchema>;
