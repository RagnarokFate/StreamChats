import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { CommandEventV2, StatusUpdateEvent } from '@obs-chat/event-schema';
import { ChatControls } from './ChatControls';
import { ThemeEditor } from './ThemeEditor';
import { MarkerTimeline } from './MarkerTimeline';
import { StatsPanel } from './StatsPanel';
import { PlatformHealth } from './PlatformHealth';
import { ModerationSettings } from './ModerationSettings';
import { IdentityPanel } from './IdentityPanel';
import { ChatFeed } from './ChatFeed';
import { AnalyticsPanel } from './AnalyticsPanel';
import { SessionReplay } from './SessionReplay';
import { PluginManagerPanel } from './PluginManagerPanel';
import { OBSDock } from './OBSDock';
import { CloudSyncPanel } from './CloudSyncPanel';
import { UIMessage } from '../hooks/useChatFeed';

interface DashboardProps {
  sendCommand: (command: CommandEventV2) => void;
  messages: UIMessage[];
  statusUpdate: StatusUpdateEvent | null;
  identities: any[];
  accounts: any[];
  wsUrl: string;
}

export function Dashboard({ sendCommand, messages, statusUpdate, identities, accounts, wsUrl }: DashboardProps) {
  const { pathname } = useLocation();
  const { settings } = useSettings();

  const cssVariables = {
    '--msg-font': `"${settings.fontFamily}", sans-serif`,
    '--msg-text-size': `${settings.fontSize}px`,
    '--msg-weight': settings.fontWeight,
  } as React.CSSProperties;

  return (
    <div className="dashboard-container" style={{ 
      backgroundColor: settings.backgroundColor, 
      minHeight: '100vh', 
      width: '100vw', 
      display: 'flex',
      color: '#fff',
      position: 'fixed',
      top: 0,
      left: 0,
      fontFamily: 'Inter, sans-serif'
    }}>
      <nav className="dashboard-sidebar" style={{ 
        width: '250px', 
        background: 'rgba(20, 20, 25, 0.95)', 
        borderRight: '1px solid rgba(255,255,255,0.1)',
        padding: '24px', 
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '32px', color: '#fff' }}>Dashboard</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li><Link to="/dashboard" style={linkStyle(pathname === '/dashboard')}>💬 Chat Controls</Link></li>
          <li><Link to="/dashboard/overlay" style={linkStyle(pathname === '/dashboard/overlay')}>🎨 Theme Editor</Link></li>
          <li><Link to="/dashboard/markers" style={linkStyle(pathname === '/dashboard/markers')}>📍 Markers</Link></li>
          <li><Link to="/dashboard/stats" style={linkStyle(pathname === '/dashboard/stats')}>📊 Statistics</Link></li>
          <li><Link to="/dashboard/platforms" style={linkStyle(pathname === '/dashboard/platforms')}>🔌 Platforms</Link></li>
          <li><Link to="/dashboard/moderation" style={linkStyle(pathname === '/dashboard/moderation')}>🛡️ Moderation</Link></li>
          <li><Link to="/dashboard/identity" style={linkStyle(pathname === '/dashboard/identity')}>👤 Identity</Link></li>
          <li><Link to="/dashboard/analytics" style={linkStyle(pathname === '/dashboard/analytics')}>📊 Analytics</Link></li>
          <li><Link to="/dashboard/replay" style={linkStyle(pathname === '/dashboard/replay')}>⏪ Replay</Link></li>
          <li><Link to="/dashboard/plugins" style={linkStyle(pathname === '/dashboard/plugins')}>🧩 Plugins</Link></li>
          <li><Link to="/dashboard/cloud-sync" style={linkStyle(pathname === '/dashboard/cloud-sync')}>☁️ Cloud Sync</Link></li>
          <li><Link to="/dashboard/obs" style={linkStyle(pathname === '/dashboard/obs')}>🎥 OBS Integration</Link></li>
        </ul>
      </nav>
      
      <main className="dashboard-content" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<ChatControls sendCommand={sendCommand} />} />
          <Route path="overlay" element={<ThemeEditor sendCommand={sendCommand} />} />
          <Route path="markers" element={<MarkerTimeline sendCommand={sendCommand} wsUrl={wsUrl} />} />
          <Route path="stats" element={<StatsPanel sendCommand={sendCommand} statusUpdate={statusUpdate} />} />
          <Route path="platforms" element={<PlatformHealth sendCommand={sendCommand} statusUpdate={statusUpdate} />} />
          <Route path="moderation" element={<ModerationSettings sendCommand={sendCommand} statusUpdate={statusUpdate} />} />
          <Route path="identity" element={<IdentityPanel 
            sendCommand={sendCommand} 
            identities={identities} 
            accounts={accounts} 
            refresh={() => sendCommand({type: 'command', action: 'get_identities', payload: {}})}
          />} />
          <Route path="analytics" element={<AnalyticsPanel wsUrl={wsUrl} />} />
          <Route path="replay" element={<SessionReplay wsUrl={wsUrl} />} />
          <Route path="plugins" element={<PluginManagerPanel wsUrl={wsUrl} />} />
          <Route path="cloud-sync" element={<CloudSyncPanel />} />
          <Route path="obs" element={<OBSDock wsUrl={wsUrl} />} />
        </Routes>
      </main>

      <aside style={{ width: '400px', background: 'rgba(0,0,0,0.5)', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#aaa' }}>Live Preview ({settings.activeTheme})</h3>
        </div>
        <div data-theme={settings.activeTheme} style={{ flex: 1, overflow: 'hidden', position: 'relative', ...cssVariables }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
            <ChatFeed messages={messages} identities={identities} accounts={accounts} sendCommand={sendCommand} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function linkStyle(isActive: boolean): React.CSSProperties {
  return {
    color: isActive ? '#00f0ff' : '#a0a0b0',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 400,
    display: 'block',
    padding: '8px 12px',
    borderRadius: '6px',
    background: isActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
    transition: 'all 0.2s ease'
  };
}
