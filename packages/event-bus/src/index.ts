import { StreamEvent, PersistedEvent } from '@obs-chat/event-schema';
import { EventStore } from './store';
import { SessionManager } from './session';

export * from './store';
export * from './session';

export type EventCallback = (event: PersistedEvent) => void | Promise<void>;

export class EventBus {
  private store: EventStore;
  private sessionManager: SessionManager;
  private subscribers: Map<string, { callback: EventCallback; lastOffset: number }> = new Map();

  constructor(dbPath?: string) {
    this.store = new EventStore(dbPath);
    this.sessionManager = new SessionManager(this.store);
  }

  public getStore(): EventStore {
    return this.store;
  }

  public getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  /**
   * Publishes an event to the bus. It persists the event and then notifies subscribers.
   */
  public publish(event: StreamEvent): PersistedEvent | null {
    const session = this.sessionManager.getActiveSession();
    if (!session) {
      console.warn('Cannot publish event: No active session');
      return null;
    }

    const seq = this.store.persistEvent(
      session.sessionId,
      event.type,
      event.eventId,
      event.timestamp,
      event
    );

    const persistedEvent: PersistedEvent = {
      ...event,
      sequenceNumber: seq,
      sessionId: session.sessionId,
    };

    // Update session metrics in memory
    session.totalEvents++;
    session.lastSequenceNumber = seq;

    // Notify subscribers asynchronously
    setImmediate(() => {
      this.notifySubscribers(persistedEvent);
    });

    return persistedEvent;
  }

  /**
   * Subscribes to the event bus. If fromOffset is provided, it replays missed events.
   */
  public subscribe(consumerId: string, callback: EventCallback, fromOffset: number = 0): void {
    this.subscribers.set(consumerId, { callback, lastOffset: fromOffset });
    
    // Replay logic
    if (fromOffset > 0) {
      setImmediate(() => {
        this.replay(consumerId, fromOffset);
      });
    }
  }

  public unsubscribe(consumerId: string): void {
    this.subscribers.delete(consumerId);
  }

  private notifySubscribers(event: PersistedEvent): void {
    for (const [id, sub] of this.subscribers.entries()) {
      if (sub.lastOffset < event.sequenceNumber) {
        try {
          sub.callback(event);
          sub.lastOffset = event.sequenceNumber;
        } catch (e) {
          console.error(`Consumer ${id} failed to process event ${event.sequenceNumber}`, e);
        }
      }
    }
  }

  private replay(consumerId: string, fromOffset: number): void {
    const sub = this.subscribers.get(consumerId);
    if (!sub) return;

    let currentOffset = fromOffset;
    let hasMore = true;

    while (hasMore) {
      const events = this.store.getEventsAfter(currentOffset, 100);
      if (events.length === 0) {
        hasMore = false;
        break;
      }

      for (const ev of events) {
        // If consumer unsubscribed during replay, abort
        if (!this.subscribers.has(consumerId)) return;
        
        try {
          sub.callback(ev);
          sub.lastOffset = ev.sequenceNumber;
        } catch (e) {
          console.error(`Consumer ${consumerId} failed to process replay event ${ev.sequenceNumber}`, e);
        }
        currentOffset = ev.sequenceNumber;
      }
    }
  }
}
