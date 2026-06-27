import { EventEmitter } from 'events';
import { BaseConnector } from '@obs-chat/connector-sdk';
import { ChatEvent, StreamEvent, ModerationEvent } from '@obs-chat/event-schema';
import { ModerationOptions } from './types';
import { applyFilters } from './filters';
import { RingBuffer } from './buffer';
import { ShadowSuppressHandler } from './handlers/shadow-suppress';
import { RateLimiterHandler } from './handlers/rate-limiter';
import { ToxicityFilter } from './filters/toxicity';

export * from './types';
export * from './buffer';
export * from './filters';

export class ModerationPipeline extends EventEmitter {
  private options: ModerationOptions;
  private connectors: BaseConnector[] = [];
  private historyBuffer: RingBuffer<string>;
  
  private shadowSuppress: ShadowSuppressHandler;
  private rateLimiter: RateLimiterHandler;
  private toxicityFilter: ToxicityFilter;

  constructor(options: ModerationOptions) {
    super();
    this.options = {
      maskCharacter: '***',
      spamProtectionEnabled: false,
      maxMessageHistory: 1000,
      ...options,
    };
    this.historyBuffer = new RingBuffer<string>(this.options.maxMessageHistory!);
    
    // Initialize new Phase 5 handlers
    this.shadowSuppress = new ShadowSuppressHandler(['scam', 'crypto', 'giveaway', '18+']);
    this.rateLimiter = new RateLimiterHandler(5, 5); // Example: 5 identical msgs in 5s
    this.toxicityFilter = new ToxicityFilter(0.85);
  }

  public async init() {
    await this.toxicityFilter.init();
  }

  public addConnector(connector: BaseConnector) {
    this.connectors.push(connector);

    connector.on('chat_message', (event: ChatEvent) => {
      this.handleChatMessage(event);
    });

    // Also handle generic StreamEvents (v2 compatibility)
    connector.on('stream_event', (event: StreamEvent) => {
       if (event.type === 'chat' && (event as any).moderationStatus === 'suppressed') {
        console.log(`Message from ${(event as any).author?.name} was suppressed by auto-mod.`);
       }
       if (event.type === 'chat' || event.type === 'superchat') {
         this.handleStreamEventAsync(event).catch(e => {
           this.emit('connector_error', { connector, error: e });
         });
       } else {
         // Other events pass through unaffected by text moderation
         this.emit('stream_event', event);
       }
    });

    connector.on('moderation_action', (event: ModerationEvent) => {
      this.emit('moderation_action', event); // Pass through
    });

    connector.on('error', (error: Error) => {
      this.emit('connector_error', { connector, error });
    });
  }

  // Legacy entry point
  private handleChatMessage(event: ChatEvent) {
    // 1. Keyword Filtering (Legacy)
    const sanitized = applyFilters(event, this.options);
    if (!sanitized) {
      return; // dropped
    }

    // Convert to StreamEvent to run through new pipeline
    const streamEvent: StreamEvent = {
      ...sanitized,
      type: 'chat'
    } as unknown as StreamEvent;

    this.handleStreamEventAsync(streamEvent).catch(e => console.error(e));
  }

  public async handleStreamEventAsync(event: StreamEvent) {
    let processed = event;

    // 1. Shadow Suppression
    processed = this.shadowSuppress.handle(processed);

    // 2. Rate Limiting / Raid detection
    processed = this.rateLimiter.handle(processed);

    // 3. Toxicity Filtering (async)
    if ((processed as any).moderationStatus !== 'suppressed') {
      processed = await this.toxicityFilter.handle(processed);
    }

    // Legacy tracking
    if (this.options.spamProtectionEnabled && 'text' in processed && typeof processed.text === 'string') {
      this.historyBuffer.push(processed.text);
    }

    // 4. Emit safe message back to server
    // Note: We emit `chat_message` for legacy pipeline and `stream_event` for v2
    if (processed.type === 'chat') {
       this.emit('chat_message', processed);
    } else {
       this.emit('stream_event', processed);
    }
  }

  public getHistory(): string[] {
    return this.historyBuffer.toArray();
  }

  public updateConfig(newOptions: Partial<ModerationOptions>) {
    this.options = { ...this.options, ...newOptions };
  }
}
