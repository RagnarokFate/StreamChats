import { useEffect, useRef, useState, useMemo } from 'react';
import { UIMessage } from '../hooks/useChatFeed';
import { ChatMessage } from './ChatMessage';
import { useSettings } from '../hooks/useSettings';
import { Platform } from '@obs-chat/event-schema';

interface Props {
  messages: UIMessage[];
  identities?: any[];
  accounts?: any[];
}

export function ChatFeed({ messages, identities = [], accounts = [] }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  
  // We keep a local copy so we can cleanly unmount items after their exit animation finishes
  const [localMessages, setLocalMessages] = useState<UIMessage[]>([]);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom whenever a new message arrives
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages.length]);

  const handleRemove = (eventId: string) => {
    setLocalMessages(prev => prev.filter(m => m.eventId !== eventId));
  };

  // Group messages for split view
  const columns = useMemo(() => {
    if (settings.viewMode !== 'split') return [];
    const map = new Map<Platform, UIMessage[]>();
    localMessages.forEach(msg => {
      if (!map.has(msg.platform)) map.set(msg.platform, []);
      map.get(msg.platform)!.push(msg);
    });
    return Array.from(map.entries());
  }, [localMessages, settings.viewMode]);

  if (settings.viewMode === 'split') {
    return (
      <div className="chat-feed-split" style={{ display: 'flex', gap: '24px', width: '100%', height: '100%', alignItems: 'flex-end' }}>
        {columns.map(([platform, colMessages]) => (
          <div key={platform} className="chat-feed chat-feed-column" style={{ flex: 1 }}>
            <div style={{ padding: '8px', textAlign: 'center', textTransform: 'capitalize', fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', marginBottom: '8px' }}>
              {platform}
            </div>
            {colMessages.map(msg => (
              <ChatMessage 
                key={msg.eventId} 
                message={msg} 
                onAnimationComplete={handleRemove}
                identities={identities}
                accounts={accounts}
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} style={{ display: 'none' }} />
      </div>
    );
  }

  // Unified, Priority, Moderator all use the main single-column feed.
  // Differences in rendering (like Moderator action buttons) will be handled in ChatMessage or via CSS.
  return (
    <div className={`chat-feed view-mode-${settings.viewMode}`}>
      {localMessages.map(msg => (
        <ChatMessage 
          key={msg.eventId} 
          message={msg} 
          onAnimationComplete={handleRemove}
          identities={identities}
          accounts={accounts}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
