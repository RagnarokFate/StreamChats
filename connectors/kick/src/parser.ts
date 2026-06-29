import { StreamEvent } from '@obs-chat/event-schema';
import crypto from 'crypto';

export function parseKickMessage(dataString: string, channelId: string): StreamEvent | null {
  try {
    const data = JSON.parse(dataString);
    
    // Check if it's a gift or something else here if Kick provides it in this event
    // For now, assume chat message
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
      },
      moderationStatus: 'visible',
      rawPayload: data
    };
  } catch (e) {
    return null;
  }
}
