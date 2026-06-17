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

