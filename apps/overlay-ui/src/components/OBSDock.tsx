import { useState, useEffect } from 'react';
import { useOBS } from '../hooks/useOBS';

export function OBSDock({ wsUrl }: { wsUrl: string }) {
  const { connected, scenes, currentScene, connectOBS, disconnectOBS, setScene, getScenes } = useOBS(wsUrl);
  
  const [obsUrl, setObsUrl] = useState('ws://127.0.0.1:4455');
  const [password, setPassword] = useState('');

  // Auto-fetch scenes when connected
  useEffect(() => {
    if (connected) {
      getScenes();
    }
  }, [connected]);

  return (
    <div className="obs-dock-panel">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>OBS Integration</h2>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3>Connection Settings</h3>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '16px' }}>
          Connect to OBS Studio's WebSocket server to read scenes and control your stream.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>OBS WebSocket URL</label>
            <input 
              value={obsUrl}
              onChange={e => setObsUrl(e.target.value)}
              disabled={connected}
              style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>Password (Optional)</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={connected}
              style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <div style={{ paddingBottom: '2px' }}>
            {connected ? (
              <button className="btn" style={{ background: '#ef4444', color: '#fff' }} onClick={disconnectOBS}>Disconnect</button>
            ) : (
              <button className="btn btn-primary" onClick={() => connectOBS(obsUrl, password)}>Connect</button>
            )}
          </div>
        </div>
        
        <div style={{ marginTop: '16px', fontSize: '0.9rem' }}>
          Status: <strong style={{ color: connected ? '#10b981' : '#ef4444' }}>{connected ? 'Connected to OBS' : 'Disconnected'}</strong>
        </div>
      </div>

      {connected && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Scenes</h3>
            <button className="btn btn-secondary" onClick={getScenes} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Refresh</button>
          </div>
          
          {scenes.length === 0 ? (
            <p style={{ color: '#aaa', fontStyle: 'italic' }}>No scenes found.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {scenes.map(scene => (
                <div 
                  key={scene} 
                  onClick={() => setScene(scene)}
                  style={{ 
                    padding: '16px', 
                    background: currentScene === scene ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: currentScene === scene ? '1px solid #3b82f6' : '1px solid transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (currentScene !== scene) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (currentScene !== scene) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                >
                  <div style={{ fontWeight: currentScene === scene ? 'bold' : 'normal', color: currentScene === scene ? '#60a5fa' : '#fff' }}>
                    {scene}
                  </div>
                  {currentScene === scene && (
                    <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '4px' }}>Active Scene</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
