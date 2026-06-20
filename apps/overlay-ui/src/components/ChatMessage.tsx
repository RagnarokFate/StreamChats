import React, { useEffect, useState } from 'react';
import { UIMessage } from '../hooks/useChatFeed';
import { useSettings } from '../hooks/useSettings';

interface Props {
  message: UIMessage;
  onAnimationComplete?: (eventId: string) => void;
}

export function ChatMessage({ message, onAnimationComplete }: Props) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const { settings } = useSettings();

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

  const platformClassMap: Record<string, string> = {
    twitch: 'platform-twitch',
    youtube: 'platform-youtube',
    kick: 'platform-kick',
    tiktok: 'platform-tiktok',
  };
  const platformClass = platformClassMap[message.platform] || 'platform-custom';

  const renderContent = () => {
    if (!message.fragments || message.fragments.length === 0) {
      return message.text;
    }
    
    const emotesEnabled = settings.emoteGlobalEnabled && (settings.emotePlatformToggles[message.platform] ?? true);

    return message.fragments.map((frag, idx) => {
      if (frag.type === 'emote' && emotesEnabled) {
        return (
          <img 
            key={idx} 
            src={frag.url} 
            alt={frag.alt || 'emote'} 
            title={frag.alt || 'emote'}
            className="chat-emote"
            style={{ height: '1.2em', verticalAlign: 'middle', display: 'inline-block', margin: '0 2px' }}
          />
        );
      }
      if (frag.type === 'emote' && !emotesEnabled) {
        return <span key={idx}>{frag.alt || ''}</span>;
      }
      if (frag.type === 'text') {
        return <span key={idx}>{frag.text}</span>;
      }
      return null;
    });
  };

  const renderTimestamp = () => {
    if (settings.timestampMode === 'off') return null;
    
    const d = new Date(message.timestamp);
    if (settings.timestampMode === 'absolute') {
      return <span className="chat-message-timestamp" style={{ fontSize: '0.8rem', color: '#888', marginLeft: '8px' }}>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
    }
    
    // relative
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    let txt = 'just now';
    if (diffMins > 0) {
      if (diffMins >= 60) {
        const diffHrs = Math.floor(diffMins / 60);
        txt = `${diffHrs}h ago`;
      } else {
        txt = `${diffMins}m ago`;
      }
    }
    
    return <span className="chat-message-timestamp" style={{ fontSize: '0.8rem', color: '#888', marginLeft: '8px' }}>{txt}</span>;
  };

  return (
    <div 
      className={`chat-message ${isAnimatingOut ? 'animate-out' : 'animate-in'}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="chat-message-header">
        <div className={`chat-message-platform ${platformClass}`} />
        <span className="chat-message-author">{message.author.name}</span>
        {renderTimestamp()}
      </div>
      <div className="chat-message-text">
        {renderContent()}
      </div>
    </div>
  );
}
