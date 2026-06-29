import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { CommandEventV2 } from '@obs-chat/event-schema';

interface OverlaySettingsProps {
  sendCommand: (command: CommandEventV2) => void;
}

const THEMES = ['glass', 'minimal', 'neon', 'classic', 'retro', 'bubble', 'holographic', 'comic', 'terminal'];

export function OverlaySettings({ sendCommand }: OverlaySettingsProps) {
  const { settings } = useSettings();

  const handleThemeChange = (theme: string) => {
    sendCommand({
      type: 'command',
      action: 'update_settings',
      payload: {
        settings: { activeTheme: theme }
      }
    });
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendCommand({
      type: 'command',
      action: 'update_settings',
      payload: {
        settings: { backgroundColor: e.target.value }
      }
    });
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px' }}>🎨 Overlay Settings</h2>
      
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Background Color</h3>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '16px' }}>
          Choose a background color for the dashboard itself (this does NOT affect the transparent OBS overlay).
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="color" 
            value={settings.backgroundColor} 
            onChange={handleBgColorChange}
            style={{ width: '50px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
          />
          <span style={{ fontFamily: 'monospace' }}>{settings.backgroundColor}</span>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Theme Selector</h3>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '16px' }}>
          Select the visual theme for your chat overlay. Changes are applied instantly to connected sources.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
          {THEMES.map(theme => {
            const isActive = settings.activeTheme === theme;
            return (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                style={{
                  background: isActive ? '#00f0ff' : '#222',
                  color: isActive ? '#000' : '#fff',
                  border: `2px solid ${isActive ? '#00f0ff' : '#444'}`,
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {theme}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
