import { EventEmitter } from 'events';
import { ChatEvent, Platform } from '@obs-chat/event-schema';
import { ConnectorLogger, LogLevel } from './logger';
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
    maxRetries?: number;
    logLevel?: LogLevel;
    logFilePath?: string;
}
/**
 * The BaseConnector defines the strict contract for all platform extractors.
 * It manages the standard EventEmitter lifecycle and state transitions.
 */
export declare abstract class BaseConnector extends EventEmitter {
    protected status: ConnectorStatus;
    protected options: ConnectorOptions;
    protected logger: ConnectorLogger;
    protected maxRetries: number;
    protected reconnectCount: number;
    protected intentionallyStopped: boolean;
    constructor(options: ConnectorOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
    protected abstract connect(): Promise<void>;
    protected abstract disconnect(): Promise<void>;
    protected performReconnect(): Promise<void>;
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
