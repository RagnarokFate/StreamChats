import { EventStore } from '@obs-chat/event-bus';
import { StreamStatistics, ChatEvent, SuperChatEvent, GiftEvent, StreamEvent } from '@obs-chat/event-schema';

export interface AnalyticsSummary {
  sessionId: string;
  totalMessages: number;
  totalUniqueChatters: number;
  messagesByPlatform: Record<string, number>;
  eventsByType: Record<string, number>;
  peakMessagesPerMinute: number;
  durationMinutes: number;
}

export class AnalyticsEngine {
  private store: EventStore;
  private currentStats: Map<string, StreamStatistics> = new Map();

  constructor(store: EventStore) {
    this.store = store;
  }

  public getSessionSummary(sessionId: string): AnalyticsSummary | null {
    const session = this.store.getSession(sessionId);
    if (!session) return null;

    const events = this.store.getEventsBySession(sessionId);
    const messagesByPlatform = this.store.getEventCountByPlatform(sessionId);
    const eventsByType = this.store.getEventCountByType(sessionId);

    const chatters = new Set<string>();
    const timestamps: number[] = [];

    events.forEach((row: any) => {
      const payload = JSON.parse(row.payload);
      if (payload.author?.id) {
        chatters.add(`${payload.platform}:${payload.author.id}`);
      }
      if (payload.timestamp) {
        timestamps.push(new Date(payload.timestamp).getTime());
      }
    });

    // Calculate peak messages per minute
    let peakMessagesPerMinute = 0;
    if (timestamps.length > 0) {
      timestamps.sort((a, b) => a - b);
      const startTime = timestamps[0];
      const endTime = timestamps[timestamps.length - 1];
      
      const minuteBuckets = new Map<number, number>();
      timestamps.forEach(ts => {
        const minute = Math.floor(ts / 60000);
        minuteBuckets.set(minute, (minuteBuckets.get(minute) || 0) + 1);
      });

      for (const count of minuteBuckets.values()) {
        if (count > peakMessagesPerMinute) {
          peakMessagesPerMinute = count;
        }
      }
    }

    const startTs = new Date(session.startedAt).getTime();
    const durationMs = session.endedAt 
      ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime() : 0;
    const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

    return {
      sessionId,
      totalMessages: session.totalEvents,
      totalUniqueChatters: chatters.size,
      messagesByPlatform,
      eventsByType,
      peakMessagesPerMinute,
      durationMinutes
    };
  }

  public getReport(sessionId: string) {
    const session = this.store.getSession(sessionId);
    if (!session) return null;

    const events = this.store.getEventsBySession(sessionId);
    
    const minuteBuckets = new Map<number, number>();
    const platformShare: Record<string, number> = {};
    const chatterCounts = new Map<string, { name: string, platform: any, count: number }>();

    events.forEach((row: any) => {
      try {
        const payload = JSON.parse(row.payload) as StreamEvent;
        if (payload.type === 'chat') {
          platformShare[payload.platform] = (platformShare[payload.platform] || 0) + 1;
          
          if (payload.author) {
            const id = payload.author.id;
            if (!chatterCounts.has(id)) {
              chatterCounts.set(id, { name: payload.author.name, platform: payload.platform, count: 0 });
            }
            chatterCounts.get(id)!.count++;
          }
          
          if (payload.timestamp) {
            const minute = Math.floor(new Date(payload.timestamp).getTime() / 60000) * 60000;
            minuteBuckets.set(minute, (minuteBuckets.get(minute) || 0) + 1);
          }
        }
      } catch (e) {
        // ignore invalid json
      }
    });

    const messagesPerMinute = Array.from(minuteBuckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([ts, count]) => ({
        timestamp: new Date(ts).toISOString(),
        count
      }));

    let peakEngagement = undefined;
    if (messagesPerMinute.length > 0) {
      let maxCount = 0;
      let peakTs = '';
      for (const bucket of messagesPerMinute) {
        if (bucket.count > maxCount) {
          maxCount = bucket.count;
          peakTs = bucket.timestamp;
        }
      }
      if (maxCount > 0) {
        const d = new Date(peakTs);
        d.setMinutes(d.getMinutes() + 1);
        peakEngagement = {
          startTime: peakTs,
          endTime: d.toISOString(),
          rate: maxCount
        };
      }
    }

    const topChatters = Array.from(chatterCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        platform: c.platform,
        messageCount: c.count
      }));

    return {
      sessionId,
      metrics: {
        messagesPerMinute,
        platformShare,
        topChatters,
        peakEngagement
      }
    };
  }

  public getTimelineData(sessionId: string, bucketSizeMs: number = 60000): { time: string, count: number }[] {
    const events = this.store.getEventsBySession(sessionId);
    const buckets = new Map<number, number>();

    events.forEach((row: any) => {
      try {
        const payload = JSON.parse(row.payload) as StreamEvent;
        if (payload.timestamp) {
          const ts = new Date(payload.timestamp).getTime();
          const bucket = Math.floor(ts / bucketSizeMs) * bucketSizeMs;
          buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
        }
      } catch (e) {
        // ignore invalid json
      }
    });

    const sortedBuckets = Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]);
    return sortedBuckets.map(([ts, count]) => ({
      time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      count
    }));
  }
}

export * from './export';
