import { EventEmitter } from 'events';
import { StreamEvent, PersistedEvent, StreamEventType } from '@obs-chat/event-schema';
import { EventBusStore } from './store';
import { EventBusConsumer, SimpleConsumer } from './consumer';
import { StreamSessionManager } from './session';

export { EventBusStore } from './store';
export { EventBusConsumer, SimpleConsumer } from './consumer';
export { StreamSessionManager } from './session';

const MAX_RETRIES = 3;

/**
 * EventBus — the central message backbone of StreamChats.
 *
 * Implements persist-first publish with at-least-once delivery:
 * 1. Events are persisted to SQLite before dispatch
 * 2. Consumers track their own offsets
 * 3. On restart, consumers replay from their last offset
 */
export class EventBus extends EventEmitter {
  private store: EventBusStore;
  private sessionManager: StreamSessionManager;
  private consumers: Map<string, EventBusConsumer> = new Map();
  private isRunning: boolean = false;

  constructor(dbPath?: string, retentionDays?: number) {
    super();
    this.store = new EventBusStore(dbPath);
    this.sessionManager = new StreamSessionManager(this.store, retentionDays);
  }

  /**
   * Initialize the Event Bus with a new session.
   */
  initialize(platforms: string[]): string {
    const sessionId = this.sessionManager.initialize(platforms);
    this.isRunning = true;
    return sessionId;
  }

  /**
   * Get the underlying store for direct queries (analytics, export).
   */
  getStore(): EventBusStore {
    return this.store;
  }

  /**
   * Get the session manager.
   */
  getSessionManager(): StreamSessionManager {
    return this.sessionManager;
  }

  /**
   * Get the current session ID.
   */
  getCurrentSessionId(): string | null {
    return this.sessionManager.getCurrentSessionId();
  }



  /**
   * Publish an event: persist to SQLite first, then dispatch to all consumers.
   * This is the core at-least-once delivery mechanism.
   */
  async publish(event: StreamEvent): Promise<PersistedEvent> {
    const sessionId = this.sessionManager.getCurrentSessionId();
    if (!sessionId) {
      throw new Error('No active session. Call initialize() first.');
    }

    // Step 1: Persist to SQLite (this is the source of truth)
    const sequenceNumber = this.store.persistEvent(event, sessionId);

    // Step 2: Create the persisted event with assigned fields
    const persistedEvent: PersistedEvent = {
      ...event,
      sequenceNumber,
      sessionId,
    } as PersistedEvent;

    // Step 3: Dispatch to all registered consumers
    await this.dispatchToConsumers(persistedEvent);

    // Step 4: Emit for any EventEmitter listeners
    this.emit('event', persistedEvent);

    return persistedEvent;
  }

  /**
   * Register a consumer to receive events.
   */
  registerConsumer(consumer: EventBusConsumer): void {
    this.consumers.set(consumer.consumerId, consumer);
    console.log(`[EventBus] Registered consumer: ${consumer.consumerId} (filter: ${consumer.eventFilter.length === 0 ? 'all' : consumer.eventFilter.join(', ')})`);
  }

  /**
   * Convenience method to register a callback-based consumer.
   */
  subscribe(
    consumerId: string,
    handler: (event: PersistedEvent) => Promise<void>,
    eventFilter: StreamEventType[] = []
  ): SimpleConsumer {
    const consumer = new SimpleConsumer(consumerId, handler, eventFilter);
    this.registerConsumer(consumer);
    return consumer;
  }

  /**
   * Unregister a consumer.
   */
  unregisterConsumer(consumerId: string): void {
    this.consumers.delete(consumerId);
    console.log(`[EventBus] Unregistered consumer: ${consumerId}`);
  }

  /**
   * Replay events from a given sequence number for a specific consumer.
   * Used on consumer startup to catch up from last offset.
   */
  async replayFrom(
    consumerId: string,
    fromSequenceNumber: number = 0,
    filter?: StreamEventType[]
  ): Promise<number> {
    const consumer = this.consumers.get(consumerId);
    if (!consumer) {
      throw new Error(`Consumer not found: ${consumerId}`);
    }

    const events = this.store.getEventsFrom(fromSequenceNumber, filter);
    let replayed = 0;

    for (const row of events) {
      const event = JSON.parse(row.payload) as PersistedEvent;
      (event as any).sequenceNumber = row.sequence_number;

      if (this.matchesFilter(event, consumer.eventFilter)) {
        await this.deliverToConsumer(consumer, event);
        replayed++;
      }
    }

    console.log(`[EventBus] Replayed ${replayed} events for consumer: ${consumerId} (from seq: ${fromSequenceNumber})`);
    return replayed;
  }

  /**
   * Replay a consumer from its last saved offset.
   */
  async replayConsumerFromOffset(consumerId: string): Promise<number> {
    const offset = this.store.getOffset(consumerId) || 0;
    const consumer = this.consumers.get(consumerId);
    if (!consumer) {
      throw new Error(`Consumer not found: ${consumerId}`);
    }
    return this.replayFrom(consumerId, offset, consumer.eventFilter);
  }

  /**
   * Get the latest sequence number in the event log.
   */
  getLatestSequenceNumber(): number {
    return this.store.getLatestSequenceNumber();
  }

  /**
   * Create a stream marker at the current point.
   */
  createMarker(label?: string): string | null {
    const sessionId = this.sessionManager.getCurrentSessionId();
    if (!sessionId) return null;
    return this.store.createMarker(sessionId, label);
  }

  /**
   * Dispatch an event to all matching consumers.
   */
  private async dispatchToConsumers(event: PersistedEvent): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const consumer of this.consumers.values()) {
      if (this.matchesFilter(event, consumer.eventFilter)) {
        promises.push(this.deliverToConsumer(consumer, event));
      }
    }

    // Don't await in parallel to preserve ordering per consumer
    // Each consumer gets events sequentially
    await Promise.allSettled(promises);
  }

  /**
   * Deliver an event to a single consumer with retry logic.
   */
  private async deliverToConsumer(consumer: EventBusConsumer, event: PersistedEvent): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await consumer.onEvent(event);
        // Update consumer offset on success
        this.store.setOffset(consumer.consumerId, event.sequenceNumber);
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`[EventBus] Consumer ${consumer.consumerId} failed on event ${event.eventId} (attempt ${attempt}/${MAX_RETRIES}):`, lastError.message);
      }
    }

    // All retries exhausted
    this.emit('consumer_error', {
      consumerId: consumer.consumerId,
      eventId: event.eventId,
      error: lastError,
    });
  }

  /**
   * Check if an event matches a consumer's filter.
   */
  private matchesFilter(event: PersistedEvent, filter: StreamEventType[]): boolean {
    if (filter.length === 0) return true; // Empty filter = all events
    return filter.includes(event.type as StreamEventType);
  }

  /**
   * Gracefully shut down the Event Bus.
   */
  async shutdown(): Promise<void> {
    this.isRunning = false;
    this.sessionManager.destroy();
    this.store.close();
    this.consumers.clear();
    console.log('[EventBus] Shut down gracefully');
  }
}
