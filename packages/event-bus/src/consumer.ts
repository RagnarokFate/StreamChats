import { StreamEventType, PersistedEvent } from '@obs-chat/event-schema';

/**
 * EventBusConsumer interface.
 * Consumers register with the Event Bus to receive events.
 * Each consumer tracks its own offset for at-least-once delivery.
 */
export interface EventBusConsumer {
  /** Unique consumer ID (e.g., 'overlay', 'analytics', 'plugin:tts-reader') */
  readonly consumerId: string;

  /**
   * Called for each event. Consumer processes and returns.
   * If the consumer throws, the event is retried (up to 3 times).
   */
  onEvent(event: PersistedEvent): Promise<void>;

  /**
   * Subscribe to specific event types. Empty array = all types.
   */
  readonly eventFilter: StreamEventType[];
}

/**
 * Simple consumer implementation for callback-based event handling.
 */
export class SimpleConsumer implements EventBusConsumer {
  readonly consumerId: string;
  readonly eventFilter: StreamEventType[];
  private handler: (event: PersistedEvent) => Promise<void>;

  constructor(
    consumerId: string,
    handler: (event: PersistedEvent) => Promise<void>,
    eventFilter: StreamEventType[] = []
  ) {
    this.consumerId = consumerId;
    this.handler = handler;
    this.eventFilter = eventFilter;
  }

  async onEvent(event: PersistedEvent): Promise<void> {
    await this.handler(event);
  }
}
