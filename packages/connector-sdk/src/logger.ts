import pino from 'pino';
import { EventEmitter } from 'events';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  connectorId: string;
  level: LogLevel;
  filePath?: string;
}

export interface LogEvent {
  level: LogLevel;
  timestamp: string;
  connector: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface ConnectorLogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

export function createLogger(
  config: LoggerConfig,
  emitter: EventEmitter
): ConnectorLogger {
  const pinoConfig: pino.LoggerOptions = {
    level: config.level,
    base: { connector: config.connectorId },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  const destination = config.filePath ? pino.destination(config.filePath) : undefined;
  const pinoLogger = destination ? pino(pinoConfig, destination) : pino(pinoConfig);

  const emitEvent = (level: LogLevel, message: string, data?: Record<string, unknown>) => {
    const event: LogEvent = {
      level,
      timestamp: new Date().toISOString(),
      connector: config.connectorId,
      message,
      data,
    };
    // Emit 'log', 'warning', or 'error_log' depending on level
    let eventName = 'log';
    if (level === 'warn') eventName = 'warning';
    if (level === 'error') eventName = 'error_log';
    
    emitter.emit(eventName, event);
  };

  return {
    debug(message: string, data?: Record<string, unknown>) {
      if (data) pinoLogger.debug(data, message);
      else pinoLogger.debug(message);
      // Don't emit debug to EventEmitter unless requested, but contract says emit "Info-level operational messages", so maybe skip debug?
      // Actually, standardizing on emitting all but let consumers filter. Or just emit if level >= configured?
      // For now, emit them.
      emitEvent('debug', message, data);
    },
    info(message: string, data?: Record<string, unknown>) {
      if (data) pinoLogger.info(data, message);
      else pinoLogger.info(message);
      emitEvent('info', message, data);
    },
    warn(message: string, data?: Record<string, unknown>) {
      if (data) pinoLogger.warn(data, message);
      else pinoLogger.warn(message);
      emitEvent('warn', message, data);
    },
    error(message: string, data?: Record<string, unknown>) {
      if (data) pinoLogger.error(data, message);
      else pinoLogger.error(message);
      emitEvent('error', message, data);
    }
  };
}
