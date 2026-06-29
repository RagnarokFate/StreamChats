import { StreamEvent } from '@obs-chat/event-schema';

/**
 * Handles shadow suppression.
 * Sets moderationStatus to 'suppressed' if the message matches certain predefined criteria,
 * such as local blocklists or spam flags, without actually deleting it on the platform.
 */
export class ShadowSuppressHandler {
  private blocklist: Set<string>;

  constructor(initialBlocklist: string[] = []) {
    this.blocklist = new Set(initialBlocklist.map(w => w.toLowerCase()));
  }

  public handle(event: StreamEvent): StreamEvent {
    // Only process events that have text (like ChatEvent or SuperChatEvent)
    if ('text' in event && typeof event.text === 'string') {
      const textLower = event.text.toLowerCase();
      for (const word of this.blocklist) {
        if (textLower.includes(word)) {
          return {
            ...event,
            moderationStatus: 'suppressed'
          } as unknown as StreamEvent;
        }
      }
    }
    return event;
  }

  public addBlockedWord(word: string): void {
    this.blocklist.add(word.toLowerCase());
  }

  public removeBlockedWord(word: string): void {
    this.blocklist.delete(word.toLowerCase());
  }
}
