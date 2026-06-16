import { useEffect, useRef, useState } from 'react';
import { UIMessage } from '../hooks/useChatFeed';
import { ChatMessage } from './ChatMessage';

interface Props {
  messages: UIMessage[];
}

export function ChatFeed({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  
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

  return (
    <div className="chat-feed">
      {localMessages.map(msg => (
        <ChatMessage 
          key={msg.eventId} 
          message={msg} 
          onAnimationComplete={handleRemove} 
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
