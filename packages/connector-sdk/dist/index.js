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
exports.BaseConnector = exports.ConnectorStatus = void 0;
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
__exportStar(require("./logger"), exports);
/**
 * The BaseConnector defines the strict contract for all platform extractors.
 * It manages the standard EventEmitter lifecycle and state transitions.
 */
class BaseConnector extends events_1.EventEmitter {
    status = ConnectorStatus.IDLE;
    options;
    logger;
    maxRetries;
    reconnectCount = 0;
    intentionallyStopped = false;
    constructor(options) {
        super();
        this.options = options;
        this.maxRetries = options.maxRetries ?? 10;
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
    setStatus(newStatus) {
        this.status = newStatus;
        this.emit('status_change', this.status);
    }
    /**
     * Dispatches a strictly validated ChatEvent to the listeners.
     */
    dispatchMessage(event) {
        if (this.status === ConnectorStatus.CONNECTED) {
            this.emit('chat_message', event);
        }
    }
    dispatchError(error) {
        this.setStatus(ConnectorStatus.ERROR);
        this.emit('error', error);
    }
}
exports.BaseConnector = BaseConnector;
