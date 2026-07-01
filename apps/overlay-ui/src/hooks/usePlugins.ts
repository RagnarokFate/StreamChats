import { useState, useEffect } from 'react';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  permissions: string[];
}

export interface MarketplacePlugin extends PluginManifest {
  downloadUrl: string;
  isPremium?: boolean;
  price?: number;
  tier?: string;
}

export interface InstalledPlugin extends PluginManifest {
  status: 'active' | 'disabled' | 'needs_permission';
  missingPermissions?: string[];
}

export function usePlugins(wsUrl: string) {
  const [plugins, setPlugins] = useState<InstalledPlugin[]>([]);
  const [catalog, setCatalog] = useState<MarketplacePlugin[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setSocket(ws);
      // Fetch initial state
      ws.send(JSON.stringify({ type: 'command', action: 'list_plugins', payload: {} }));
      ws.send(JSON.stringify({ type: 'command', action: 'get_marketplace', payload: {} }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'command_response') {
          if (data.action === 'plugins_list') {
            setPlugins(data.payload.plugins);
          } else if (data.action === 'marketplace_catalog') {
            setCatalog(data.payload.catalog);
          }
        }
      } catch (err) {
        console.error('Failed to parse WS message in usePlugins:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  const installPlugin = (pluginId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'command',
        action: 'manage_plugin',
        payload: { pluginId, operation: 'install' }
      }));
    }
  };

  const uninstallPlugin = (pluginId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'command',
        action: 'manage_plugin',
        payload: { pluginId, operation: 'uninstall' }
      }));
    }
  };

  const grantCapabilities = (pluginId: string, capabilities: string[]) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'command',
        action: 'grant_plugin_capabilities',
        payload: { pluginId, capabilities }
      }));
    }
  };

  const togglePlugin = (pluginId: string, currentStatus: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const operation = currentStatus === 'active' ? 'disable' : 'enable';
      socket.send(JSON.stringify({
        type: 'command',
        action: 'manage_plugin',
        payload: { pluginId, operation }
      }));
    }
  };

  return {
    plugins,
    catalog,
    installPlugin,
    uninstallPlugin,
    grantCapabilities,
    togglePlugin
  };
}
