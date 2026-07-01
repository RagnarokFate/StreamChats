import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface AnalyticsPanelProps {
  wsUrl: string;
}

export function AnalyticsPanel({ wsUrl }: AnalyticsPanelProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(wsUrl);
    setWs(socket);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'command',
        action: 'request_analytics',
        payload: {}
      }));
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'command_response' && msg.action === 'analytics_report') {
          setData(msg.payload);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
      }
    };

    return () => {
      socket.close();
    };
  }, [wsUrl]);

  if (loading) {
    return <div style={{ padding: '24px', color: '#fff' }}>Loading analytics...</div>;
  }

  if (!data || !data.report) {
    return <div style={{ padding: '24px', color: '#fff' }}>No analytics data available for this session.</div>;
  }

  const { report, summary } = data;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const platformData = Object.keys(report.metrics.platformShare).map(key => ({
    name: key,
    value: report.metrics.platformShare[key]
  }));

  const handleExport = (format: 'csv' | 'timestamped_log') => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'command',
        action: 'export_session',
        payload: { format }
      }));
      alert(`Export requested as ${format.toUpperCase()}. Check the local server's 'exports' folder.`);
    }
  };

  const handleReset = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (confirm("Are you sure you want to reset all analytics and stats for this session?")) {
        ws.send(JSON.stringify({
          type: 'command',
          action: 'reset_stats',
          payload: {}
        }));
        alert("Session statistics have been reset.");
        // Request fresh data
        ws.send(JSON.stringify({
          type: 'command',
          action: 'request_analytics',
          payload: {}
        }));
      }
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Session Analytics</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => handleExport('csv')} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Export CSV
          </button>
          <button onClick={() => handleExport('timestamped_log')} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Export Log
          </button>
          <button onClick={handleReset} style={{ padding: '8px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Reset Stats
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, color: '#9ca3af' }}>Total Messages</h4>
          <p style={{ fontSize: '2rem', margin: '8px 0 0 0', fontWeight: 'bold' }}>{summary.totalMessages}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, color: '#9ca3af' }}>Unique Chatters</h4>
          <p style={{ fontSize: '2rem', margin: '8px 0 0 0', fontWeight: 'bold' }}>{summary.totalUniqueChatters}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, color: '#9ca3af' }}>Peak Msg/Min</h4>
          <p style={{ fontSize: '2rem', margin: '8px 0 0 0', fontWeight: 'bold' }}>{summary.peakMessagesPerMinute}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, color: '#9ca3af' }}>Duration (Mins)</h4>
          <p style={{ fontSize: '2rem', margin: '8px 0 0 0', fontWeight: 'bold' }}>{summary.durationMinutes}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px' }}>Messages per Minute</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.metrics.messagesPerMinute}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelFormatter={(val) => new Date(val).toLocaleTimeString()}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px' }}>Platform Share</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {platformData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: COLORS[index % COLORS.length], borderRadius: '2px' }} />
                  <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '16px' }}>Top Chatters</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.metrics.topChatters} layout="vertical" margin={{ left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="messageCount" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
