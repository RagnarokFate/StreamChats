import { useState, useEffect, useRef, useCallback } from 'react';
import { CommandEventV2, DashboardSettings, MessageFragment, StatusUpdateEvent, StreamEventWs } from '@obs-chat/event-schema';

export interface UIMessage {
  eventId: string;
  platform: 'twitch' | 'youtube' | 'kick' | 'tiktok' | 'custom';
  timestamp: string;
  type: 'chat' | 'gift' | 'raid' | 'superchat' | 'follow' | 'mod_action';
  author: {
    id: string;
    name: string;
    color?: string;
    badges?: string[];
  };
  text?: string;
  message?: string;
  fragments?: MessageFragment[];
  isDeleted: boolean;
  // Gift/SuperChat/Raid specific fields
  amount?: number;
  currency?: string;
  giftCount?: number;
  giftType?: string;
  viewerCount?: number;
  tier?: string;
  // Moderation fields
  moderationStatus?: string;
  toxicityScore?: number;
  action?: string;
  reason?: string;
  targetUserId?: string;
}

export function useChatFeed(url: string) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [settingsUpdate, setSettingsUpdate] = useState<Partial<DashboardSettings> | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<StatusUpdateEvent | null>(null);
  const [identities, setIdentities] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    function connect() {
      console.log('Connecting to WebSocket...', url);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        // Send v2 protocol handshake
        ws.current?.send(JSON.stringify({
          type: 'handshake',
          protocol_version: 2
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          let streamEvent: import('@obs-chat/event-schema').StreamEvent | null = null;

          // v2 protocol sends stream_event wrappers
          if (data.type === 'stream_event') {
            streamEvent = (data as StreamEventWs).event;
          } 
          // v1 protocol sends unwrapped events
          else if (data.type === 'chat' || data.type === 'moderation') {
            streamEvent = data;
          }

          if (streamEvent) {
            if (streamEvent.type === 'chat' || streamEvent.type === 'gift' || streamEvent.type === 'raid' || streamEvent.type === 'superchat' || streamEvent.type === 'follow') {
              let uiMsg: UIMessage;
              
              if (streamEvent.type === 'chat') {
                uiMsg = {
                  eventId: streamEvent.eventId,
                  platform: streamEvent.platform as any,
                  timestamp: streamEvent.timestamp,
                  type: 'chat',
                  author: streamEvent.author,
                  text: streamEvent.message.text,
                  fragments: streamEvent.message.fragments,
                  isDeleted: false,
                  moderationStatus: (streamEvent as any).moderationStatus,
                  toxicityScore: (streamEvent as any).toxicityScore,
                };
              } else if (streamEvent.type === 'gift') {
                uiMsg = {
                  eventId: streamEvent.eventId,
                  platform: streamEvent.platform as any,
                  timestamp: streamEvent.timestamp,
                  type: 'gift',
                  author: streamEvent.sender,
                  giftType: streamEvent.giftType,
                  giftCount: streamEvent.giftCount,
                  isDeleted: false
                };
              } else if (streamEvent.type === 'raid') {
                uiMsg = {
                  eventId: streamEvent.eventId,
                  platform: streamEvent.platform as any,
                  timestamp: streamEvent.timestamp,
                  type: 'raid',
                  author: streamEvent.raider,
                  viewerCount: streamEvent.viewerCount,
                  isDeleted: false
                };
              } else if (streamEvent.type === 'superchat') {
                uiMsg = {
                  eventId: streamEvent.eventId,
                  platform: streamEvent.platform as any,
                  timestamp: streamEvent.timestamp,
                  type: 'superchat',
                  author: streamEvent.sender,
                  amount: streamEvent.amount,
                  currency: streamEvent.currency,
                  tier: streamEvent.tier,
                  text: streamEvent.message,
                  fragments: streamEvent.message ? [{ type: 'text', text: streamEvent.message }] : [],
                  isDeleted: false
                };
              } else if (streamEvent.type === 'follow') {
                uiMsg = {
                  eventId: streamEvent.eventId,
                  platform: streamEvent.platform as any,
                  timestamp: streamEvent.timestamp,
                  type: 'follow',
                  author: streamEvent.follower,
                  isDeleted: false
                };
              } else {
                return;
              }

              setMessages(prev => {
                const next = [...prev, uiMsg];
                if (next.length > 200) return next.slice(next.length - 200);
                return next;
              });
            } else if (streamEvent.type === 'moderation') {
              if (streamEvent.action === 'clear_chat') {
                setMessages([]);
              } else if (streamEvent.action === 'ban' || streamEvent.action === 'timeout') {
                setMessages(prev => prev.map(msg => {
                  if (msg.author.id === streamEvent.targetUserId && msg.platform === streamEvent.platform) {
                    return { ...msg, isDeleted: true };
                  }
                  return msg;
                }));
              }
            }
          } 
          else if (data.type === 'settings_update') {
            setSettingsUpdate(data.settings);
          } 
          else if (data.type === 'status_update') {
            setStatusUpdate(data as StatusUpdateEvent);
          }
          else if (data.type === 'identity_update') {
            setIdentities(data.identities || []);
            setAccounts(data.accounts || []);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message', err);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting in 3s...');
        setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [url]);

  const sendCommand = useCallback((command: CommandEventV2) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(command));
    }
  }, []);

  return { messages, sendCommand, settingsUpdate, statusUpdate, identities, accounts };
}

