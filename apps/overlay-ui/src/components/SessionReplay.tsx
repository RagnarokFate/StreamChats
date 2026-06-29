import React, { useState, useEffect, useRef } from 'react';

interface VODEvent {
  type: string;
  timestamp: string;
  relativeTimeMs: number;
  platform: string;
  author?: { id: string; name: string };
  message?: { text: string };
  // ... other fields
}

export const SessionReplay: React.FC = () => {
  const [events, setEvents] = useState<VODEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [visibleEvents, setVisibleEvents] = useState<VODEvent[]>([]);
  const lastUpdateRef = useRef<number>(Date.now());
  const requestRef = useRef<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) {
            // Sort by relative time just in case
            data.sort((a, b) => a.relativeTimeMs - b.relativeTimeMs);
            setEvents(data);
            setCurrentTimeMs(0);
            setVisibleEvents([]);
            setIsPlaying(false);
          }
        } catch (err) {
          console.error("Failed to parse VOD file");
        }
      };
      reader.readAsText(file);
    }
  };

  const updatePlayback = () => {
    if (isPlaying) {
      const now = Date.now();
      const delta = (now - lastUpdateRef.current) * playbackSpeed;
      lastUpdateRef.current = now;

      setCurrentTimeMs((prev) => {
        const nextTime = prev + delta;
        
        // Update visible events
        // This is not highly optimized, but sufficient for small/medium sessions
        setVisibleEvents(events.filter(e => e.relativeTimeMs <= nextTime).slice(-50));

        // Stop if we reached the end
        if (events.length > 0 && nextTime >= events[events.length - 1].relativeTimeMs) {
          setIsPlaying(false);
          return events[events.length - 1].relativeTimeMs;
        }
        
        return nextTime;
      });
    }
    requestRef.current = requestAnimationFrame(updatePlayback);
  };

  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = Date.now();
    }
    requestRef.current = requestAnimationFrame(updatePlayback);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, events, playbackSpeed]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const maxTime = events.length > 0 ? events[events.length - 1].relativeTimeMs : 0;

  return (
    <div className="panel session-replay">
      <h2>Session Replay</h2>
      
      {!events.length ? (
        <div className="upload-section">
          <label className="btn btn-primary">
            Load VOD JSON File
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      ) : (
        <div className="replay-controls">
          <div className="playback-bar">
            <input 
              type="range" 
              min="0" 
              max={maxTime} 
              value={currentTimeMs} 
              onChange={(e) => setCurrentTimeMs(Number(e.target.value))}
              className="scrubber"
            />
            <div className="time-display">
              {formatTime(currentTimeMs)} / {formatTime(maxTime)}
            </div>
          </div>
          
          <div className="playback-actions">
            <button className="btn btn-primary" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setCurrentTimeMs(0); setVisibleEvents([]); }}>
              Restart
            </button>
            <select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(Number(e.target.value))}>
              <option value={1}>1x Speed</option>
              <option value={2}>2x Speed</option>
              <option value={5}>5x Speed</option>
            </select>
          </div>
        </div>
      )}

      <div className="replay-feed">
        {visibleEvents.map((ev, i) => (
          <div key={i} className="replay-message">
            <span className={`platform-badge ${ev.platform}`}>{ev.platform}</span>
            <span className="author">{ev.author?.name || 'System'}</span>
            <span className="text">{ev.message?.text || ev.type}</span>
          </div>
        ))}
        {visibleEvents.length === 0 && events.length > 0 && (
          <div className="empty-feed">No events yet...</div>
        )}
      </div>
    </div>
  );
};
