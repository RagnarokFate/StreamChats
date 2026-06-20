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
}, "strip", z.ZodTypeAny, {
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    activeTheme: string;
    timestampMode: "relative" | "absolute" | "off";
    emoteGlobalEnabled: boolean;
    emotePlatformToggles: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>>;
}, {
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    activeTheme: string;
    timestampMode: "relative" | "absolute" | "off";
    emoteGlobalEnabled: boolean;
    emotePlatformToggles: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>>;
}>;
export type DashboardSettings = z.infer<typeof DashboardSettingsSchema>;
export declare const ServerConfigSchema: z.ZodObject<{
    bannedWords: z.ZodArray<z.ZodString, "many">;
    bannedWordAction: z.ZodEnum<["mask", "drop", "flag"]>;
    maskCharacter: z.ZodString;
    spamProtectionEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    bannedWords: string[];
    bannedWordAction: "mask" | "drop" | "flag";
    maskCharacter: string;
    spamProtectionEnabled: boolean;
}, {
    bannedWords: string[];
    bannedWordAction: "mask" | "drop" | "flag";
    maskCharacter: string;
    spamProtectionEnabled: boolean;
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
}, "strip", z.ZodTypeAny, {
    status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    reconnectCount: number;
    channelId: string;
    lastError?: string | null | undefined;
    lastConnectedAt?: string | null | undefined;
}, {
    status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
    platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
    reconnectCount: number;
    channelId: string;
    lastError?: string | null | undefined;
    lastConnectedAt?: string | null | undefined;
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
    }, "strip", z.ZodTypeAny, {
        backgroundColor?: string | undefined;
        fontFamily?: string | undefined;
        fontSize?: number | undefined;
        fontWeight?: number | undefined;
        activeTheme?: string | undefined;
        timestampMode?: "relative" | "absolute" | "off" | undefined;
        emoteGlobalEnabled?: boolean | undefined;
        emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
    }, {
        backgroundColor?: string | undefined;
        fontFamily?: string | undefined;
        fontSize?: number | undefined;
        fontWeight?: number | undefined;
        activeTheme?: string | undefined;
        timestampMode?: "relative" | "absolute" | "off" | undefined;
        emoteGlobalEnabled?: boolean | undefined;
        emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
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
    }, "strip", z.ZodTypeAny, {
        status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        reconnectCount: number;
        channelId: string;
        lastError?: string | null | undefined;
        lastConnectedAt?: string | null | undefined;
    }, {
        status: "IDLE" | "CONNECTING" | "CONNECTED" | "WAITING" | "RECONNECTING" | "ERROR";
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        reconnectCount: number;
        channelId: string;
        lastError?: string | null | undefined;
        lastConnectedAt?: string | null | undefined;
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
        bannedWords: z.ZodArray<z.ZodString, "many">;
        bannedWordAction: z.ZodEnum<["mask", "drop", "flag"]>;
        maskCharacter: z.ZodString;
        spamProtectionEnabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        bannedWords: string[];
        bannedWordAction: "mask" | "drop" | "flag";
        maskCharacter: string;
        spamProtectionEnabled: boolean;
    }, {
        bannedWords: string[];
        bannedWordAction: "mask" | "drop" | "flag";
        maskCharacter: string;
        spamProtectionEnabled: boolean;
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
    }[];
    statistics: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        totalMessages: number;
        uniqueChatters: number;
        messagesPerMinute: number;
    }[];
    serverConfig: {
        bannedWords: string[];
        bannedWordAction: "mask" | "drop" | "flag";
        maskCharacter: string;
        spamProtectionEnabled: boolean;
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
    }[];
    statistics: {
        platform: "youtube" | "twitch" | "kick" | "tiktok" | "custom";
        totalMessages: number;
        uniqueChatters: number;
        messagesPerMinute: number;
    }[];
    serverConfig: {
        bannedWords: string[];
        bannedWordAction: "mask" | "drop" | "flag";
        maskCharacter: string;
        spamProtectionEnabled: boolean;
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
        }, "strip", z.ZodTypeAny, {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
        }, {
            backgroundColor?: string | undefined;
            fontFamily?: string | undefined;
            fontSize?: number | undefined;
            fontWeight?: number | undefined;
            activeTheme?: string | undefined;
            timestampMode?: "relative" | "absolute" | "off" | undefined;
            emoteGlobalEnabled?: boolean | undefined;
            emotePlatformToggles?: Partial<Record<"youtube" | "twitch" | "kick" | "tiktok" | "custom", boolean>> | undefined;
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
        };
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"command">;
    action: z.ZodLiteral<"update_moderation">;
    payload: z.ZodObject<{
        config: z.ZodObject<{
            bannedWords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            bannedWordAction: z.ZodOptional<z.ZodEnum<["mask", "drop", "flag"]>>;
            maskCharacter: z.ZodOptional<z.ZodString>;
            spamProtectionEnabled: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | "flag" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
        }, {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | "flag" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | "flag" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
        };
    }, {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | "flag" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    type: "command";
    action: "update_moderation";
    payload: {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | "flag" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
        };
    };
}, {
    type: "command";
    action: "update_moderation";
    payload: {
        config: {
            bannedWords?: string[] | undefined;
            bannedWordAction?: "mask" | "drop" | "flag" | undefined;
            maskCharacter?: string | undefined;
            spamProtectionEnabled?: boolean | undefined;
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
}>]>;
export type CommandEvent = z.infer<typeof CommandEventSchema>;
