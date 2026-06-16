import { BaseConnector, ConnectorOptions, ConnectorStatus, createLogger, ConnectorLogger } from '@obs-chat/connector-sdk';
import WebSocket from 'ws';
import { resolveInput } from './utils';
import { parseIRCMessage, normalizeChatEvent } from './parser';

export interface TwitchConnectorConfig extends ConnectorOptions {
  platform: 'twitch';
  maxRetries?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  logFilePath?: string;
}

export class TwitchConnector extends BaseConnector {
  private ws: WebSocket | null = null;
  private logger: ConnectorLogger;
  private maxRetries: number;
  private reconnectCount: number = 0;
  private resolvedChannelId: string;
  private intentionallyStopped: boolean = false;

  constructor(config: TwitchConnectorConfig) {
    super(config);
    this.maxRetries = config.maxRetries ?? 10;
    
    const resolved = resolveInput(config.channelId);
    this.resolvedChannelId = resolved.channelId;
    
    this.logger = createLogger({
      connectorId: `twitch:${this.resolvedChannelId}`,
      level: config.logLevel ?? 'info',
      filePath: config.logFilePath
    }, this);
  }

  public async start(): Promise<void> {
    if (this.status === ConnectorStatus.CONNECTED || this.status === ConnectorStatus.CONNECTING) {
      return;
    }
    
    this.intentionallyStopped = false;
    this.setStatus(ConnectorStatus.CONNECTING);
    this.logger.info(`Starting connection to twitch channel: ${this.resolvedChannelId}`);
    
    await this.connectWs();
  }

  public async stop(): Promise<void> {
    this.intentionallyStopped = true;
    this.setStatus(ConnectorStatus.IDLE);
    this.logger.info('Stopping connection');
    
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
  }

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
    await this.connectWs();
  }

  private connectWs(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
        
        const onOpen = () => {
          this.logger.info('WebSocket connected. Sending authentication.');
          if (!this.ws) return;
          this.ws.send('PASS oauth:dummy');
          this.ws.send(`NICK justinfan${Math.floor(Math.random() * 100000)}`);
          this.ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
          this.ws.send(`JOIN #${this.resolvedChannelId}`);
          
          this.reconnectCount = 0;
          this.setStatus(ConnectorStatus.CONNECTED);
          
          this.ws.removeListener('open', onOpen);
          this.ws.removeListener('error', onError);
          resolve();
        };

        const onError = (error: Error) => {
          this.logger.error('WebSocket connection error', { error: error.message });
          if (this.status === ConnectorStatus.CONNECTING) {
            this.ws?.removeListener('open', onOpen);
            this.ws?.removeListener('error', onError);
            reject(error);
            this.reconnect().catch(e => this.logger.error('Reconnect failed', { error: e.message }));
          }
        };

        this.ws.on('open', onOpen);
        this.ws.on('error', onError);

        this.ws.on('message', (data: WebSocket.Data) => {
          const messages = data.toString().split('\r\n');
          for (const message of messages) {
            if (!message) continue;
            this.handleMessage(message);
          }
        });

        this.ws.on('close', () => {
          this.logger.warn('WebSocket closed');
          if (!this.intentionallyStopped) {
            this.reconnect().catch(e => this.logger.error('Reconnect failed', { error: e.message }));
          }
        });

      } catch (error: any) {
        this.logger.error('Failed to initialize WebSocket', { error: error.message });
        reject(error);
        this.reconnect().catch(e => this.logger.error('Reconnect failed', { error: e.message }));
      }
    });
  }

  private handleMessage(message: string): void {
    if (message.startsWith('PING')) {
      this.ws?.send('PONG :tmi.twitch.tv');
      return;
    }

    const ircMsg = parseIRCMessage(message);
    if (!ircMsg) return;

    if (ircMsg.command.split(' ')[0] === 'PRIVMSG') {
      const chatEvent = normalizeChatEvent(ircMsg);
      if (chatEvent) {
        this.dispatchMessage(chatEvent);
      }
    } else if (ircMsg.command === 'NOTICE' || ircMsg.command === 'USERSTATE') {
      this.logger.debug('Received diagnostic command', { command: ircMsg.command, parameters: ircMsg.parameters });
    }
  }
}
