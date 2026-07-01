import { useState } from 'react';
import { usePlugins, InstalledPlugin } from '../hooks/usePlugins';

interface PluginManagerPanelProps {
  wsUrl: string;
}

export const PluginManagerPanel = ({ wsUrl }: PluginManagerPanelProps) => {
  const { plugins, catalog, installPlugin, uninstallPlugin, grantCapabilities, togglePlugin } = usePlugins(wsUrl);
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed');
  const [reviewPlugin, setReviewPlugin] = useState<InstalledPlugin | null>(null);

  const handleGrant = (plugin: InstalledPlugin) => {
    // Grant all requested permissions for this demo
    grantCapabilities(plugin.id, plugin.permissions);
    setReviewPlugin(null);
  };

  return (
    <div className="plugin-manager-panel" style={{ padding: '20px', color: '#fff', height: '100%', overflowY: 'auto' }}>
      <h2>Plugin Ecosystem (Sandboxed)</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('installed')}
          style={{ padding: '8px 16px', background: activeTab === 'installed' ? '#3b82f6' : '#374151', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
        >
          Installed Plugins
        </button>
        <button 
          onClick={() => setActiveTab('marketplace')}
          style={{ padding: '8px 16px', background: activeTab === 'marketplace' ? '#3b82f6' : '#374151', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
        >
          Marketplace
        </button>
      </div>

      {activeTab === 'installed' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          {plugins.length === 0 && <p style={{ color: '#9ca3af' }}>No plugins installed.</p>}
          {plugins.map(plugin => (
            <div key={plugin.id} style={{ background: '#1f2937', padding: '15px', borderRadius: '8px', border: '1px solid #374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{plugin.name} <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>v{plugin.version}</span></h3>
                  <p style={{ margin: '0 0 10px 0', color: '#d1d5db', fontSize: '0.9rem' }}>{plugin.description}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                      background: plugin.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : plugin.status === 'needs_permission' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: plugin.status === 'active' ? '#34d399' : plugin.status === 'needs_permission' ? '#fbbf24' : '#f87171'
                    }}>
                      {plugin.status === 'active' ? 'Active' : plugin.status === 'needs_permission' ? 'Needs Permission' : 'Disabled'}
                    </span>
                    
                    {plugin.status === 'needs_permission' && (
                      <button 
                        onClick={() => setReviewPlugin(plugin)}
                        style={{ padding: '4px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Review Permissions
                      </button>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => togglePlugin(plugin.id, plugin.status)}
                    disabled={plugin.status === 'needs_permission'}
                    style={{ padding: '6px 12px', background: plugin.status === 'active' ? '#ef4444' : '#10b981', border: 'none', color: '#fff', borderRadius: '4px', cursor: plugin.status === 'needs_permission' ? 'not-allowed' : 'pointer', opacity: plugin.status === 'needs_permission' ? 0.5 : 1 }}
                  >
                    {plugin.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    onClick={() => uninstallPlugin(plugin.id)}
                    style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Uninstall
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          {catalog.map(plugin => (
            <div key={plugin.id} style={{ background: '#1f2937', padding: '15px', borderRadius: '8px', border: '1px solid #374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{plugin.name} <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>v{plugin.version}</span></h3>
                  <p style={{ margin: '0 0 10px 0', color: '#d1d5db', fontSize: '0.9rem' }}>{plugin.description}</p>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {plugin.permissions.map(p => (
                      <span key={p} style={{ padding: '2px 6px', background: '#374151', color: '#9ca3af', fontSize: '0.75rem', borderRadius: '4px' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => installPlugin(plugin.id)}
                  disabled={plugins.some(p => p.id === plugin.id)}
                  style={{ 
                    padding: '6px 16px', 
                    background: plugins.some(p => p.id === plugin.id) ? '#374151' : '#10b981', 
                    border: 'none', 
                    color: '#fff', 
                    borderRadius: '4px', 
                    cursor: plugins.some(p => p.id === plugin.id) ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {plugins.some(p => p.id === plugin.id) ? 'Installed' : 'Install'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permission Review Modal */}
      {reviewPlugin && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Review Capabilities</h3>
            <p style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '20px' }}>
              The plugin <strong>{reviewPlugin.name}</strong> is requesting the following capabilities:
            </p>
            
            <ul style={{ background: '#111827', padding: '12px 12px 12px 30px', borderRadius: '4px', marginBottom: '20px' }}>
              {reviewPlugin.missingPermissions?.map(p => (
                <li key={p} style={{ color: '#ef4444', marginBottom: '6px' }}>
                  {p === 'network' && 'Network Access (fetch external APIs)'}
                  {p === 'filesystem' && 'Filesystem Access (read local files)'}
                  {p === 'read_chat' && 'Read Chat Messages'}
                  {p === 'send_chat' && 'Send Chat Messages'}
                  {p === 'moderate_chat' && 'Moderate Chat Messages'}
                  {!['network', 'filesystem', 'read_chat', 'send_chat', 'moderate_chat'].includes(p) && p}
                </li>
              ))}
            </ul>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setReviewPlugin(null)}
                style={{ padding: '8px 16px', background: '#374151', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleGrant(reviewPlugin)}
                style={{ padding: '8px 16px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
              >
                Grant & Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
