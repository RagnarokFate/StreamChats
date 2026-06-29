import { useState, useEffect, useRef } from 'react';
import { PluginStatusEvent } from '@obs-chat/event-schema';

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  permissions: string[];
}

export function usePlugins(url: string) {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [pluginStatuses, setPluginStatuses] = useState<Record<string, string>>({});
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      // Request initial list of plugins
      ws.current?.send(JSON.stringify({
        type: 'command',
        action: 'manage_plugin',
        payload: { action: 'list' }
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'plugin_status') {
          const payload = data as PluginStatusEvent & { plugins?: PluginInfo[] };
          
          if (payload.status === 'listed' && payload.plugins) {
            setPlugins(payload.plugins);
            // Initialize all listed plugins as active for now (in a real implementation, we'd track state accurately)
            const statuses: Record<string, string> = {};
            payload.plugins.forEach(p => statuses[p.id] = 'active');
            setPluginStatuses(statuses);
          } else {
            setPluginStatuses(prev => ({
              ...prev,
              [payload.pluginId]: payload.status
            }));
          }
        }
      } catch (err) {
        console.error('Failed to parse websocket message', err);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const togglePlugin = (id: string, active: boolean) => {
    ws.current?.send(JSON.stringify({
      type: 'command',
      action: 'manage_plugin',
      payload: { pluginId: id, action: active ? 'enable' : 'disable' }
    }));
  };

  const installPlugin = (id: string) => {
    ws.current?.send(JSON.stringify({
      type: 'command',
      action: 'manage_plugin',
      payload: { pluginId: id, action: 'install' }
    }));
  };

  return { plugins, pluginStatuses, togglePlugin, installPlugin };
}
