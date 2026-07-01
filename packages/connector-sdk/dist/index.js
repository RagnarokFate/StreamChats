"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConnector = exports.CircuitState = exports.ConnectorStatus = void 0;
const events_1 = require("events");
const logger_1 = require("./logger");
var ConnectorStatus;
(function (ConnectorStatus) {
    ConnectorStatus["IDLE"] = "IDLE";
    ConnectorStatus["CONNECTING"] = "CONNECTING";
    ConnectorStatus["CONNECTED"] = "CONNECTED";
    ConnectorStatus["PAUSED"] = "PAUSED";
    ConnectorStatus["RECONNECTING"] = "RECONNECTING";
    ConnectorStatus["WAITING"] = "WAITING";
    ConnectorStatus["ERROR"] = "ERROR";
})(ConnectorStatus || (exports.ConnectorStatus = ConnectorStatus = {}));
// Circuit breaker states
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
__exportStar(require("./logger"), exports);
__exportStar(require("./supervisor"), exports);
/**
 * The BaseConnector defines the strict contract for all platform extractors.
 * It manages the standard EventEmitter lifecycle, state transitions,
 * circuit breaker pattern, and health monitoring.
 */
class BaseConnector extends events_1.EventEmitter {
    status = ConnectorStatus.IDLE;
    options;
    logger;
    maxRetries;
    reconnectCount = 0;
    intentionallyStopped = false;
    // Circuit breaker state
    circuitState = CircuitState.CLOSED;
    consecutiveFailures = 0;
    circuitBreakerThreshold;
    circuitBreakerResetMs;
    circuitResetTimer = null;
    // Health tracking
    lastEventTime = null;
    totalEvents = 0;
    totalErrors = 0;
    lastLatencyMs = 0;
    constructor(options) {
        super();
        this.options = options;
        this.maxRetries = options.maxRetries ?? 10;
        this.circuitBreakerThreshold = options.circuitBreakerThreshold ?? 5;
        this.circuitBreakerResetMs = options.circuitBreakerResetMs ?? 30000;
        this.logger = (0, logger_1.createLogger)({
            connectorId: `${options.platform}:${options.channelId}`,
            level: options.logLevel ?? 'info',
            filePath: options.logFilePath
        }, this);
    }
    async start() {
        if (this.status === ConnectorStatus.CONNECTED || this.status === ConnectorStatus.CONNECTING || this.status === ConnectorStatus.WAITING) {
            return;
        }
        this.intentionallyStopped = false;
        this.setStatus(ConnectorStatus.CONNECTING);
        this.logger.info(`Starting connection to ${this.options.platform} channel: ${this.options.channelId}`);
        await this.connect();
    }
    async stop() {
        this.intentionallyStopped = true;
        this.setStatus(ConnectorStatus.IDLE);
        this.logger.info('Stopping connection');
        this.clearCircuitResetTimer();
        await this.disconnect();
    }
    async performReconnect() {
        if (this.intentionallyStopped)
            return;
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
    async reconnect() {
        this.setStatus(ConnectorStatus.RECONNECTING);
        await this.disconnect();
        await this.performReconnect();
    }
    /**
     * Halts the processing of incoming events.
     */
    pause() {
        if (this.status === ConnectorStatus.CONNECTED) {
            this.setStatus(ConnectorStatus.PAUSED);
        }
    }
    /**
     * Resumes the processing of incoming events.
     */
    resume() {
        if (this.status === ConnectorStatus.PAUSED) {
            this.setStatus(ConnectorStatus.CONNECTED);
        }
    }
    getStatus() {
        return this.status;
    }
    getChannelId() {
        return this.options.channelId;
    }
    setStatus(newStatus) {
        this.status = newStatus;
        this.emit('status_change', this.status);
    }
    // ── Circuit Breaker ────────────────────────────────────────────────────
    /**
     * Get the current circuit breaker state.
     */
    getCircuitState() {
        return this.circuitState;
    }
    /**
     * Record a successful operation — resets consecutive failures and closes circuit.
     */
    recordSuccess() {
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
    recordFailure(error) {
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
    isCircuitAllowed() {
        return this.circuitState !== CircuitState.OPEN;
    }
    openCircuit() {
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
    clearCircuitResetTimer() {
        if (this.circuitResetTimer) {
            clearTimeout(this.circuitResetTimer);
            this.circuitResetTimer = null;
        }
    }
    // ── Health Check Protocol ──────────────────────────────────────────────
    /**
     * Returns the current health status of this connector.
     */
    getHealth() {
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
    dispatchEvent(event) {
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
    async sendMessage(message, replyToId) {
        if (!this.options.supportsOutbound) {
            throw new Error(`Connector for ${this.options.platform} does not support outbound messaging`);
        }
        // Base implementation is a no-op / logging for mock
        this.logger.info(`[MOCK] Sending message to ${this.options.platform}: ${message} (replyTo: ${replyToId})`);
    }
    dispatchError(error) {
        this.recordFailure(error);
        this.setStatus(ConnectorStatus.ERROR);
        this.emit('error', error);
    }
}
exports.BaseConnector = BaseConnector;
