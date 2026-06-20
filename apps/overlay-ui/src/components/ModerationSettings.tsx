import { useState, useEffect } from 'react';
import { StatusUpdateEvent, CommandEvent } from '@obs-chat/event-schema';

interface ModerationSettingsProps {
  statusUpdate: StatusUpdateEvent | null;
  sendCommand: (command: CommandEvent) => void;
}

export function ModerationSettings({ statusUpdate, sendCommand }: ModerationSettingsProps) {
  const [bannedWords, setBannedWords] = useState<string>('');
  const [spamProtection, setSpamProtection] = useState(false);
  const [bannedWordAction, setBannedWordAction] = useState<'mask' | 'drop' | 'flag'>('mask');

  useEffect(() => {
    if (statusUpdate && statusUpdate.serverConfig) {
      setBannedWords(statusUpdate.serverConfig.bannedWords.join(', '));
      setSpamProtection(statusUpdate.serverConfig.spamProtectionEnabled ?? false);
      setBannedWordAction(statusUpdate.serverConfig.bannedWordAction ?? 'mask');
    }
  }, [statusUpdate?.serverConfig]);

  const handleSave = () => {
    const wordsArray = bannedWords.split(',').map(w => w.trim()).filter(w => w.length > 0);
    sendCommand({
      type: 'command',
      action: 'update_moderation',
      payload: {
        config: {
          bannedWords: wordsArray,
          spamProtectionEnabled: spamProtection,
          bannedWordAction: bannedWordAction as any
        }
      }
    });
    // Optimistic local update isn't strictly necessary since statusUpdate will sync back shortly
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px' }}>🛡️ Moderation Settings</h2>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Banned Words</h3>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '16px' }}>
          Comma-separated list of words to block from chat.
        </p>
        <textarea 
          value={bannedWords}
          onChange={(e) => setBannedWords(e.target.value)}
          placeholder="e.g. spam, troll, bot"
          style={{ width: '100%', height: '100px', padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', resize: 'vertical', fontFamily: 'monospace' }}
        />
        
        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Action on Banned Word</label>
          <select 
            value={bannedWordAction}
            onChange={(e) => setBannedWordAction(e.target.value as 'mask' | 'drop')}
            style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
          >
            <option value="mask">Mask word (***)</option>
            <option value="drop">Delete entire message</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Spam Protection</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            id="spam-toggle" 
            checked={spamProtection}
            onChange={(e) => setSpamProtection(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="spam-toggle" style={{ cursor: 'pointer', fontWeight: 600 }}>Enable basic spam protection</label>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px', marginBottom: 0 }}>
          Automatically drop rapidly repeated identical messages across platforms.
        </p>
      </div>

      <button
        onClick={handleSave}
        style={{
          background: '#00f0ff',
          color: '#000',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '1rem',
          width: '100%'
        }}
      >
        Save Settings
      </button>
    </div>
  );
}
