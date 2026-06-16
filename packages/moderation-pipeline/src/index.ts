import { EventEmitter } from 'events';
import { BaseConnector } from '@obs-chat/connector-sdk';
import { ChatEvent, ModerationEvent } from '@obs-chat/event-schema';
import { ModerationOptions } from './types';
import { applyFilters } from './filters';
import { RingBuffer } from './buffer';

export * from './types';
export * from './buffer';
export * from './filters';

export class ModerationPipeline extends EventEmitter {
  private options: ModerationOptions;
  private connectors: BaseConnector[] = [];
  private historyBuffer: RingBuffer<string>;

  constructor(options: ModerationOptions) {
    super();
    this.options = {
      maskCharacter: '***',
      spamProtectionEnabled: false,
      maxMessageHistory: 1000,
      ...options,
    };
    this.historyBuffer = new RingBuffer<string>(this.options.maxMessageHistory!);
  }

  public addConnector(connector: BaseConnector) {
    this.connectors.push(connector);

    connector.on('chat_message', (event: ChatEvent) => {
      this.handleChatMessage(event);
    });

    connector.on('moderation_action', (event: ModerationEvent) => {
      this.emit('moderation_action', event); // Pass through
    });
  }

  private handleChatMessage(event: ChatEvent) {
    // 1. Keyword Filtering
    const sanitized = applyFilters(event, this.options);
    if (!sanitized) {
      return; // Message was dropped
    }

    // 2. Memory-bounded tracking
    if (this.options.spamProtectionEnabled) {
      this.historyBuffer.push(sanitized.message.text);
      // In the future, we could check this.historyBuffer for spam patterns here.
    }

    // 3. Emit safe message
    this.emit('chat_message', sanitized);
  }

  public getHistory(): string[] {
    return this.historyBuffer.toArray();
  }
}
