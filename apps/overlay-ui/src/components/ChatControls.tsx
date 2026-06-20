import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { CommandEvent } from '@obs-chat/event-schema';
import { EmoteToggle } from './EmoteToggle';
import { TimestampControls } from './TimestampControls';

interface ChatControlsProps {
  sendCommand: (command: CommandEvent) => void;
}

export function ChatControls({ sendCommand }: ChatControlsProps) {
  const { settings } = useSettings();

  const handleClearChat = () => {
    sendCommand({
      type: 'command',
      action: 'clear_chat',
      payload: {}
    });
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    sendCommand({
      type: 'command',
      action: 'update_settings',
      payload: {
        settings: { fontFamily: e.target.value }
      }
    });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendCommand({
      type: 'command',
      action: 'update_settings',
      payload: {
        settings: { fontSize: parseInt(e.target.value, 10) }
      }
    });
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    sendCommand({
      type: 'command',
      action: 'update_settings',
      payload: {
        settings: { fontWeight: parseInt(e.target.value, 10) }
      }
    });
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px' }}>💬 Chat Controls</h2>
      
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Moderation Actions</h3>
        <button 
          onClick={handleClearChat}
          style={{
            background: '#ff4d4f',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          🗑️ Clear Chat
        </button>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px' }}>
          This will immediately remove all messages from the overlay for all connected sources.
        </p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Typography</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Font Family</label>
          <select 
            value={settings.fontFamily} 
            onChange={handleFontChange}
            style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
          >
            <option value="Inter">Inter (Default)</option>
            <option value="Roboto">Roboto</option>
            <option value="Outfit">Outfit</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Press Start 2P">Press Start 2P (Retro)</option>
            <option value="Fira Code">Fira Code (Monospace)</option>
            <option value="Bangers">Bangers (Comic)</option>
            <option value="system-ui">System UI</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Font Size ({settings.fontSize}px)</label>
            <input 
              type="range" 
              min="10" 
              max="48" 
              value={settings.fontSize} 
              onChange={handleSizeChange}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Font Weight</label>
            <select 
              value={settings.fontWeight} 
              onChange={handleWeightChange}
              style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
            >
              <option value="400">Regular (400)</option>
              <option value="600">Semi-Bold (600)</option>
              <option value="700">Bold (700)</option>
            </select>
          </div>
        </div>
      </div>
      <EmoteToggle sendCommand={sendCommand} />
      <TimestampControls sendCommand={sendCommand} />
    </div>
  );
}
