import { useState } from 'react';
import { CommandEventV2, Platform } from '@obs-chat/event-schema';


interface ReplyComposerProps {
  sendCommand: (command: CommandEventV2) => void;
  replyToEventId?: string;
  defaultPlatform?: Platform;
  onCancel?: () => void;
  onSent?: () => void;
}

export function ReplyComposer({ sendCommand, replyToEventId, defaultPlatform = 'twitch', onCancel, onSent }: ReplyComposerProps) {
  const [message, setMessage] = useState('');
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);

  const handleSend = () => {
    if (!message.trim()) return;

    sendCommand({
      type: 'command',
      action: 'reply_message',
      payload: {
        platform,
        message,
        replyToEventId
      }
    });

    setMessage('');
    if (onSent) onSent();
  };

  return (
    <div className="reply-composer" style={{
      background: 'var(--bg-secondary)',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {replyToEventId ? 'Replying to message' : 'Send Message'}
        </h4>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '0.85rem'
          }}
        >
          <option value="twitch">Twitch</option>
          <option value="youtube">YouTube</option>
          <option value="kick">Kick</option>
          <option value="tiktok">TikTok</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type a message..."
        rows={3}
        style={{
          width: '100%',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          padding: '8px',
          fontFamily: 'inherit',
          resize: 'vertical'
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          style={{
            background: 'var(--accent-color, #007acc)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 16px',
            cursor: message.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            opacity: message.trim() ? 1 : 0.5
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
