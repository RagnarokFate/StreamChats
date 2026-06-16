import { ChatEvent, MessageFragment } from '@obs-chat/event-schema';
import crypto from 'crypto';

export function parseChatActions(actions: any[]): ChatEvent[] {
  const events: ChatEvent[] = [];
  
  for (const action of actions) {
    const item = action?.addChatItemAction?.item?.liveChatTextMessageRenderer;
    if (!item) continue;
    
    const authorId = item.authorExternalChannelId;
    const authorName = item.authorName?.simpleText || 'Unknown';
    
    // Process badges
    const badges: string[] = [];
    if (item.authorBadges) {
      for (const badge of item.authorBadges) {
        const tooltip = badge?.liveChatAuthorBadgeRenderer?.tooltip;
        if (tooltip) badges.push(tooltip);
      }
    }
    
    // Process message fragments
    const fragments: MessageFragment[] = [];
    let fullText = '';
    
    if (item.message?.runs) {
      for (const run of item.message.runs) {
        if (run.text) {
          fragments.push({ type: 'text', text: run.text });
          fullText += run.text;
        } else if (run.emoji) {
          const emojiId = run.emoji.emojiId;
          const url = run.emoji.image?.thumbnails?.[0]?.url;
          const alt = run.emoji.shortcuts?.[0] || '';
          if (url) {
            fragments.push({ type: 'emote', id: emojiId, url, alt });
            fullText += alt;
          }
        }
      }
    }
    
    const timestampUsec = item.timestampUsec;
    const timestamp = timestampUsec ? new Date(parseInt(timestampUsec, 10) / 1000).toISOString() : new Date().toISOString();
    
    events.push({
      eventId: crypto.randomUUID(),
      platform: 'youtube',
      timestamp,
      type: 'chat',
      author: {
        id: authorId,
        name: authorName,
        badges
      },
      message: {
        text: fullText,
        fragments
      }
    });
  }
  
  return events;
}
