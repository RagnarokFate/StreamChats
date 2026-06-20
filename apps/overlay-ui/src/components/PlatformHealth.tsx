import { StatusUpdateEvent, CommandEvent } from '@obs-chat/event-schema';

interface PlatformHealthProps {
  statusUpdate: StatusUpdateEvent | null;
  sendCommand: (command: CommandEvent) => void;
}

export function PlatformHealth({ statusUpdate, sendCommand }: PlatformHealthProps) {
  if (!statusUpdate) {
    return <div>Waiting for platform data...</div>;
  }

  const { platforms } = statusUpdate;

  const handleReconnect = (platform: any) => {
    sendCommand({
      type: 'command',
      action: 'reconnect_platform',
      payload: { platform }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED': return '#53FC18';
      case 'CONNECTING':
      case 'RECONNECTING':
      case 'WAITING': return '#F5A623';
      case 'ERROR': return '#FF0000';
      default: return '#ccc';
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '24px' }}>🔌 Platform Connections</h2>

      {platforms.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', color: '#aaa' }}>
          No platforms configured. Pass --twitch="channel" or --youtube="channel" when starting the server.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {platforms.map(p => (
            <div key={p.platform} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getStatusColor(p.status) }} />
                  {p.platform} ({p.channelId})
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                  Status: <strong style={{ color: getStatusColor(p.status) }}>{p.status}</strong>
                  {p.lastConnectedAt && ` • Last Connected: ${new Date(p.lastConnectedAt).toLocaleTimeString()}`}
                </div>
                {p.lastError && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#ff4d4f', background: 'rgba(255,0,0,0.1)', padding: '8px', borderRadius: '4px' }}>
                    Error: {p.lastError}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleReconnect(p.platform)}
                disabled={p.status === 'CONNECTING' || p.status === 'RECONNECTING'}
                style={{
                  background: p.status === 'ERROR' ? '#ff4d4f' : '#333',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: (p.status === 'CONNECTING' || p.status === 'RECONNECTING') ? 'not-allowed' : 'pointer',
                  opacity: (p.status === 'CONNECTING' || p.status === 'RECONNECTING') ? 0.5 : 1,
                  fontWeight: 600
                }}
              >
                Reconnect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
