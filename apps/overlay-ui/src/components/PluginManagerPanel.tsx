import { usePlugins } from '../hooks/usePlugins';

export function PluginManagerPanel({ wsUrl }: { wsUrl: string }) {
  const { plugins, pluginStatuses, togglePlugin, installPlugin } = usePlugins(wsUrl);

  return (
    <div className="plugin-manager-panel">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Plugin Marketplace & Manager</h2>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3>Marketplace (Available to Install)</h3>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Discover community plugins to extend StreamChats.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {/* Free Plugin */}
          <div className="plugin-item" style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Profanity Filter v1.0.0 <span style={{ fontSize: '0.7rem', background: '#4ade80', color: '#000', padding: '2px 4px', borderRadius: '4px', marginLeft: '8px' }}>FREE</span></h4>
              <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>Automatically intercepts and scrubs profanity from chat messages.</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>read_chat</span>
                <span style={{ fontSize: '0.75rem', background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>moderate_chat</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => installPlugin('profanity-filter')}>
              Install Plugin
            </button>
          </div>

          {/* Premium Plugin */}
          <div className="plugin-item" style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#ffd700' }}>AI Chat Summarizer v2.0.0 <span style={{ fontSize: '0.7rem', background: '#ffd700', color: '#000', padding: '2px 4px', borderRadius: '4px', marginLeft: '8px' }}>$9.99</span></h4>
              <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>Uses local AI to summarize long chat discussions automatically.</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>read_chat</span>
                <span style={{ fontSize: '0.75rem', background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>overlay-render</span>
              </div>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ background: 'linear-gradient(90deg, #d4af37 0%, #ffdf00 100%)', color: '#000', border: 'none' }}
              onClick={async (e) => {
                const btn = e.currentTarget;
                btn.innerText = 'Processing...';
                btn.disabled = true;
                // Mock Purchase Flow
                await new Promise(r => setTimeout(r, 1500));
                installPlugin('ai-summary');
                btn.innerText = 'Purchased & Installed';
              }}
            >
              Purchase
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Installed Plugins</h3>
        {plugins.length === 0 ? (
          <p style={{ color: '#aaa', fontStyle: 'italic' }}>No plugins installed yet. Try installing one from the marketplace or using the CLI!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {plugins.map(p => (
              <div key={p.id} className="plugin-item" style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{p.name} <span style={{ fontSize: '0.8rem', color: '#888' }}>v{p.version}</span></h4>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>{p.description}</p>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                    Status: <strong style={{ color: pluginStatuses[p.id] === 'active' ? '#10b981' : (pluginStatuses[p.id] === 'error' ? '#ef4444' : '#6b7280') }}>{pluginStatuses[p.id] || 'unknown'}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {pluginStatuses[p.id] === 'active' ? (
                    <button className="btn btn-secondary" onClick={() => togglePlugin(p.id, false)}>Disable</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => togglePlugin(p.id, true)}>Enable</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
