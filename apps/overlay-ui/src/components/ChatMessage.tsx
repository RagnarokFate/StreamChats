import React, { useEffect, useState } from 'react';
import { UIMessage } from '../hooks/useChatFeed';

interface Props {
  message: UIMessage;
  onAnimationComplete?: (eventId: string) => void;
}

export function ChatMessage({ message, onAnimationComplete }: Props) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (message.isDeleted) {
      // Trigger the exit animation when moderation event deletes this message
      setIsAnimatingOut(true);
    }
  }, [message.isDeleted]);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === 'slideOutFadeOut' && isAnimatingOut && onAnimationComplete) {
      // Once the animation finishes sliding out, remove the component from the DOM entirely
      onAnimationComplete(message.eventId);
    }
  };

  const platformClass = message.platform === 'twitch' ? 'platform-twitch' : 'platform-youtube';

  return (
    <div 
      className={`chat-message ${isAnimatingOut ? 'animate-out' : 'animate-in'}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="chat-message-header">
        <div className={`chat-message-platform ${platformClass}`} />
        <span className="chat-message-author">{message.author.name}</span>
      </div>
      <div className="chat-message-text">
        {message.text}
      </div>
    </div>
  );
}
