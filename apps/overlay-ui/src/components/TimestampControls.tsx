import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { CommandEventV2 } from '@obs-chat/event-schema';

interface TimestampControlsProps {
  sendCommand: (command: CommandEventV2) => void;
}

export function TimestampControls({ sendCommand }: TimestampControlsProps) {
  const { settings } = useSettings();

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    sendCommand({
      type: 'command',
      action: 'update_settings',
      payload: {
        settings: { timestampMode: e.target.value as any }
      }
    });
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginTop: '24px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Timestamp Settings</h3>
      
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Timestamp Mode</label>
        <select 
          value={settings.timestampMode} 
          onChange={handleModeChange}
          style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
        >
          <option value="off">Off (Hidden)</option>
          <option value="relative">Relative (e.g. 2m ago)</option>
          <option value="absolute">Absolute (e.g. 7:42 PM)</option>
        </select>
      </div>
    </div>
  );
}
