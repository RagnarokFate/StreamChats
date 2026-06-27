# Event Bus Contract

**Version**: 1.0.0 | **Protocol**: Internal TypeScript API

## Overview

The Event Bus is the central message backbone of StreamChats. All platform connectors produce events into the bus, and all consumers (overlay, dashboard, analytics, plugins) read from it.

## Delivery Guarantees

- **At-least-once delivery**: Events are persisted to SQLite before dispatch. Consumers may receive duplicates.
- **Consumer-managed offsets**: Each consumer tracks its own `lastSequenceNumber`. On restart, consumers replay from their last offset.
- **Deduplication**: Consumers use `eventId` (UUID) to deduplicate. The `sequenceNumber` (monotonic auto-increment) provides ordering.

## Producer Interface

```typescript
interface EventBusProducer {
  /**
   * Publish a normalized event to the bus.
   * The bus assigns a sequenceNumber and sessionId, persists to SQLite,
   * then dispatches to all registered consumers.
   */
  publish(event: StreamEvent): Promise<PersistedEvent>;
}

interface PersistedEvent extends StreamEvent {
  sequenceNumber: number;
  sessionId: string;
}
```

## Consumer Interface

```typescript
interface EventBusConsumer {
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

type StreamEventType = 'chat' | 'gift' | 'follow' | 'raid' | 'superchat' | 'moderation';
```

## Replay / Catch-up

```typescript
interface EventBusReplay {
  /**
   * Replay events from a given sequence number.
   * Used on consumer startup to catch up from last offset.
   */
  replayFrom(sequenceNumber: number, filter?: StreamEventType[]): AsyncIterable<PersistedEvent>;

  /**
   * Get the current latest sequence number.
   */
  getLatestSequenceNumber(): number;
}
```

## Consumer Offset Persistence

```typescript
interface OffsetStore {
  getOffset(consumerId: string): number | null;
  setOffset(consumerId: string, sequenceNumber: number): void;
}
```

Offsets are stored in the `consumer_offsets` SQLite table. Updated after each successful `onEvent` call.

## Lifecycle

1. **Startup**: Event Bus initializes SQLite connection, loads active session (or creates new one).
2. **Producer registration**: Connectors register as producers after normalization.
3. **Consumer registration**: Overlay, dashboard, analytics, and plugins register with their offset.
4. **Catch-up**: New consumers replay from `sequenceNumber = 0`. Returning consumers replay from their last offset.
5. **Steady state**: Real-time dispatch to all consumers on each `publish()`.
6. **Shutdown**: Active session marked as `ended`. Consumer offsets persisted.
7. **Crash recovery**: On next startup, if a session has `status = active` with no `endedAt`, it's marked as `crashed`. A new session begins. Consumers replay from their last offset.
