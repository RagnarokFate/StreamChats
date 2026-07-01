import { useState, useEffect } from 'react';
import { StatusUpdateEvent, CommandEventV2 } from '@obs-chat/event-schema';

interface ModerationSettingsProps {
  statusUpdate: StatusUpdateEvent | null;
  sendCommand: (command: CommandEventV2) => void;
}

export function ModerationSettings({ statusUpdate, sendCommand }: ModerationSettingsProps) {
  const [bannedWords, setBannedWords] = useState<string>('');
  const [spamProtection, setSpamProtection] = useState(false);
  const [bannedWordAction, setBannedWordAction] = useState<'mask' | 'drop' | 'flag'>('mask');
  const [aiToxicityEnabled, setAiToxicityEnabled] = useState(false);
  const [aiToxicityThreshold, setAiToxicityThreshold] = useState(0.8);

  useEffect(() => {
    if (statusUpdate && statusUpdate.serverConfig) {
      setBannedWords(statusUpdate.serverConfig.bannedWords.join(', '));
      setSpamProtection(statusUpdate.serverConfig.spamProtectionEnabled ?? false);
      setBannedWordAction(statusUpdate.serverConfig.bannedWordAction ?? 'mask');
      setAiToxicityEnabled(statusUpdate.serverConfig.aiToxicityEnabled ?? false);
      setAiToxicityThreshold(statusUpdate.serverConfig.aiToxicityThreshold ?? 0.8);
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
          bannedWordAction: bannedWordAction as any,
          aiToxicityEnabled,
          aiToxicityThreshold
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

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>AI Toxicity Filtering</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            id="toxicity-toggle" 
            checked={aiToxicityEnabled}
            onChange={(e) => setAiToxicityEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="toxicity-toggle" style={{ cursor: 'pointer', fontWeight: 600 }}>Enable local AI Toxicity detection</label>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px', marginBottom: '16px' }}>
          Uses a local, quantized machine learning model to score messages for toxicity. The model (~25MB) will be downloaded on first enable.
        </p>

        {aiToxicityEnabled && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>
              Toxicity Threshold ({(aiToxicityThreshold * 100).toFixed(0)}%)
            </label>
            <input 
              type="range" 
              min="0" max="1" step="0.05"
              value={aiToxicityThreshold}
              onChange={(e) => setAiToxicityThreshold(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
              Messages with a toxicity score above this threshold will be shadow-suppressed (hidden from the overlay, but visible to moderators). Lower values are stricter.
            </p>
          </div>
        )}
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
