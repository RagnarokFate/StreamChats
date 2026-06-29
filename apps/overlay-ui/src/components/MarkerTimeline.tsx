import React, { useState } from 'react';
import { CommandEventV2 } from '@obs-chat/event-schema';

interface MarkerTimelineProps {
  sendCommand: (command: CommandEventV2) => void;
}

export function MarkerTimeline({ sendCommand }: MarkerTimelineProps) {
  const [label, setLabel] = useState('');
  const [placedMarkers, setPlacedMarkers] = useState<{ id: string, label: string, time: string }[]>([]);

  const handlePlaceMarker = (e: React.FormEvent) => {
    e.preventDefault();
    
    sendCommand({
      type: 'command',
      action: 'place_marker',
      payload: { label: label.trim() || undefined }
    });

    const newMarker = {
      id: Math.random().toString(36).substring(7),
      label: label.trim() || 'Unnamed Marker',
      time: new Date().toLocaleTimeString()
    };

    setPlacedMarkers(prev => [newMarker, ...prev]);
    setLabel('');
  };

  return (
    <div className="marker-timeline" style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px' }}>📍 Stream Markers</h2>
      <p style={{ color: '#aaa', marginBottom: '24px' }}>
        Place markers on the stream timeline to easily find important moments later during VOD review.
      </p>

      <form onSubmit={handlePlaceMarker} style={{ 
        background: 'rgba(255,255,255,0.05)', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <input 
          type="text" 
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Marker description (optional)"
          style={{
            flex: 1,
            padding: '10px 16px',
            background: '#222',
            border: '1px solid #444',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '1rem'
          }}
        />
        <button type="submit" style={{
          padding: '10px 24px',
          background: '#007acc',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Place Marker
        </button>
      </form>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Recent Markers</h3>
        
        {placedMarkers.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>No markers placed in this session yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {placedMarkers.map(marker => (
              <li key={marker.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '12px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                borderLeft: '4px solid #007acc'
              }}>
                <span style={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.9rem' }}>{marker.time}</span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{marker.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
