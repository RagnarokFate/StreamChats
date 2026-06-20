import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { CommandEvent, Platform } from '@obs-chat/event-schema';

interface EmoteToggleProps {
  sendCommand: (command: CommandEvent) => void;
}

export function EmoteToggle({ sendCommand }: EmoteToggleProps) {
  const { settings } = useSettings();

  const handleGlobalToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendCommand({
      type: 'command',
      action: 'update_settings',
      payload: {
        settings: { emoteGlobalEnabled: e.target.checked }
      }
    });
  };

  const handlePlatformToggle = (platform: Platform, checked: boolean) => {
    sendCommand({
      type: 'command',
      action: 'update_settings',
      payload: {
        settings: { 
          emotePlatformToggles: {
            ...settings.emotePlatformToggles,
            [platform]: checked
          }
        }
      }
    });
  };

  const platforms: Platform[] = ['twitch', 'youtube', 'kick', 'tiktok', 'custom'];

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginTop: '24px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Emote Settings</h3>
      
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input 
          type="checkbox" 
          id="global-emote" 
          checked={settings.emoteGlobalEnabled} 
          onChange={handleGlobalToggle}
          style={{ width: '18px', height: '18px' }}
        />
        <label htmlFor="global-emote" style={{ cursor: 'pointer', fontWeight: 600 }}>Enable Emotes Globally</label>
      </div>

      <div style={{ marginLeft: '24px', opacity: settings.emoteGlobalEnabled ? 1 : 0.5, pointerEvents: settings.emoteGlobalEnabled ? 'auto' : 'none' }}>
        <h4 style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '8px' }}>Per Platform</h4>
        {platforms.map(p => (
          <div key={p} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id={`emote-${p}`} 
              checked={settings.emotePlatformToggles?.[p] ?? true} 
              onChange={(e) => handlePlatformToggle(p, e.target.checked)}
            />
            <label htmlFor={`emote-${p}`} style={{ cursor: 'pointer', textTransform: 'capitalize' }}>{p}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
