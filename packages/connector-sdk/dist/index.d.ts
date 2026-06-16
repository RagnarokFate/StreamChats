import { EventEmitter } from 'events';
import { ChatEvent, Platform } from '@obs-chat/event-schema';
export declare enum ConnectorStatus {
    IDLE = "IDLE",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    PAUSED = "PAUSED",
    RECONNECTING = "RECONNECTING",
    WAITING = "WAITING",
    ERROR = "ERROR"
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
export declare abstract class BaseConnector extends EventEmitter {
    protected status: ConnectorStatus;
    protected options: ConnectorOptions;
    constructor(options: ConnectorOptions);
    /**
     * Initializes the extraction process (WebSocket or Playwright).
     */
    abstract start(): Promise<void>;
    /**
     * Safely tears down resources.
     */
    abstract stop(): Promise<void>;
    /**
     * Internal implementation for reconnect logic.
     */
    protected abstract performReconnect(): Promise<void>;
    /**
     * Forcefully tears down and restarts the connection.
     */
    reconnect(): Promise<void>;
    /**
     * Halts the processing of incoming events.
     */
    pause(): void;
    /**
     * Resumes the processing of incoming events.
     */
    resume(): void;
    getStatus(): ConnectorStatus;
    protected setStatus(newStatus: ConnectorStatus): void;
    /**
     * Dispatches a strictly validated ChatEvent to the listeners.
     */
    protected dispatchMessage(event: ChatEvent): void;
    protected dispatchError(error: Error): void;
}
