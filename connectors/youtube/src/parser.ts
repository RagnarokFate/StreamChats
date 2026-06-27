import { StreamEvent, MessageFragment } from '@obs-chat/event-schema';
import crypto from 'crypto';

export function parseChatActions(actions: any[]): StreamEvent[] {
  const events: StreamEvent[] = [];
  
  for (const rawAction of actions) {
    let action = rawAction;
    if (action?.replayChatItemAction?.actions?.[0]) {
      action = action.replayChatItemAction.actions[0];
    }
    
    const itemContent = action?.addChatItemAction?.item;
    if (!itemContent) continue;
    
    const rendererKey = Object.keys(itemContent)[0];
    const item = itemContent[rendererKey];
    
    if (!item || (!item.authorName && rendererKey !== 'liveChatViewerEngagementMessageRenderer')) continue;
    
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
    
    const timestampUsec = item.timestampUsec;
    const timestamp = timestampUsec ? new Date(parseInt(timestampUsec, 10) / 1000).toISOString() : new Date().toISOString();
    const eventId = crypto.randomUUID();

    if (rendererKey === 'liveChatPaidMessageRenderer' || rendererKey === 'liveChatPaidStickerRenderer') {
      const amountText = item.purchaseAmountText?.simpleText || '';
      // Very basic extraction of amount. Assuming it's something like "$5.00"
      const numericAmount = parseFloat(amountText.replace(/[^0-9.]/g, '')) || 0;
      const currency = amountText.replace(/[0-9., ]/g, '') || 'USD'; // Simplified currency extraction

      let messageText = '';
      if (item.message?.runs) {
        messageText = item.message.runs.map((r: any) => r.text || r.emoji?.shortcuts?.[0] || '').join('');
      }

      events.push({
        eventId,
        platform: 'youtube',
        timestamp,
        type: 'superchat',
        sender: { id: authorId, name: authorName },
        amount: numericAmount,
        currency: currency,
        message: messageText || undefined,
        tier: item.headerBackgroundColor?.toString(),
        rawPayload: item
      });
      continue;
    }

    if (rendererKey === 'liveChatMembershipItemRenderer') {
      const headerSubtext = item.headerSubtext?.runs?.map((r: any) => r.text).join('') || 'New Member';
      
      events.push({
        eventId,
        platform: 'youtube',
        timestamp,
        type: 'gift',
        sender: { id: authorId, name: authorName },
        giftType: 'membership',
        giftCount: 1, // YT memberships are usually 1 at a time, or gift bombs are structured differently (SponsorshipsGiftPurchaseAnnouncementRenderer)
        rawPayload: item
      });
      continue;
    }

    // Process message fragments for normal chat
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
      if (rendererKey === 'liveChatViewerEngagementMessageRenderer') {
        fullText = 'Engagement Message';
      } else {
        continue; // Skip unknown empty messages
      }
      fragments.push({ type: 'text', text: fullText });
    }
    
    events.push({
      eventId,
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
      },
      moderationStatus: 'visible',
      rawPayload: item
    });
  }
  
  return events;
}
