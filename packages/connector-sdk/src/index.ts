import { EventEmitter } from 'events';
import { ChatEvent, Platform, StreamEvent, ConnectorHealth } from '@obs-chat/event-schema';
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

// Circuit breaker states
export enum CircuitState {
  CLOSED = 'CLOSED',       // Normal operation — requests flow through
  OPEN = 'OPEN',           // Failures exceeded threshold — requests blocked
  HALF_OPEN = 'HALF_OPEN', // Testing recovery — single request allowed
}

export * from './logger';
export * from './supervisor';

export interface ConnectorOptions {
  platform: Platform;
  channelId: string;
  maxRetries?: number;
  logLevel?: LogLevel;
  logFilePath?: string;
  // Circuit breaker config
  circuitBreakerThreshold?: number;   // Failures before opening circuit (default: 5)
  circuitBreakerResetMs?: number;     // Time to wait before half-open (default: 30000)
  supportsOutbound?: boolean;         // Whether this connector supports sending messages
}

/**
 * The BaseConnector defines the strict contract for all platform extractors.
 * It manages the standard EventEmitter lifecycle, state transitions,
 * circuit breaker pattern, and health monitoring.
 */
export abstract class BaseConnector extends EventEmitter {
  protected status: ConnectorStatus = ConnectorStatus.IDLE;
  protected options: ConnectorOptions;
  protected logger: ConnectorLogger;
  protected maxRetries: number;
  protected reconnectCount: number = 0;
  protected intentionallyStopped: boolean = false;

  // Circuit breaker state
  private circuitState: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures: number = 0;
  private circuitBreakerThreshold: number;
  private circuitBreakerResetMs: number;
  private circuitResetTimer: ReturnType<typeof setTimeout> | null = null;

  // Health tracking
  private lastEventTime: Date | null = null;
  private totalEvents: number = 0;
  private totalErrors: number = 0;
  private lastLatencyMs: number = 0;

  constructor(options: ConnectorOptions) {
    super();
    this.options = options;
    this.maxRetries = options.maxRetries ?? 10;
    this.circuitBreakerThreshold = options.circuitBreakerThreshold ?? 5;
    this.circuitBreakerResetMs = options.circuitBreakerResetMs ?? 30000;
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
    this.clearCircuitResetTimer();
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

  // ── Circuit Breaker ────────────────────────────────────────────────────

  /**
   * Get the current circuit breaker state.
   */
  public getCircuitState(): CircuitState {
    return this.circuitState;
  }

  /**
   * Record a successful operation — resets consecutive failures and closes circuit.
   */
  protected recordSuccess(): void {
    this.consecutiveFailures = 0;
    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.circuitState = CircuitState.CLOSED;
      this.logger.info('Circuit breaker CLOSED — connector recovered');
    }
    this.reconnectCount = 0; // Reset reconnect count on success
  }

  /**
   * Record a failure — may trip the circuit breaker.
   */
  protected recordFailure(error: Error): void {
    this.consecutiveFailures++;
    this.totalErrors++;

    if (this.circuitState === CircuitState.HALF_OPEN) {
      // Failed during test request — reopen circuit
      this.openCircuit();
      return;
    }

    if (this.consecutiveFailures >= this.circuitBreakerThreshold) {
      this.openCircuit();
    }
  }

  /**
   * Check if the circuit allows a request through.
   */
  protected isCircuitAllowed(): boolean {
    return this.circuitState !== CircuitState.OPEN;
  }

  private openCircuit(): void {
    this.circuitState = CircuitState.OPEN;
    this.logger.warn(`Circuit breaker OPEN — ${this.consecutiveFailures} consecutive failures. Will retry in ${this.circuitBreakerResetMs}ms`);
    this.emit('circuit_open', this.options.platform);

    // Schedule transition to HALF_OPEN
    this.clearCircuitResetTimer();
    this.circuitResetTimer = setTimeout(() => {
      this.circuitState = CircuitState.HALF_OPEN;
      this.logger.info('Circuit breaker HALF_OPEN — testing recovery');
      this.emit('circuit_half_open', this.options.platform);
      // Attempt reconnection
      this.reconnect().catch((err) => {
        this.logger.error('Recovery attempt failed', { error: err.message });
      });
    }, this.circuitBreakerResetMs);
  }

  private clearCircuitResetTimer(): void {
    if (this.circuitResetTimer) {
      clearTimeout(this.circuitResetTimer);
      this.circuitResetTimer = null;
    }
  }

  // ── Health Check Protocol ──────────────────────────────────────────────

  /**
   * Returns the current health status of this connector.
   */
  public getHealth(): ConnectorHealth {
    const errorRate = this.totalEvents > 0
      ? this.totalErrors / (this.totalEvents + this.totalErrors)
      : 0;

    return {
      platform: this.options.platform,
      latencyMs: this.lastLatencyMs,
      lastEventTime: this.lastEventTime ? this.lastEventTime.toISOString() : null,
      errorRate: Math.round(errorRate * 1000) / 1000, // 3 decimal places
      supportsOutbound: this.options.supportsOutbound ?? false,
    };
  }

  // ── Event Dispatch ─────────────────────────────────────────────────────



  /**
   * Generic event dispatch for all StreamEvent types (v2).
   */
  protected dispatchEvent(event: StreamEvent): void {
    if (this.status === ConnectorStatus.CONNECTED || this.status === ConnectorStatus.PAUSED) {
      const startTime = Date.now();
      this.totalEvents++;
      this.lastEventTime = new Date();
      this.lastLatencyMs = Date.now() - startTime;
      this.recordSuccess();
      this.emit('stream_event', event);
    }
  }

  /**
   * Optional method to send an outbound message to the platform.
   * Connectors that support outbound messaging (supportsOutbound: true) should override this.
   */
  public async sendMessage(message: string, replyToId?: string): Promise<void> {
    if (!this.options.supportsOutbound) {
      throw new Error(`Connector for ${this.options.platform} does not support outbound messaging`);
    }
    // Base implementation is a no-op / logging for mock
    this.logger.info(`[MOCK] Sending message to ${this.options.platform}: ${message} (replyTo: ${replyToId})`);
  }

  protected dispatchError(error: Error): void {
    this.recordFailure(error);
    this.setStatus(ConnectorStatus.ERROR);
    this.emit('error', error);
  }
}

