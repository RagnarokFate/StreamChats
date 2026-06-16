import { BaseConnector, ConnectorOptions, ConnectorStatus, createLogger, ConnectorLogger } from '@obs-chat/connector-sdk';
import { resolveInput } from './utils';
import { fetchInitialData, fetchLiveChat } from './api';
import { parseChatActions } from './parser';

export interface YouTubeConnectorConfig extends ConnectorOptions {
  platform: 'youtube';
  pollIntervalMs?: number;
}

export class YouTubeConnector extends BaseConnector {
  private pollIntervalMs: number;
  private resolvedChannelId: string;
  
  private apiKey: string | null = null;
  private continuationToken: string | null = null;
  private pollingTimer: NodeJS.Timeout | null = null;

  constructor(config: YouTubeConnectorConfig) {
    super(config);
    this.pollIntervalMs = config.pollIntervalMs ?? 3000;
    
    const resolved = resolveInput(config.channelId);
    this.resolvedChannelId = resolved.channelId;
  }

  protected async disconnect(): Promise<void> {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  protected async connect(): Promise<void> {
    try {
      this.logger.info('Fetching initial data...');
      const data = await fetchInitialData(this.resolvedChannelId);
      
      if (!data) {
        // Assume stream is not live yet, transition to WAITING
        this.logger.info('Stream not live. Transitioning to WAITING state.');
        this.setStatus(ConnectorStatus.WAITING);
        this.scheduleNextPoll(10000); // Check every 10s if stream is live
        return;
      }
      
      this.apiKey = data.apiKey;
      this.continuationToken = data.continuation;
      
      this.reconnectCount = 0;
      this.setStatus(ConnectorStatus.CONNECTED);
      this.logger.info('Successfully fetched initial token. Starting polling.');
      
      this.poll();
    } catch (error: any) {
      this.logger.error('Failed to initialize connection', { error: error.message });
      this.reconnect().catch(e => this.logger.error('Reconnect failed', { error: e.message }));
    }
  }

  private async poll(): Promise<void> {
    if (this.intentionallyStopped) return;
    if (this.status !== ConnectorStatus.CONNECTED && this.status !== ConnectorStatus.PAUSED && this.status !== ConnectorStatus.WAITING) {
      return;
    }

    if (this.status === ConnectorStatus.WAITING) {
      // Periodic check for stream start
      await this.connect();
      return;
    }

    if (!this.apiKey || !this.continuationToken) {
      await this.connect();
      return;
    }

    try {
      const response = await fetchLiveChat(this.apiKey, this.continuationToken);
      
      if (!response) {
        throw new Error('Empty response from live chat api');
      }

      const continuations = response.continuationContents?.liveChatContinuation?.continuations;
      if (!continuations || continuations.length === 0) {
        // Stream might have ended
        this.logger.info('No continuation token received. Stream ended. Transitioning to WAITING.');
        this.setStatus(ConnectorStatus.WAITING);
        this.apiKey = null;
        this.continuationToken = null;
        this.scheduleNextPoll(10000);
        return;
      }

      // Update continuation token and timeout
      const continuationData = continuations[0].invalidationContinuationData || continuations[0].timedContinuationData;
      if (continuationData?.continuation) {
        this.continuationToken = continuationData.continuation;
      }

      const actions = response.continuationContents?.liveChatContinuation?.actions;
      if (actions) {
        const events = parseChatActions(actions);
        for (const event of events) {
          this.dispatchMessage(event);
        }
      }

      // Use the timeout returned by YouTube or fallback to custom pollIntervalMs
      let timeoutMs = continuationData?.timeoutMs ? parseInt(continuationData.timeoutMs, 10) : this.pollIntervalMs;
      // If user forces a poll interval and it's lower/higher, we can cap it or just use ours. We'll use ours if it's set specifically, or just rely on YouTube.
      if (this.options && (this.options as YouTubeConnectorConfig).pollIntervalMs !== undefined) {
         timeoutMs = this.pollIntervalMs;
      }

      this.scheduleNextPoll(timeoutMs);

    } catch (error: any) {
      this.logger.error('Polling error', { error: error.message });
      this.reconnect().catch(e => this.logger.error('Reconnect failed', { error: e.message }));
    }
  }

  private scheduleNextPoll(timeoutMs: number): void {
    if (this.intentionallyStopped) return;
    if (this.pollingTimer) clearTimeout(this.pollingTimer);
    
    this.pollingTimer = setTimeout(() => {
      this.poll();
    }, timeoutMs);
  }
}
