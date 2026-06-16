import { EventEmitter } from 'events';
import { ChatEvent, Platform } from '@obs-chat/event-schema';

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
}

/**
 * The BaseConnector defines the strict contract for all platform extractors.
 * It manages the standard EventEmitter lifecycle and state transitions.
 */
export abstract class BaseConnector extends EventEmitter {
  protected status: ConnectorStatus = ConnectorStatus.IDLE;
  protected options: ConnectorOptions;

  constructor(options: ConnectorOptions) {
    super();
    this.options = options;
  }

  /**
   * Initializes the extraction process (WebSocket or Playwright).
   */
  public abstract start(): Promise<void>;

  /**
   * Safely tears down resources.
   */
  public abstract stop(): Promise<void>;

  /**
   * Internal implementation for reconnect logic.
   */
  protected abstract performReconnect(): Promise<void>;

  /**
   * Forcefully tears down and restarts the connection.
   */
  public async reconnect(): Promise<void> {
    this.setStatus(ConnectorStatus.RECONNECTING);
    await this.stop();
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
