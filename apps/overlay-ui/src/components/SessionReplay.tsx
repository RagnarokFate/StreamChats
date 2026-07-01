import React, { useEffect, useState, useRef } from 'react';
import { StreamEvent } from '@obs-chat/event-schema';
import { UIMessage } from '../hooks/useChatFeed';

interface SessionReplayProps {
  wsUrl: string;
}

export function SessionReplay({ wsUrl }: SessionReplayProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [events, setEvents] = useState<(StreamEvent & { relativeTimeMs: number })[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  
  const [ws, setWs] = useState<WebSocket | null>(null);
  const playInterval = useRef<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = new WebSocket(wsUrl);
    setWs(socket);

    socket.onopen = () => {
      // Fetch list of all sessions first
      socket.send(JSON.stringify({
        type: 'command',
        action: 'get_sessions',
        payload: {}
      }));
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'command_response') {
          if (msg.action === 'sessions_list') {
            const list = msg.payload.sessions || [];
            setSessions(list);
            if (list.length > 0 && !selectedSessionId) {
              setSelectedSessionId(list[0].sessionId);
            } else if (list.length === 0) {
              setLoading(false);
            }
          } else if (msg.action === 'session_replay_data') {
            const replayEvents = msg.payload.events || [];
            setEvents(replayEvents);
            if (replayEvents.length > 0) {
              setDurationMs(replayEvents[replayEvents.length - 1].relativeTimeMs);
            } else {
              setDurationMs(0);
            }
            setLoading(false);
          } else if (msg.action === 'markers_list') {
            setMarkers(msg.payload.markers || []);
          } else if (msg.action === 'export_complete') {
            alert(`Export complete! Saved to ${msg.payload.filePath}`);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    return () => {
      socket.close();
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, [wsUrl]);

  // Fetch replay data when selected session changes
  useEffect(() => {
    if (ws && ws.readyState === WebSocket.OPEN && selectedSessionId) {
      setLoading(true);
      setPlaying(false);
      setCurrentTimeMs(0);
      setEvents([]);
      setMarkers([]);
      
      ws.send(JSON.stringify({
        type: 'command',
        action: 'fetch_session_replay',
        payload: { sessionId: selectedSessionId }
      }));
      
      ws.send(JSON.stringify({
        type: 'command',
        action: 'get_markers',
        payload: { sessionId: selectedSessionId }
      }));
    }
  }, [selectedSessionId, ws]);

  // Convert StreamEvent to UIMessage format
  const toUIMessage = (e: StreamEvent): UIMessage | null => {
    if (e.type === 'chat') {
      return { eventId: e.eventId, platform: e.platform as any, timestamp: e.timestamp, type: 'chat', author: e.author, text: e.message.text, fragments: e.message.fragments, isDeleted: false };
    } else if (e.type === 'gift') {
      return { eventId: e.eventId, platform: e.platform as any, timestamp: e.timestamp, type: 'gift', author: e.sender, giftType: e.giftType, giftCount: e.giftCount, isDeleted: false };
    } else if (e.type === 'superchat') {
      return { eventId: e.eventId, platform: e.platform as any, timestamp: e.timestamp, type: 'superchat', author: e.sender, amount: e.amount, currency: e.currency, message: e.message, isDeleted: false };
    } else if (e.type === 'moderation') {
      return { eventId: e.eventId, platform: e.platform as any, timestamp: e.timestamp, type: 'mod_action', author: { id: 'mod', name: 'System' }, action: e.action, targetUserId: e.targetUserId, isDeleted: false };
    }
    return null;
  };

  // Playback Loop
  useEffect(() => {
    if (!playing) {
      if (playInterval.current) {
        clearInterval(playInterval.current);
        playInterval.current = null;
      }
      return;
    }

    const intervalRate = 100; // ms
    playInterval.current = window.setInterval(() => {
      setCurrentTimeMs(prev => {
        let nextTime = prev + (intervalRate * playbackSpeed);
        if (nextTime >= durationMs) {
          nextTime = durationMs;
          setPlaying(false);
        }
        return nextTime;
      });
    }, intervalRate);

    return () => {
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, [playing, playbackSpeed, durationMs]);

  // Derive visible messages
  useEffect(() => {
    if (events.length === 0) return;
    const visibleEvents = events.filter(e => e.relativeTimeMs <= currentTimeMs);
    const newMessages = visibleEvents.map(toUIMessage).filter((m): m is UIMessage => m !== null);
    setMessages(newMessages);
  }, [currentTimeMs, events]);

  // Auto-scroll logic
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTimeMs(Number(e.target.value));
  };

  const handleSeekToRelative = (relMs: number) => {
    setCurrentTimeMs(relMs);
  };

  const handleDeleteSession = () => {
    if (ws && ws.readyState === WebSocket.OPEN && selectedSessionId) {
      if (confirm("Are you sure you want to permanently delete this session's VOD/replay and all its events?")) {
        ws.send(JSON.stringify({
          type: 'command',
          action: 'delete_session',
          payload: { sessionId: selectedSessionId }
        }));
        
        setSessions(prev => prev.filter(s => s.sessionId !== selectedSessionId));
        setSelectedSessionId('');
        setEvents([]);
        setMarkers([]);
      }
    }
  };

  const handleExport = () => {
    if (ws && ws.readyState === WebSocket.OPEN && selectedSessionId) {
      ws.send(JSON.stringify({
        type: 'command',
        action: 'export_session',
        payload: { sessionId: selectedSessionId, format: 'json' }
      }));
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  const platformColors: Record<string, string> = {
    twitch: '#9146FF',
    youtube: '#FF0000',
    kick: '#53FC18',
    tiktok: '#00F2FE'
  };

  if (loading && sessions.length === 0) {
    return <div style={{ padding: '24px', color: '#fff' }}>Loading Replay System...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          🎬 VOD Replay
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={selectedSessionId} 
            onChange={(e) => setSelectedSessionId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <option value="" disabled>Select a Session...</option>
            {sessions.map(s => (
              <option key={s.sessionId} value={s.sessionId}>
                {new Date(s.startedAt).toLocaleString()} ({s.totalEvents} events)
              </option>
            ))}
          </select>
          <button onClick={handleExport} disabled={!selectedSessionId} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: '0.2s' }}>
            📥 Export Log
          </button>
          <button onClick={handleDeleteSession} disabled={!selectedSessionId} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '4px', cursor: 'pointer' }}>
            🗑️ Delete VOD
          </button>
        </div>
      </div>
      
      {/* Chat Replay Area */}
      <div 
        ref={chatContainerRef}
        style={{ 
          background: 'rgba(20,20,20,0.6)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          flex: 1, 
          borderRadius: '12px', 
          overflowY: 'auto', 
          padding: '20px', 
          marginBottom: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }}
      >
        {events.length === 0 && !loading && <div style={{ color: '#666', margin: 'auto' }}>No events in this VOD.</div>}
        {loading && events.length === 0 && <div style={{ color: '#aaa', margin: 'auto' }}>Loading VOD Events...</div>}
        
        {messages.map((msg, index) => {
          const pColor = platformColors[msg.platform] || '#3b82f6';
          return (
            <div 
              key={`${msg.eventId}-${index}`} 
              style={{ 
                padding: '12px 16px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '8px',
                borderLeft: `4px solid ${pColor}`,
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: pColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {msg.platform}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#eee' }}>{msg.author.name}</span>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: 'auto' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.4' }}>
                {msg.type === 'chat' && (msg as any).text}
                {msg.type === 'gift' && <span style={{ color: '#fbbf24' }}>🎁 Sent {(msg as any).giftCount} {(msg as any).giftType}</span>}
                {msg.type === 'superchat' && <span style={{ color: '#10b981', fontWeight: 'bold' }}>💵 Superchat: {(msg as any).amount} {(msg as any).currency} - {(msg as any).message}</span>}
                {(msg.type as string) === 'mod_action' && <span style={{ color: '#ef4444' }}>🛡️ Mod Action: {(msg as any).action} on {(msg as any).targetUserId}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Playback Controls & Timeline */}
      <div style={{ background: 'rgba(20,20,20,0.8)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Custom Timeline with Markers */}
        <div style={{ position: 'relative', height: '30px', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '60px', fontSize: '13px', color: '#aaa', fontFamily: 'monospace' }}>{formatTime(currentTimeMs)}</span>
          
          <div style={{ flex: 1, position: 'relative', margin: '0 16px', height: '100%', display: 'flex', alignItems: 'center' }}>
            {/* The Native Range Input acts as the base */}
            <input 
              type="range" 
              min="0" 
              max={durationMs} 
              value={currentTimeMs} 
              onChange={handleSeek}
              style={{ 
                width: '100%', 
                zIndex: 2, 
                position: 'relative', 
                opacity: 0.7,
                cursor: 'pointer'
              }}
            />
            
            {/* Markers Overlay */}
            {events.length > 0 && markers.map(marker => {
              // We need to calculate the relative position of the marker
              // Find the event closest to the marker's timestamp
              const markerTime = new Date(marker.time).getTime();
              const firstEventTime = new Date(events[0].timestamp).getTime();
              const relativeMarkerMs = Math.max(0, markerTime - firstEventTime);
              
              if (relativeMarkerMs > durationMs) return null; // Outside bounds
              
              const percent = (relativeMarkerMs / durationMs) * 100;
              
              return (
                <div 
                  key={marker.id}
                  title={`Marker: ${marker.label || 'Unnamed'}\nClick to jump`}
                  onClick={() => handleSeekToRelative(relativeMarkerMs)}
                  style={{
                    position: 'absolute',
                    left: `${percent}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    background: '#fbbf24',
                    borderRadius: '50%',
                    border: '2px solid #000',
                    zIndex: 3,
                    cursor: 'pointer',
                    boxShadow: '0 0 8px rgba(251,191,36,0.5)'
                  }}
                />
              );
            })}
          </div>

          <span style={{ width: '60px', fontSize: '13px', color: '#aaa', textAlign: 'right', fontFamily: 'monospace' }}>{formatTime(durationMs)}</span>
        </div>
        
        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={() => setPlaying(!playing)} 
            disabled={events.length === 0}
            style={{ 
              padding: '10px 32px', 
              background: playing ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', 
              color: playing ? '#ef4444' : '#10b981', 
              border: `1px solid ${playing ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`, 
              borderRadius: '8px', 
              cursor: events.length > 0 ? 'pointer' : 'not-allowed', 
              fontWeight: 'bold', 
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          
          <select 
            value={playbackSpeed} 
            onChange={e => setPlaybackSpeed(Number(e.target.value))} 
            style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          >
            <option value={0.5}>0.5x Speed</option>
            <option value={1}>1.0x Speed</option>
            <option value={2}>2.0x Speed</option>
            <option value={5}>5.0x Speed</option>
            <option value={10}>10.0x Speed</option>
          </select>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
