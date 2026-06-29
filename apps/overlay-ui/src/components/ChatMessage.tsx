import React, { useEffect, useState } from 'react';
import { UIMessage } from '../hooks/useChatFeed';
import { useSettings } from '../hooks/useSettings';

interface Props {
  message: UIMessage;
  onAnimationComplete?: (eventId: string) => void;
  identities?: any[];
  accounts?: any[];
}

export function ChatMessage({ message, onAnimationComplete, identities = [], accounts = [] }: Props) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    if (message.isDeleted) {
      setIsAnimatingOut(true);
    }
  }, [message.isDeleted]);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === 'slideOutFadeOut' && isAnimatingOut && onAnimationComplete) {
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

  const linkedAccount = accounts.find(a => a.platform === message.platform && a.platformUserId === message.author.id);
  const linkedIdentity = linkedAccount ? identities.find(i => i.id === linkedAccount.identityId) : null;

  const isSuppressed = (message as any).moderationStatus === 'suppressed';

  const renderContent = () => {
    if (message.type === 'gift') {
      return <span className="event-gift-text">🎁 Gifted {message.giftCount}x {message.giftType}</span>;
    }
    if (message.type === 'raid') {
      return <span className="event-raid-text">⚔️ Raiding with a party of {message.viewerCount}</span>;
    }
    if (message.type === 'superchat') {
      const tierStyle = message.tier ? { borderLeft: `4px solid #${message.tier}` } : {};
      return (
        <div className="event-superchat-content" style={tierStyle}>
          <div className="superchat-header">💎 SuperChat: {message.currency} {message.amount}</div>
          {message.text && <div className="superchat-text">{message.text}</div>}
        </div>
      );
    }

    if (isSuppressed) {
      return <span className="text-gray-500 italic opacity-50">&lt;message suppressed by auto-mod&gt;</span>;
    }

    if (!message.fragments || message.fragments.length === 0) {
      return message.text;
    }
    
    const emotesEnabled = settings.emoteGlobalEnabled && (settings.emotePlatformToggles[message.platform] ?? true);

    return message.fragments.map((frag, idx) => {
      if (frag.type === 'emote' && emotesEnabled) {
        return <img key={idx} src={frag.url} alt={frag.alt || 'emote'} title={frag.alt || 'emote'} className="chat-emote" style={{ height: '1.2em', verticalAlign: 'middle', display: 'inline-block', margin: '0 2px' }} />;
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
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    let txt = 'just now';
    if (diffMins > 0) txt = diffMins >= 60 ? `${Math.floor(diffMins / 60)}h ago` : `${diffMins}m ago`;
    return <span className="chat-message-timestamp" style={{ fontSize: '0.8rem', color: '#888', marginLeft: '8px' }}>{txt}</span>;
  };

  const getContainerClass = () => {
    let cls = `chat-message ${isAnimatingOut ? 'animate-out' : 'animate-in'}`;
    if (message.type === 'gift') cls += ' chat-event-gift';
    if (message.type === 'raid') cls += ' chat-event-raid';
    if (message.type === 'superchat') cls += ' chat-event-superchat';
    if (isSuppressed) cls += ' chat-event-suppressed';
    return cls;
  };

  return (
    <div className={getContainerClass()} onAnimationEnd={handleAnimationEnd}>
      <div className="chat-message-header">
        <div className={`chat-message-platform ${platformClass}`} />
        <span className="chat-message-author">{linkedIdentity ? `${linkedIdentity.displayName} ✨` : message.author.name}</span>
        {linkedIdentity && (
          <span className={`px-1 ml-2 text-xs rounded ${linkedIdentity.reputationScore >= 1 ? 'bg-green-600' : 'bg-red-600'}`}>
            Rep: {linkedIdentity.reputationScore.toFixed(1)}
          </span>
        )}
        {renderTimestamp()}
      </div>
      <div className="chat-message-text">
        {renderContent()}
      </div>
    </div>
  );
}
