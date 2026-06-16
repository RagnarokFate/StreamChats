import { Platform } from '@obs-chat/event-schema';

export interface ResolvedInput {
  platform: Platform;
  channelId: string;
  originalInput: string;
}

export function resolveInput(input: string): ResolvedInput {
  let channelId = input.trim();
  
  try {
    const url = new URL(channelId);
    if (url.hostname.includes('twitch.tv')) {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        channelId = parts[0];
      }
    }
  } catch (e) {
    // Not a URL, treat as bare username
  }

  // Remove leading # if present
  if (channelId.startsWith('#')) {
    channelId = channelId.slice(1);
  }

  channelId = channelId.toLowerCase();

  return {
    platform: 'twitch',
    channelId,
    originalInput: input,
  };
}
