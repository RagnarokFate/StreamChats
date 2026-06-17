import { ChatEvent, Platform } from '@obs-chat/event-schema';
import crypto from 'crypto';

export function parseKickMessage(dataString: string, channelId: string): ChatEvent | null {
  try {
    const data = JSON.parse(dataString);
    
    // Minimal normalization
    return {
      eventId: crypto.randomUUID(),
      platform: 'kick',
      timestamp: data.created_at || new Date().toISOString(),
      type: 'chat',
      author: {
        id: data.sender?.id?.toString() || 'unknown',
        name: data.sender?.username || 'Unknown',
        color: data.sender?.identity?.color || undefined,
        badges: data.sender?.identity?.badges?.map((b: any) => b.text) || []
      },
      message: {
        text: data.content || '',
        fragments: [{ type: 'text', text: data.content || '' }]
      }
    };
  } catch (e) {
    return null;
  }
}
