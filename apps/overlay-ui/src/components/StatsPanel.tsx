import { StatusUpdateEvent, CommandEvent } from '@obs-chat/event-schema';

interface StatsPanelProps {
  statusUpdate: StatusUpdateEvent | null;
  sendCommand: (command: CommandEvent) => void;
}

export function StatsPanel({ statusUpdate, sendCommand }: StatsPanelProps) {
  if (!statusUpdate) {
    return <div>Waiting for statistics data...</div>;
  }

  const { statistics } = statusUpdate;
  const totalMsgs = statistics.reduce((acc, s) => acc + s.totalMessages, 0);
  const totalChatters = statistics.reduce((acc, s) => acc + s.uniqueChatters, 0);
  const totalMpm = statistics.reduce((acc, s) => acc + s.messagesPerMinute, 0);

  const handleReset = () => {
    sendCommand({
      type: 'command',
      action: 'reset_stats',
      payload: {}
    });
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>📊 Stream Statistics</h2>
        <button 
          onClick={handleReset}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          🔄 Reset Stats
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '8px' }}>Total Messages</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalMsgs}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '8px' }}>Unique Chatters</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalChatters}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '8px' }}>Messages / Min</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalMpm}</div>
        </div>
      </div>

      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Per-Platform Breakdown</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {statistics.map(stat => (
          <div key={stat.platform} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize' }}>{stat.platform}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#aaa' }}>Messages</span>
              <span>{stat.totalMessages}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#aaa' }}>Chatters</span>
              <span>{stat.uniqueChatters}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>Msg/Min</span>
              <span>{stat.messagesPerMinute}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
