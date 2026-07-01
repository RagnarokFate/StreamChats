
import { useSettings } from '../hooks/useSettings';
import { CommandEventV2 } from '@obs-chat/event-schema';

interface ThemeEditorProps {
  sendCommand: (command: CommandEventV2) => void;
}

export function ThemeEditor({ sendCommand }: ThemeEditorProps) {
  const { settings } = useSettings();

  const handleUpdate = (updates: Partial<typeof settings>) => {
    sendCommand({
      type: 'command',
      action: 'update_settings',
      payload: { settings: updates }
    });
  };

  return (
    <div className="theme-editor" style={{ display: 'flex', gap: '24px', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', overflowY: 'auto', paddingRight: '12px' }}>
        <h2>🎨 Theme Editor</h2>
        
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Active Theme</h3>
          <select 
            value={settings.activeTheme}
            onChange={(e) => handleUpdate({ activeTheme: e.target.value })}
            style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
          >
            <option value="glass">Glass (Default)</option>
            <option value="minimal">Minimal</option>
            <option value="neon">Neon</option>
            <option value="classic">Classic</option>
            <option value="retro">Retro</option>
            <option value="bubble">Bubble</option>
            <option value="holographic">Holographic</option>
            <option value="comic">Comic</option>
            <option value="terminal">Terminal</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>View Mode</h3>
          <select 
            value={settings.viewMode}
            onChange={(e) => handleUpdate({ viewMode: e.target.value as any })}
            style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
          >
            <option value="unified">Unified (Single Column)</option>
            <option value="split">Split (Multi-Column)</option>
            <option value="priority">Priority (Highlight Events)</option>
            <option value="moderator">Moderator (Action Buttons)</option>
          </select>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Background Color</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input 
              type="color" 
              value={settings.backgroundColor}
              onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
              style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
            <input 
              type="text" 
              value={settings.backgroundColor}
              onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
              style={{ flex: 1, padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
            />
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Typography</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Font Family</label>
              <select 
                value={settings.fontFamily}
                onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Outfit">Outfit</option>
                <option value="Press Start 2P">Press Start 2P</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Font Size ({settings.fontSize}px)</label>
              <input 
                type="range" 
                min="12" max="36" 
                value={settings.fontSize}
                onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value, 10) })}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Font Weight</label>
              <select 
                value={settings.fontWeight}
                onChange={(e) => handleUpdate({ fontWeight: parseInt(e.target.value, 10) })}
                style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
              >
                <option value="400">Regular (400)</option>
                <option value="600">Semi-Bold (600)</option>
                <option value="700">Bold (700)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginTop: 0 }}>Live Preview</h3>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>This shows how the overlay looks with your current settings.</p>
        <div style={{ flex: 1, background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
          {/* We embed the actual overlay UI here as an iframe */}
          <iframe 
            src="/" 
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Overlay Preview"
          />
        </div>
      </div>
    </div>
  );
}
