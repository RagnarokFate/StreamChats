"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationEventSchema = exports.ChatEventSchema = exports.BaseEventSchema = exports.ChatMessageSchema = exports.ChatAuthorSchema = exports.MessageFragmentSchema = exports.TextFragmentSchema = exports.EmoteFragmentSchema = exports.PlatformSchema = void 0;
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
