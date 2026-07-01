import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../src/index';
import { StreamEvent, StreamSession } from '@obs-chat/event-schema';
import { randomUUID } from 'crypto';

describe('EventBus Integration', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus(':memory:'); // Use in-memory SQLite
  });

  afterEach(() => {
    eventBus.getStore().close();
  });

  it('should successfully persist and dispatch events to subscribers', async () => {
    return new Promise<void>((resolve) => {
      // Start a session
      eventBus.getSessionManager().startSession(['twitch']);

      const mockEvent: StreamEvent = {
        type: 'chat',
        eventId: randomUUID(),
        platform: 'twitch',
        timestamp: new Date().toISOString(),
        author: { id: '1', name: 'tester' },
        message: { text: 'hello world' },
        moderationStatus: 'visible'
      };

      eventBus.subscribe('consumer-1', (persistedEvent) => {
        expect(persistedEvent.eventId).toBe(mockEvent.eventId);
        expect(persistedEvent.sequenceNumber).toBe(1);
        expect(persistedEvent.sessionId).toBeDefined();
        resolve();
      });

      eventBus.publish(mockEvent);
    });
  });

  it('should replay missed events if consumer subscribes with an offset', async () => {
    return new Promise<void>((resolve) => {
      eventBus.getSessionManager().startSession(['twitch']);

      const events: StreamEvent[] = [
        { type: 'chat', eventId: randomUUID(), platform: 'twitch', timestamp: new Date().toISOString(), author: { id: '1', name: 'user1' }, message: { text: 'msg1' }, moderationStatus: 'visible' },
        { type: 'chat', eventId: randomUUID(), platform: 'twitch', timestamp: new Date().toISOString(), author: { id: '2', name: 'user2' }, message: { text: 'msg2' }, moderationStatus: 'visible' },
        { type: 'chat', eventId: randomUUID(), platform: 'twitch', timestamp: new Date().toISOString(), author: { id: '3', name: 'user3' }, message: { text: 'msg3' }, moderationStatus: 'visible' }
      ];

      events.forEach(e => eventBus.publish(e));

      // Wait a bit to ensure they are published
      setTimeout(() => {
        const receivedEvents: any[] = [];
        
        // Subscribe from offset 1 (should receive sequence 2 and 3)
        eventBus.subscribe('late-consumer', (persistedEvent) => {
          receivedEvents.push(persistedEvent);
          
          if (receivedEvents.length === 2) {
            expect(receivedEvents[0].sequenceNumber).toBe(2);
            expect(receivedEvents[1].sequenceNumber).toBe(3);
            resolve();
          }
        }, 1);
      }, 100);
    });
  });
});
