import { BaseConnector, ConnectorOptions, ConnectorStatus, createLogger, ConnectorLogger } from '@obs-chat/connector-sdk';
import WebSocket from 'ws';
import { resolveInput } from './utils';
import { parseIRCMessage, parseStreamEvent } from './parser';

export interface TwitchConnectorConfig extends ConnectorOptions {
  platform: 'twitch';
}

export class TwitchConnector extends BaseConnector {
  private ws: WebSocket | null = null;
  private resolvedChannelId: string;

  constructor(config: TwitchConnectorConfig) {
    super(config);
    const resolved = resolveInput(config.channelId);
    this.resolvedChannelId = resolved.channelId;
  }

  protected connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
        
        const onOpen = () => {
          this.logger.info('WebSocket connected. Sending authentication.');
          if (!this.ws) return;
          this.ws.send('PASS oauth:dummy\r\n');
          this.ws.send(`NICK justinfan${Math.floor(Math.random() * 100000)}\r\n`);
          this.ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands\r\n');
          this.ws.send(`JOIN #${this.resolvedChannelId}\r\n`);
          
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

  protected async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
  }

  private handleMessage(message: string): void {
    if (message.startsWith('PING')) {
      this.ws?.send('PONG :tmi.twitch.tv');
      return;
    }

    const ircMsg = parseIRCMessage(message);
    if (!ircMsg) return;

    if (ircMsg.command.split(' ')[0] === 'PRIVMSG' || ircMsg.command === 'USERNOTICE') {
      const streamEvent = parseStreamEvent(ircMsg);
      if (streamEvent) {
        this.dispatchEvent(streamEvent);
      }
    } else if (ircMsg.command === 'NOTICE' || ircMsg.command === 'USERSTATE') {
      this.logger.debug('Received diagnostic command', { command: ircMsg.command, parameters: ircMsg.parameters });
    }
  }
}
