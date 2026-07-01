import React, { useState } from 'react';
import { ViewerIdentity, PlatformAccount } from '@obs-chat/identity';
import { Platform } from '@obs-chat/event-schema';
import { CommandEventV2 } from '@obs-chat/event-schema';

interface IdentityPanelProps {
  identities: ViewerIdentity[];
  accounts: PlatformAccount[];
  sendCommand: (cmd: CommandEventV2) => void;
  refresh: () => void;
}

export function IdentityPanel({ identities, accounts, sendCommand, refresh }: IdentityPanelProps) {
  const [selectedIdentity, setSelectedIdentity] = useState<string | null>(null);

  const handleLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const platform = formData.get('platform') as Platform;
    const userId = formData.get('userId') as string;
    const username = formData.get('username') as string;
    const identityId = formData.get('identityId') as string;

    if (platform && userId && username && identityId) {
      sendCommand({
        type: 'command',
        action: 'link_identity',
        payload: { platform, platformUserId: userId, platformUsername: username, identityId, method: 'manual' }
      });
      setTimeout(refresh, 500); // give the backend a moment to process before refreshing
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 'bold' }}>Viewer Identities</h2>
      
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left: Identities List */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ marginBottom: '16px' }}>All Identities</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {identities.map(id => (
              <li 
                key={id.id}
                onClick={() => setSelectedIdentity(id.id)}
                style={{ 
                  padding: '12px', 
                  background: selectedIdentity === id.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: `1px solid ${selectedIdentity === id.id ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '4px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>{id.displayName}</span>
                <span style={{ 
                  color: id.reputationScore >= 1 ? '#4ade80' : '#f87171',
                  fontWeight: 'bold'
                }}>
                  {id.reputationScore.toFixed(2)}
                </span>
              </li>
            ))}
            {identities.length === 0 && <p style={{ color: '#888' }}>No identities found.</p>}
          </ul>
        </div>

        {/* Right: Selected Identity Details & Linking */}
        <div style={{ flex: 1 }}>
          {selectedIdentity ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ marginBottom: '16px' }}>Linked Accounts</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '24px' }}>
                {accounts.filter(a => a.identityId === selectedIdentity).map(acc => (
                  <li key={`${acc.platform}-${acc.platformUserId}`} style={{ 
                    padding: '8px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '4px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '0.9rem' }}>{acc.platform}</span>
                    <span>{acc.platformUsername} ({acc.platformUserId})</span>
                  </li>
                ))}
              </ul>

              <h4 style={{ marginBottom: '12px' }}>Link New Account</h4>
              <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="hidden" name="identityId" value={selectedIdentity} />
                
                <select name="platform" required style={{ padding: '8px', borderRadius: '4px', background: '#222', color: '#fff', border: '1px solid #444' }}>
                  <option value="twitch">Twitch</option>
                  <option value="youtube">YouTube</option>
                  <option value="kick">Kick</option>
                  <option value="tiktok">TikTok</option>
                </select>
                
                <input type="text" name="userId" placeholder="Platform User ID (e.g., 12345)" required style={{ padding: '8px', borderRadius: '4px', background: '#222', color: '#fff', border: '1px solid #444' }} />
                <input type="text" name="username" placeholder="Platform Username (e.g., CoolViewer99)" required style={{ padding: '8px', borderRadius: '4px', background: '#222', color: '#fff', border: '1px solid #444' }} />
                
                <button type="submit" style={{ padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Link Account
                </button>
              </form>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#888', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              Select an identity to view details and link accounts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
