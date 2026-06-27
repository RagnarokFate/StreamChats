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
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      const v = url.searchParams.get('v');
      if (v) {
        channelId = v;
      } else if (url.pathname.startsWith('/watch')) {
         // handle case without v param if malformed
      } else if (url.hostname.includes('youtu.be')) {
         channelId = url.pathname.slice(1);
      } else if (url.pathname.startsWith('/@')) {
         channelId = url.pathname.split('/')[1];
      }
    }
  } catch (e) {
    // Not a URL. If it's not an 11-character video ID, assume it's a handle.
    if (channelId.length !== 11 && !channelId.startsWith('@')) {
      channelId = '@' + channelId;
    }
  }

  return {
    platform: 'youtube',
    channelId,
    originalInput: input,
  };
}
