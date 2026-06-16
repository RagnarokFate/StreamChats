import { z } from 'zod';
export declare const PlatformSchema: z.ZodEnum<["youtube", "twitch", "kick", "custom"]>;
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
    platform: z.ZodEnum<["youtube", "twitch", "kick", "custom"]>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "custom";
    timestamp: string;
}, {
    eventId: string;
    platform: "youtube" | "twitch" | "kick" | "custom";
    timestamp: string;
}>;
export declare const ChatEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    platform: z.ZodEnum<["youtube", "twitch", "kick", "custom"]>;
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
    platform: "youtube" | "twitch" | "kick" | "custom";
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
    platform: "youtube" | "twitch" | "kick" | "custom";
    timestamp: string;
    author: {
        id: string;
        name: string;
        color?: string | undefined;
        badges?: string[] | undefined;
    };
}>;
export type ChatEvent = z.infer<typeof ChatEventSchema>;
