import { EventEmitter } from 'events';
import { ChatEvent, Platform, StreamEvent, ConnectorHealth } from '@obs-chat/event-schema';
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
export declare enum CircuitState {
    CLOSED = "CLOSED",// Normal operation — requests flow through
    OPEN = "OPEN",// Failures exceeded threshold — requests blocked
    HALF_OPEN = "HALF_OPEN"
}
export * from './logger';
export interface ConnectorOptions {
    platform: Platform;
    channelId: string;
    maxRetries?: number;
    logLevel?: LogLevel;
    logFilePath?: string;
    circuitBreakerThreshold?: number;
    circuitBreakerResetMs?: number;
    supportsOutbound?: boolean;
}
/**
 * The BaseConnector defines the strict contract for all platform extractors.
 * It manages the standard EventEmitter lifecycle, state transitions,
 * circuit breaker pattern, and health monitoring.
 */
export declare abstract class BaseConnector extends EventEmitter {
    protected status: ConnectorStatus;
    protected options: ConnectorOptions;
    protected logger: ConnectorLogger;
    protected maxRetries: number;
    protected reconnectCount: number;
    protected intentionallyStopped: boolean;
    private circuitState;
    private consecutiveFailures;
    private circuitBreakerThreshold;
    private circuitBreakerResetMs;
    private circuitResetTimer;
    private lastEventTime;
    private totalEvents;
    private totalErrors;
    private lastLatencyMs;
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
     * Get the current circuit breaker state.
     */
    getCircuitState(): CircuitState;
    /**
     * Record a successful operation — resets consecutive failures and closes circuit.
     */
    protected recordSuccess(): void;
    /**
     * Record a failure — may trip the circuit breaker.
     */
    protected recordFailure(error: Error): void;
    /**
     * Check if the circuit allows a request through.
     */
    protected isCircuitAllowed(): boolean;
    private openCircuit;
    private clearCircuitResetTimer;
    /**
     * Returns the current health status of this connector.
     */
    getHealth(): ConnectorHealth;
    /**
     * Dispatches a strictly validated ChatEvent to the listeners.
     * (Backward compatible — preserved from v1)
     */
    protected dispatchMessage(event: ChatEvent): void;
    /**
     * Generic event dispatch for all StreamEvent types (v2).
     * Works alongside dispatchMessage() for backward compatibility.
     */
    protected dispatchEvent(event: StreamEvent): void;
    /**
     * Optional method to send an outbound message to the platform.
     * Connectors that support outbound messaging (supportsOutbound: true) should override this.
     */
    sendMessage(message: string, replyToId?: string): Promise<void>;
    protected dispatchError(error: Error): void;
}
