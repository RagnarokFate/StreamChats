import { EventEmitter } from 'events';
import { BaseConnector, ConnectorStatus, CircuitState } from './index';
import { ConnectorHealth, Platform, StreamEvent } from '@obs-chat/event-schema';

export interface SupervisorOptions {
  healthCheckIntervalMs?: number;  // How often to check connector health (default: 5000)
  maxBackoffMs?: number;           // Maximum backoff for reconnection (default: 60000)
}

interface ManagedConnector {
  connector: BaseConnector;
  platform: Platform;
  channelId: string;
  startedAt: Date | null;
}

/**
 * ConnectorSupervisor manages multiple connectors with independent failure isolation.
 *
 * Key responsibilities:
 * - Start/stop connectors independently
 * - Isolate failures — one connector's failure doesn't affect others
 * - Health monitoring with configurable intervals
 * - Automatic reconnection with configurable backoff
 * - Aggregate health reporting
 */
export class ConnectorSupervisor extends EventEmitter {
  private connectors: Map<string, ManagedConnector> = new Map();
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
  private options: Required<SupervisorOptions>;

  constructor(options: SupervisorOptions = {}) {
    super();
    this.options = {
      healthCheckIntervalMs: options.healthCheckIntervalMs ?? 5000,
      maxBackoffMs: options.maxBackoffMs ?? 60000,
    };
  }

  /**
   * Register a connector under supervision.
   */
  addConnector(connector: BaseConnector, platform: Platform, channelId: string): void {
    const key = `${platform}:${channelId}`;

    if (this.connectors.has(key)) {
      throw new Error(`Connector already registered: ${key}`);
    }

    const managed: ManagedConnector = {
      connector,
      platform,
      channelId,
      startedAt: null,
    };

    // Listen for events from the connector
    connector.on('stream_event', (event: StreamEvent) => {
      this.emit('stream_event', event, platform);
    });

    connector.on('chat_message', (event: any) => {
      this.emit('chat_message', event, platform);
    });

    connector.on('error', (error: Error) => {
      console.error(`[Supervisor] Connector error (${key}):`, error.message);
      this.emit('connector_error', { platform, channelId, error });
      // Failure is isolated — other connectors continue operating
    });

    connector.on('status_change', (status: ConnectorStatus) => {
      this.emit('connector_status_change', { platform, channelId, status });
    });

    connector.on('circuit_open', () => {
      console.warn(`[Supervisor] Circuit breaker OPEN for ${key}`);
      this.emit('circuit_open', { platform, channelId });
    });

    connector.on('circuit_half_open', () => {
      console.log(`[Supervisor] Circuit breaker HALF_OPEN for ${key} — testing recovery`);
    });

    this.connectors.set(key, managed);
    console.log(`[Supervisor] Registered connector: ${key}`);
  }

  /**
   * Start all registered connectors.
   * Each connector starts independently — failures in one don't prevent others.
   */
  async startAll(): Promise<Map<string, Error | null>> {
    const results = new Map<string, Error | null>();

    const startPromises = Array.from(this.connectors.entries()).map(async ([key, managed]) => {
      try {
        await managed.connector.start();
        managed.startedAt = new Date();
        results.set(key, null);
        console.log(`[Supervisor] Started connector: ${key}`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        results.set(key, err);
        console.error(`[Supervisor] Failed to start connector ${key}:`, err.message);
        // Don't throw — let other connectors continue starting
      }
    });

    await Promise.allSettled(startPromises);

    // Start health monitoring
    this.startHealthMonitoring();

    return results;
  }

  /**
   * Stop all connectors gracefully.
   */
  async stopAll(): Promise<void> {
    this.stopHealthMonitoring();

    const stopPromises = Array.from(this.connectors.values()).map(async (managed) => {
      try {
        await managed.connector.stop();
      } catch (error) {
        console.error(`[Supervisor] Error stopping connector ${managed.platform}:${managed.channelId}:`, error);
      }
    });

    await Promise.allSettled(stopPromises);
    console.log('[Supervisor] All connectors stopped');
  }

  /**
   * Start a single connector by key.
   */
  async startConnector(platform: Platform, channelId: string): Promise<void> {
    const key = `${platform}:${channelId}`;
    const managed = this.connectors.get(key);
    if (!managed) {
      throw new Error(`Connector not found: ${key}`);
    }
    await managed.connector.start();
    managed.startedAt = new Date();
  }

  /**
   * Stop a single connector by key.
   */
  async stopConnector(platform: Platform, channelId: string): Promise<void> {
    const key = `${platform}:${channelId}`;
    const managed = this.connectors.get(key);
    if (!managed) {
      throw new Error(`Connector not found: ${key}`);
    }
    await managed.connector.stop();
    managed.startedAt = null;
  }

  /**
   * Reconnect a specific connector.
   */
  async reconnectConnector(platform: Platform, channelId: string): Promise<void> {
    const key = `${platform}:${channelId}`;
    const managed = this.connectors.get(key);
    if (!managed) {
      throw new Error(`Connector not found: ${key}`);
    }
    await managed.connector.reconnect();
  }

  /**
   * Get health status for all connectors.
   */
  getAllHealth(): ConnectorHealth[] {
    return Array.from(this.connectors.values()).map(
      (managed) => managed.connector.getHealth()
    );
  }

  /**
   * Get health status for a specific connector.
   */
  getConnectorHealth(platform: Platform, channelId: string): ConnectorHealth | null {
    const key = `${platform}:${channelId}`;
    const managed = this.connectors.get(key);
    return managed ? managed.connector.getHealth() : null;
  }

  /**
   * Get all registered connectors.
   */
  getConnectors(): BaseConnector[] {
    return Array.from(this.connectors.values()).map(m => m.connector);
  }

  /**
   * Get connector by platform.
   */
  getConnectorByPlatform(platform: Platform): BaseConnector | undefined {
    for (const managed of this.connectors.values()) {
      if (managed.platform === platform) {
        return managed.connector;
      }
    }
    return undefined;
  }

  /**
   * Start periodic health monitoring.
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckTimer) return;

    this.healthCheckTimer = setInterval(() => {
      const healthReport = this.getAllHealth();
      this.emit('health_report', healthReport);

      // Check for connectors that need attention
      for (const health of healthReport) {
        if (health.errorRate > 0.5) {
          console.warn(`[Supervisor] High error rate for ${health.platform}: ${(health.errorRate * 100).toFixed(1)}%`);
        }
      }
    }, this.options.healthCheckIntervalMs);
  }

  /**
   * Stop health monitoring.
   */
  private stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Get count of active connectors.
   */
  getActiveCount(): number {
    let count = 0;
    for (const managed of this.connectors.values()) {
      if (managed.connector.getStatus() === ConnectorStatus.CONNECTED) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get count of total registered connectors.
   */
  getTotalCount(): number {
    return this.connectors.size;
  }
}
