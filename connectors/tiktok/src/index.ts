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
        const event: ChatEvent & { moderationStatus: string } = {
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
          },
          moderationStatus: 'approved',
        };
        this.dispatchEvent(event as import('@obs-chat/event-schema').StreamEvent);
      });

      this.tiktokConnection.on(WebcastEvent.GIFT, (data: any) => {
        if (data.giftType === 1 && !data.repeatEnd) {
          // It's a streak gift, only trigger when it's done
          return;
        }
        
        const event: import('@obs-chat/event-schema').GiftEvent = {
          eventId: crypto.randomUUID(),
          platform: 'tiktok',
          timestamp: new Date().toISOString(),
          type: 'gift',
          sender: {
            id: data.userId || 'unknown',
            name: data.uniqueId || 'Unknown',
          },
          giftType: data.giftName || 'Gift',
          giftCount: data.repeatCount || 1,
          rawPayload: data
        };
        this.dispatchEvent(event);
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
