import { ChatEvent, Platform } from '@obs-chat/event-schema';
import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';
import { BaseConnector, ConnectorStatus } from '@obs-chat/connector-sdk';
import crypto from 'crypto';

export class TikTokConnector extends BaseConnector {
  private tiktokConnection: TikTokLiveConnection | null = null;

  protected async connect(): Promise<void> {
    try {
      this.tiktokConnection = new TikTokLiveConnection(this.options.channelId, {});

      this.tiktokConnection.on(WebcastEvent.CHAT, (data: any) => {
        const event: ChatEvent = {
          eventId: crypto.randomUUID(),
          platform: 'tiktok',
          timestamp: new Date().toISOString(),
          type: 'chat',
          author: {
            id: data.userId || 'unknown',
            name: data.uniqueId || 'Unknown',
          },
          message: {
            text: data.comment,
            fragments: [{ type: 'text', text: data.comment }]
          }
        };
        this.dispatchMessage(event);
      });

      this.tiktokConnection.on(WebcastEvent.GIFT, (data: any) => {
        if (data.giftType === 1 && !data.repeatEnd) {
          // It's a streak gift, only trigger when it's done
          return;
        }
        const text = `Sent ${data.giftName} x${data.repeatCount || 1}`;
        const event: ChatEvent = {
          eventId: crypto.randomUUID(),
          platform: 'tiktok',
          timestamp: new Date().toISOString(),
          type: 'chat',
          author: {
            id: data.userId || 'unknown',
            name: data.uniqueId || 'Unknown',
          },
          message: {
            text,
            fragments: [{ type: 'text', text }]
          }
        };
        this.dispatchMessage(event);
      });

      this.tiktokConnection.on(ControlEvent.DISCONNECTED, () => {
        this.logger.warn(`Disconnected from TikTok`);
        if (!this.intentionallyStopped) {
          this.reconnect();
        }
      });

      this.tiktokConnection.on(ControlEvent.ERROR, (err: any) => {
        this.logger.error(`TikTok error: ${err?.message || err}`);
      });

      await this.tiktokConnection.connect();
      this.logger.info(`Connected to TikTok Live for ${this.options.channelId}`);
      this.setStatus(ConnectorStatus.CONNECTED);

    } catch (e: any) {
      this.logger.error(`Failed to connect to TikTok: ${e.message}`);
      this.dispatchError(e);
      await this.reconnect();
    }
  }

  protected async disconnect(): Promise<void> {
    if (this.tiktokConnection) {
      this.tiktokConnection.disconnect();
      this.tiktokConnection = null;
    }
    this.setStatus(ConnectorStatus.IDLE);
  }
}
