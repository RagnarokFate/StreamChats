import { useState } from 'react';
import { StatusUpdateEvent, CommandEventV2, Platform } from '@obs-chat/event-schema';

interface PlatformHealthProps {
  statusUpdate: StatusUpdateEvent | null;
  sendCommand: (command: CommandEventV2) => void;
}

const SUPPORTED_PLATFORMS: Platform[] = ['twitch', 'youtube', 'kick', 'tiktok'];

export function PlatformHealth({ statusUpdate, sendCommand }: PlatformHealthProps) {
  const [usernames, setUsernames] = useState<Record<string, string>>({});

  if (!statusUpdate) {
    return <div>Waiting for platform data...</div>;
  }

  const { platforms } = statusUpdate;

  const handleManagePlatform = (platform: Platform, action: 'connect' | 'disconnect') => {
    sendCommand({
      type: 'command',
      action: 'manage_platform',
      payload: { 
        platform, 
        action,
        username: usernames[platform]
      }
    } as any);
  };

  const handleReconnect = (platform: Platform) => {
    sendCommand({
      type: 'command',
      action: 'reconnect_platform',
      payload: { platform }
    } as any);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'CLOSED':
        return '#53FC18';
      case 'CONNECTING':
      case 'RECONNECTING':
      case 'WAITING': 
      case 'HALF_OPEN':
        return '#F5A623';
      case 'ERROR': 
      case 'OPEN':
        return '#FF0000';
      default: return '#ccc';
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '24px' }}>🔌 Platform Connections</h2>
      <p style={{ color: '#aaa', marginBottom: '24px' }}>
        Connect your streaming accounts to start receiving chat messages. Your connections will be saved automatically for your next stream.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {SUPPORTED_PLATFORMS.map(platform => {
          const connectedState = platforms.find(p => p.platform === platform);
          
          return (
            <div key={platform} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: connectedState ? getStatusColor(connectedState.status) : '#444' }} />
                  {platform}
                </h3>
                
                {connectedState ? (
                  <>
                    <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                      Status: <strong style={{ color: getStatusColor(connectedState.status) }}>{connectedState.status}</strong>
                      {connectedState.lastConnectedAt && ` • Last Connected: ${new Date(connectedState.lastConnectedAt).toLocaleTimeString()}`}
                    </div>
                    {connectedState.lastError && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#ff4d4f', background: 'rgba(255,0,0,0.1)', padding: '8px', borderRadius: '4px' }}>
                        Error: {connectedState.lastError}
                      </div>
                    )}
                    {connectedState.health && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#888' }}>
                        <span>⚡ Latency: {connectedState.health.latencyMs}ms</span>
                        <span>⚠️ Error Rate: {(connectedState.health.errorRate * 100).toFixed(1)}%</span>
                        {connectedState.health.lastEventTime && <span>🕒 Last Event: {new Date(connectedState.health.lastEventTime).toLocaleTimeString()}</span>}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                    Not Connected
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {connectedState ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleReconnect(platform)}
                      disabled={connectedState.status === 'CONNECTING' || connectedState.status === 'RECONNECTING'}
                    >
                      Reconnect
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ background: '#ef4444', color: '#fff', borderColor: '#ef4444' }}
                      onClick={() => handleManagePlatform(platform, 'disconnect')}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Username / Channel ID"
                      value={usernames[platform] || ''}
                      onChange={e => setUsernames({ ...usernames, [platform]: e.target.value })}
                      style={{ padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleManagePlatform(platform, 'connect')}
                      disabled={!usernames[platform]}
                    >
                      Connect
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
