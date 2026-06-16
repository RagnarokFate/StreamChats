import { EventEmitter } from 'events';
import { ChatEvent, Platform } from '@obs-chat/event-schema';
import { createLogger, ConnectorLogger, LogLevel } from './logger';

export enum ConnectorStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  PAUSED = 'PAUSED',
  RECONNECTING = 'RECONNECTING',
  WAITING = 'WAITING',
  ERROR = 'ERROR',
}

export * from './logger';

export interface ConnectorOptions {
  platform: Platform;
  channelId: string;
  maxRetries?: number;
  logLevel?: LogLevel;
  logFilePath?: string;
}

/**
 * The BaseConnector defines the strict contract for all platform extractors.
 * It manages the standard EventEmitter lifecycle and state transitions.
 */
export abstract class BaseConnector extends EventEmitter {
  protected status: ConnectorStatus = ConnectorStatus.IDLE;
  protected options: ConnectorOptions;
  protected logger: ConnectorLogger;
  protected maxRetries: number;
  protected reconnectCount: number = 0;
  protected intentionallyStopped: boolean = false;

  constructor(options: ConnectorOptions) {
    super();
    this.options = options;
    this.maxRetries = options.maxRetries ?? 10;
    this.logger = createLogger({
      connectorId: `${options.platform}:${options.channelId}`,
      level: options.logLevel ?? 'info',
      filePath: options.logFilePath
    }, this);
  }

  public async start(): Promise<void> {
    if (this.status === ConnectorStatus.CONNECTED || this.status === ConnectorStatus.CONNECTING || this.status === ConnectorStatus.WAITING) {
      return;
    }
    
    this.intentionallyStopped = false;
    this.setStatus(ConnectorStatus.CONNECTING);
    this.logger.info(`Starting connection to ${this.options.platform} channel: ${this.options.channelId}`);
    
    await this.connect();
  }

  public async stop(): Promise<void> {
    this.intentionallyStopped = true;
    this.setStatus(ConnectorStatus.IDLE);
    this.logger.info('Stopping connection');
    await this.disconnect();
  }

  protected abstract connect(): Promise<void>;
  protected abstract disconnect(): Promise<void>;

  protected async performReconnect(): Promise<void> {
    if (this.intentionallyStopped) return;

    if (this.reconnectCount >= this.maxRetries) {
      this.logger.error(`Max retries (${this.maxRetries}) exhausted. Transitioning to ERROR.`);
      this.dispatchError(new Error('Max retries exhausted'));
      return;
    }

    this.reconnectCount++;
    const backoffMs = Math.min(Math.pow(2, this.reconnectCount - 1) * 1000, 60000);
    
    this.logger.warn(`Reconnecting in ${backoffMs}ms (Attempt ${this.reconnectCount}/${this.maxRetries})`);
    
    await new Promise(resolve => setTimeout(resolve, backoffMs));
    await this.connect();
  }

  public async reconnect(): Promise<void> {
    this.setStatus(ConnectorStatus.RECONNECTING);
    await this.disconnect();
    await this.performReconnect();
  }

  /**
   * Halts the processing of incoming events.
   */
  public pause(): void {
    if (this.status === ConnectorStatus.CONNECTED) {
      this.setStatus(ConnectorStatus.PAUSED);
    }
  }

  /**
   * Resumes the processing of incoming events.
   */
  public resume(): void {
    if (this.status === ConnectorStatus.PAUSED) {
      this.setStatus(ConnectorStatus.CONNECTED);
    }
  }

  public getStatus(): ConnectorStatus {
    return this.status;
  }

  protected setStatus(newStatus: ConnectorStatus): void {
    this.status = newStatus;
    this.emit('status_change', this.status);
  }

  /**
   * Dispatches a strictly validated ChatEvent to the listeners.
   */
  protected dispatchMessage(event: ChatEvent): void {
    if (this.status === ConnectorStatus.CONNECTED) {
      this.emit('chat_message', event);
    }
  }

  protected dispatchError(error: Error): void {
    this.setStatus(ConnectorStatus.ERROR);
    this.emit('error', error);
  }
}
