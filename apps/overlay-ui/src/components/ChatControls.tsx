import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { CommandEventV2 } from '@obs-chat/event-schema';
import { EmoteToggle } from './EmoteToggle';
import { TimestampControls } from './TimestampControls';

interface ChatControlsProps {
  sendCommand: (command: CommandEventV2) => void;
}

export function ChatControls({ sendCommand }: ChatControlsProps) {
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);

  const [copiedDashboard, setCopiedDashboard] = useState(false);

  const handleClearChat = () => {
    sendCommand({
      type: 'command',
      action: 'clear_chat',
      payload: {}
    });
  };

  const handleTestMessage = () => {
    sendCommand({
      type: 'command',
      action: 'simulate_test_message',
      payload: {}
    } as any);
  };

  const handlePlaceMarker = () => {
    const time = new Date().toISOString().substring(11, 19);
    sendCommand({
      type: 'command',
      action: 'place_marker',
      payload: {
        markerId: crypto.randomUUID(),
        sessionId: 'current',
        time,
        label: 'Quick Marker'
      }
    } as any);
  };

  const handleResetStats = () => {
    if (window.confirm("Are you sure you want to reset all current stream statistics? This will permanently wipe the active session stats!")) {
      sendCommand({
        type: 'command',
        action: 'reset_stats',
        payload: {}
      });
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("http://localhost:9090/");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDashboard = () => {
    navigator.clipboard.writeText("http://localhost:5173/");
    setCopiedDashboard(true);
    setTimeout(() => setCopiedDashboard(false), 2000);
  };

  const btnStyle = {
    flex: '1 1 calc(50% - 16px)',
    minHeight: '80px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    color: '#fff',
    textAlign: 'left' as const,
  };

  const btnHoverStyle = {
    ...btnStyle,
    background: 'rgba(255,255,255,0.1)',
    transform: 'translateY(-2px)'
  };

  const redBtnStyle = {
    ...btnStyle,
    background: 'rgba(255, 77, 79, 0.1)',
    border: '1px solid rgba(255, 77, 79, 0.3)',
    color: '#ff4d4f'
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '8px' }}>⚡ Quick Actions</h2>
      <p style={{ color: '#aaa', marginBottom: '32px' }}>Fast access to your most frequently used stream tools.</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        
        {/* DASHBOARD COPY BUTTON */}
        <button 
          onClick={handleCopyDashboard}
          style={copiedDashboard ? {...btnStyle, background: 'rgba(0, 255, 100, 0.2)', border: '1px solid rgba(0, 255, 100, 0.5)'} : btnStyle}
          onMouseOver={(e) => { if(!copiedDashboard) Object.assign(e.currentTarget.style, btnHoverStyle) }}
          onMouseOut={(e) => { if(!copiedDashboard) Object.assign(e.currentTarget.style, btnStyle) }}
        >
          <div style={{ fontSize: '1.4rem' }}>🖥️</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{copiedDashboard ? 'Copied to Clipboard!' : 'Copy Chat Reading Version'}</div>
            <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>http://localhost:5173/</div>
          </div>
        </button>

        {/* URL COPY BUTTON */}
        <button 
          onClick={handleCopyUrl}
          style={copied ? {...btnStyle, background: 'rgba(0, 255, 100, 0.2)', border: '1px solid rgba(0, 255, 100, 0.5)'} : btnStyle}
          onMouseOver={(e) => { if(!copied) Object.assign(e.currentTarget.style, btnHoverStyle) }}
          onMouseOut={(e) => { if(!copied) Object.assign(e.currentTarget.style, btnStyle) }}
        >
          <div style={{ fontSize: '1.4rem' }}>🔗</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{copied ? 'Copied to Clipboard!' : 'Copy Overlay URL'}</div>
            <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>http://localhost:9090/</div>
          </div>
        </button>

        {/* TEST MESSAGE BUTTON */}
        <button 
          onClick={handleTestMessage}
          style={btnStyle}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, btnHoverStyle)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, btnStyle)}
        >
          <div style={{ fontSize: '1.4rem' }}>🧪</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Send Test Message</div>
            <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>Verify your overlay design</div>
          </div>
        </button>

        {/* STREAM MARKER BUTTON */}
        <button 
          onClick={handlePlaceMarker}
          style={btnStyle}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, btnHoverStyle)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, btnStyle)}
        >
          <div style={{ fontSize: '1.4rem' }}>📍</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Place Stream Marker</div>
            <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>Save timestamp for VOD review</div>
          </div>
        </button>

        {/* RESET STATS BUTTON */}
        <button 
          onClick={handleResetStats}
          style={btnStyle}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, btnHoverStyle)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, btnStyle)}
        >
          <div style={{ fontSize: '1.4rem' }}>🔄</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Reset Session Stats</div>
            <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>Clear current metrics before live</div>
          </div>
        </button>

        {/* CLEAR CHAT BUTTON */}
        <button 
          onClick={handleClearChat}
          style={redBtnStyle}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, {...redBtnStyle, background: 'rgba(255, 77, 79, 0.2)'})}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, redBtnStyle)}
        >
          <div style={{ fontSize: '1.4rem' }}>🗑️</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Clear Overlay Chat</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Instantly hide all current messages</div>
          </div>
        </button>

      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>View Mode</h3>
        <select 
          value={settings.viewMode} 
          onChange={(e) => sendCommand({
            type: 'command',
            action: 'update_settings',
            payload: { settings: { viewMode: e.target.value as any } }
          })}
          style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
        >
          <option value="unified">Unified (Default)</option>
          <option value="split">Split</option>
          <option value="priority">Priority</option>
          <option value="moderator">Moderator</option>
        </select>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px' }}>
          Unified merges all chats. Split separates platforms. Moderator adds inline actions.
        </p>
      </div>

      <EmoteToggle sendCommand={sendCommand} />
      <TimestampControls sendCommand={sendCommand} />
    </div>
  );
}
