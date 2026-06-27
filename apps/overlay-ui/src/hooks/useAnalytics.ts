import { useState, useEffect, useRef } from 'react';
import { AnalyticsReportEvent } from '@obs-chat/event-schema';

export function useAnalytics(url: string) {
  const [report, setReport] = useState<AnalyticsReportEvent | null>(null);
  const [exportPath, setExportPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        ws.current?.send(JSON.stringify({
          type: 'handshake',
          protocol_version: 2
        }));

        // Request analytics on connect
        ws.current?.send(JSON.stringify({
          type: 'command',
          action: 'request_analytics',
          payload: {}
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'analytics_report') {
            setReport(data as AnalyticsReportEvent);
            setIsLoading(false);
          } else if (data.type === 'export_status' && data.status === 'success') {
            setExportPath(data.path);
          }
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };

      ws.current.onclose = () => {
        setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [url]);

  const requestAnalytics = (sessionId?: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'command',
        action: 'request_analytics',
        payload: { sessionId }
      }));
      setIsLoading(true);
    }
  };

  const exportSession = (sessionId?: string, format: 'csv' | 'timestamped_log' = 'csv') => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'command',
        action: 'export_session',
        payload: { sessionId, format, includeModeration: true }
      }));
    }
  };

  return {
    report,
    isLoading,
    exportPath,
    requestAnalytics,
    exportSession
  };
}
