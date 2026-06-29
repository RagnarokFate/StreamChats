import { useState, useEffect, useRef } from 'react';

export function useOBS(wsUrl: string) {
  const [connected, setConnected] = useState(false);
  const [scenes, setScenes] = useState<string[]>([]);
  const [currentScene, setCurrentScene] = useState('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'obs_status') {
          setConnected(data.connected);
        } else if (data.type === 'obs_scenes') {
          setScenes(data.scenes);
          setCurrentScene(data.currentScene);
        } else if (data.type === 'obs_scene_changed') {
          setCurrentScene(data.sceneName);
        }
      } catch (err) {
        console.error('Failed to parse websocket message', err);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [wsUrl]);

  const connectOBS = (url: string, password?: string) => {
    ws.current?.send(JSON.stringify({
      type: 'command',
      action: 'obs_action',
      payload: { obsAction: 'connect', url, password }
    }));
  };

  const disconnectOBS = () => {
    ws.current?.send(JSON.stringify({
      type: 'command',
      action: 'obs_action',
      payload: { obsAction: 'disconnect' }
    }));
  };

  const setScene = (sceneName: string) => {
    ws.current?.send(JSON.stringify({
      type: 'command',
      action: 'obs_action',
      payload: { obsAction: 'set_scene', sceneName }
    }));
  };

  const getScenes = () => {
    ws.current?.send(JSON.stringify({
      type: 'command',
      action: 'obs_action',
      payload: { obsAction: 'get_scenes' }
    }));
  };

  return { connected, scenes, currentScene, connectOBS, disconnectOBS, setScene, getScenes };
}
