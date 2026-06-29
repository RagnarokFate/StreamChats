import { StreamEvent } from '@obs-chat/event-schema';

interface MessageRecord {
  timestamp: number;
  text: string;
}

/**
 * Handles rate limiting and raid spam detection.
 * Detects N identical messages within T seconds and suppresses them.
 */
export class RateLimiterHandler {
  private threshold: number;
  private windowMs: number;
  private history: MessageRecord[] = [];

  constructor(threshold: number = 50, windowSeconds: number = 5) {
    this.threshold = threshold;
    this.windowMs = windowSeconds * 1000;
  }

  public handle(event: StreamEvent): StreamEvent {
    if (!('text' in event) || typeof event.text !== 'string') {
      return event;
    }

    const now = Date.now();
    this.history.push({ timestamp: now, text: event.text });

    // Clean up old history
    this.history = this.history.filter(m => now - m.timestamp <= this.windowMs);

    // Count occurrences of the current text
    let count = 0;
    for (const record of this.history) {
      if (record.text === event.text) {
        count++;
      }
    }

    if (count >= this.threshold) {
      return {
        ...event,
        moderationStatus: 'suppressed'
      } as unknown as StreamEvent;
    }

    return event;
  }
}
