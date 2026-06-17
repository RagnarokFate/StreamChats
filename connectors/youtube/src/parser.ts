import { ChatEvent, MessageFragment } from '@obs-chat/event-schema';
import crypto from 'crypto';

export function parseChatActions(actions: any[]): ChatEvent[] {
  const events: ChatEvent[] = [];
  
  for (const rawAction of actions) {
    let action = rawAction;
    if (action?.replayChatItemAction?.actions?.[0]) {
      action = action.replayChatItemAction.actions[0];
    }
    
    const itemContent = action?.addChatItemAction?.item;
    if (!itemContent) continue;
    
    const rendererKey = Object.keys(itemContent)[0];
    const item = itemContent[rendererKey];
    
    if (!item || !item.authorName) continue;
    
    const authorId = item.authorExternalChannelId || 'unknown';
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
    
    const messageRuns = item.message?.runs || item.headerSubtext?.runs || [];
    
    if (messageRuns.length > 0) {
      for (const run of messageRuns) {
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
    } else {
      // If it's a paid message but has no text, or a membership just show a generic text
      if (rendererKey === 'liveChatMembershipItemRenderer') {
        fullText = 'New Member!';
      } else if (rendererKey === 'liveChatPaidMessageRenderer') {
        fullText = item.purchaseAmountText?.simpleText || 'Super Chat!';
      } else if (rendererKey === 'liveChatPaidStickerRenderer') {
        fullText = item.purchaseAmountText?.simpleText || 'Super Sticker!';
      } else if (rendererKey === 'liveChatViewerEngagementMessageRenderer') {
        fullText = 'Engagement Message';
      } else {
        continue; // Skip unknown empty messages
      }
      fragments.push({ type: 'text', text: fullText });
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
