import { BaseConnector, ConnectorStatus } from '@obs-chat/connector-sdk';
import Pusher from 'pusher-js';
import { fetchKickChannelData } from './api';
import { parseKickMessage } from './parser';

const KICK_PUSHER_KEY = '32cbd69e4b950bf97679';
const KICK_PUSHER_CLUSTER = 'us2';

export class KickConnector extends BaseConnector {
  private pusher: Pusher | null = null;
  private channel: any = null;

  protected async connect(): Promise<void> {
    try {
      this.logger.debug(`Fetching chatroom ID for ${this.options.channelId}`);
      const data = await fetchKickChannelData(this.options.channelId);
      const chatroomId = data.chatroom.id;

      this.pusher = new Pusher(KICK_PUSHER_KEY, {
        cluster: KICK_PUSHER_CLUSTER,
      });

      this.pusher.connection.bind('connected', () => {
        this.logger.info(`Connected to Kick Pusher for ${this.options.channelId}`);
        this.setStatus(ConnectorStatus.CONNECTED);
      });

      this.pusher.connection.bind('disconnected', () => {
        this.logger.warn(`Disconnected from Kick Pusher`);
        if (!this.intentionallyStopped) {
          this.reconnect();
        }
      });

      this.pusher.connection.bind('error', (err: any) => {
        this.logger.error(`Kick Pusher error: ${err?.message || err}`);
      });

      const channelName = `chatrooms.${chatroomId}.v2`;
      this.channel = this.pusher.subscribe(channelName);

      this.channel.bind('App\\Events\\ChatMessageEvent', (data: any) => {
        // data might be string or obj depending on pusher-js parsing
        const rawData = typeof data === 'string' ? data : JSON.stringify(data);
        const event = parseKickMessage(rawData, this.options.channelId);
        if (event) {
          this.dispatchEvent(event);
        }
      });

    } catch (e: any) {
      this.logger.error(`Failed to connect to Kick: ${e.message}`);
      this.dispatchError(e);
      await this.reconnect();
    }
  }

  protected async disconnect(): Promise<void> {
    if (this.pusher) {
      if (this.channel) {
        this.channel.unbind_all();
        this.pusher.unsubscribe(this.channel.name);
      }
      this.pusher.disconnect();
      this.pusher = null;
      this.channel = null;
    }
    this.setStatus(ConnectorStatus.IDLE);
  }
}
