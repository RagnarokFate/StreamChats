import { useState } from 'react';

export function CloudSyncPanel() {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    // MOCK: Simulate network request to CloudSyncClient
    await new Promise(res => setTimeout(res, 1500));
    setLastSync(new Date().toISOString());
    setIsSyncing(false);
    
    // MOCK: Add a fake conflict to the log
    if (Math.random() > 0.5 && conflicts.length === 0) {
      setConflicts([
        {
          timestamp: new Date().toISOString(),
          winner: 'remote',
          local: { meta: { version: 1, lastUpdated: new Date(Date.now() - 10000).toISOString() } },
          remote: { meta: { version: 2, lastUpdated: new Date().toISOString() } }
        }
      ]);
    }
  };

  return (
    <div style={{ color: '#fff', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>☁️ Cloud Synchronization</h2>
      </div>

      <div className="card" style={{ background: 'rgba(20, 20, 25, 0.6)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0' }}>Enable Cloud Sync</h3>
            <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>
              Automatically sync your themes, moderation filters, and identity links across multiple devices.
            </p>
          </div>
          <button 
            className="btn"
            style={{ 
              background: syncEnabled ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.1)',
              border: syncEnabled ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid rgba(255,255,255,0.2)',
              color: syncEnabled ? '#00f0ff' : '#fff',
              padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'
            }}
            onClick={() => setSyncEnabled(!syncEnabled)}
          >
            {syncEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {syncEnabled && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
              Last Synced: {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
            </div>
            <button 
              className="btn"
              style={{ background: '#00f0ff', color: '#000', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
              onClick={handleManualSync}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ background: 'rgba(20, 20, 25, 0.6)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Conflict Log</h3>
        {conflicts.length === 0 ? (
          <p style={{ color: '#aaa', fontStyle: 'italic', margin: 0 }}>No sync conflicts detected.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conflicts.map((c, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #ffaa00' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Conflict Resolved ({c.winner} won)</strong>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(c.timestamp).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
                  Local version {c.local.meta.version} vs Remote version {c.remote.meta.version}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
