import { useState } from 'react';
import { Platform } from '@obs-chat/event-schema';

export function IdentityPanel({ identities, accounts, linkIdentity }: { identities: any[], accounts: any[], linkIdentity: (platform: Platform, userId: string, username: string, targetId?: string) => void }) {
  const [newPlatform, setNewPlatform] = useState<Platform>('twitch');
  const [newUserId, setNewUserId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [targetId, setTargetId] = useState('');

  const handleLink = () => {
    if (!newUserId || !newUsername) return;
    linkIdentity(newPlatform, newUserId, newUsername, targetId || undefined);
    setNewUserId('');
    setNewUsername('');
  };

  return (
    <div className="identity-panel">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Viewer Identities</h2>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3>Manual Link Account</h3>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '16px' }}>
          Link a user's platform account to a unified identity.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>Platform</label>
            <select 
              value={newPlatform} 
              onChange={e => setNewPlatform(e.target.value as Platform)}
              style={{ padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            >
              <option value="twitch">Twitch</option>
              <option value="youtube">YouTube</option>
              <option value="kick">Kick</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>Platform User ID</label>
            <input 
              type="text" 
              placeholder="e.g. 12345" 
              value={newUserId}
              onChange={e => setNewUserId(e.target.value)}
              style={{ width: '120px', padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>Username</label>
            <input 
              type="text" 
              placeholder="e.g. ragnarokfate" 
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              style={{ width: '150px', padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>Target Identity</label>
            <select
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              style={{ padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            >
              <option value="">-- Create New Identity --</option>
              {identities.map(id => (
                <option key={id.id} value={id.id}>{id.displayName}</option>
              ))}
            </select>
          </div>
          <div style={{ paddingBottom: '2px' }}>
            <button 
              onClick={handleLink}
              className="btn btn-primary"
            >
              Link Account
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {identities.map(identity => (
          <div key={identity.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>{identity.displayName}</span>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '0.8rem', 
                fontWeight: 'bold',
                background: identity.reputationScore >= 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: identity.reputationScore >= 1 ? '#10b981' : '#ef4444'
              }}>
                Rep: {identity.reputationScore.toFixed(2)}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
              Accounts:
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {accounts.filter(a => a.identityId === identity.id).map(acc => (
                  <li key={`${acc.platform}-${acc.platformUserId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`platform-badge ${acc.platform}`} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>{acc.platform}</span>
                    <span style={{ color: '#ddd' }}>{acc.platformUsername} <span style={{ color: '#666' }}>({acc.platformUserId})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
