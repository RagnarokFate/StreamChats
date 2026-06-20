import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatEvent, ModerationEvent, CommandEvent, SettingsUpdateEvent, DashboardSettings, MessageFragment, StatusUpdateEvent } from '@obs-chat/event-schema';

export interface UIMessage {
  eventId: string;
  platform: 'twitch' | 'youtube' | 'kick' | 'tiktok' | 'custom';
  timestamp: string;
  author: {
    id: string;
    name: string;
    color?: string;
    badges?: string[];
  };
  text: string;
  fragments?: MessageFragment[];
  isDeleted: boolean;
}

export function useChatFeed(url: string) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [settingsUpdate, setSettingsUpdate] = useState<Partial<DashboardSettings> | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<StatusUpdateEvent | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    function connect() {
      console.log('Connecting to WebSocket...', url);
      ws.current = new WebSocket(url);

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'chat') {
            const chatEvent = data as ChatEvent;
            setMessages(prev => {
              const newMsg: UIMessage = {
                eventId: chatEvent.eventId,
                platform: chatEvent.platform as any,
                timestamp: chatEvent.timestamp,
                author: chatEvent.author,
                text: chatEvent.message.text,
                fragments: chatEvent.message.fragments,
                isDeleted: false
              };
              // Keep only the last 50 messages
              const next = [...prev, newMsg];
              if (next.length > 50) return next.slice(next.length - 50);
              return next;
            });
          } else if (data.type === 'moderation') {
            const modEvent = data as ModerationEvent;
            
            if (modEvent.action === 'clear_chat') {
              setMessages([]);
            } else if (modEvent.action === 'ban' || modEvent.action === 'timeout') {
              setMessages(prev => prev.map(msg => {
                if (msg.author.id === modEvent.targetUserId && msg.platform === modEvent.platform) {
                  return { ...msg, isDeleted: true };
                }
                return msg;
              }));
            }
          } else if (data.type === 'settings_update') {
            const settingsEvent = data as SettingsUpdateEvent;
            setSettingsUpdate(settingsEvent.settings);
          } else if (data.type === 'status_update') {
            setStatusUpdate(data as StatusUpdateEvent);
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

  const sendCommand = useCallback((command: CommandEvent) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(command));
    }
  }, []);

  return { messages, sendCommand, settingsUpdate, statusUpdate };
}

