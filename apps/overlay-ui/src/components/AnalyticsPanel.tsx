import React, { useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

interface AnalyticsPanelProps {
  wsUrl: string;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ wsUrl }) => {
  const { report, isLoading, exportPath, requestAnalytics, exportSession } = useAnalytics(wsUrl);

  useEffect(() => {
    // Initial request is handled by the hook itself when it connects
    const interval = setInterval(() => {
      requestAnalytics();
    }, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, [requestAnalytics]);

  if (isLoading && !report) {
    return <div className="panel loading">Loading analytics...</div>;
  }

  if (!report) {
    return <div className="panel error">Failed to load analytics report.</div>;
  }

  const maxMessages = Math.max(...report.metrics.messagesPerMinute.map(m => m.count), 1);
  const platforms = Object.keys(report.metrics.platformShare);
  const totalMessages = Object.values(report.metrics.platformShare).reduce((a, b) => a + b, 0);

  return (
    <div className="panel analytics-panel">
      <h2>Session Analytics</h2>
      
      <div className="analytics-actions">
        <button className="btn btn-secondary" onClick={() => exportSession(report.sessionId, 'csv')}>
          Export CSV
        </button>
        <button className="btn btn-secondary" onClick={() => exportSession(report.sessionId, 'timestamped_log')}>
          Export VOD JSON
        </button>
      </div>

      {exportPath && <div className="export-status">Exported to: {exportPath}</div>}

      <div className="analytics-grid">
        <div className="card">
          <h3>Peak Engagement</h3>
          {report.metrics.peakEngagement ? (
            <div className="metric">
              <span className="value">{report.metrics.peakEngagement.rate} msg/min</span>
              <span className="label">
                at {new Date(report.metrics.peakEngagement.startTime).toLocaleTimeString()}
              </span>
            </div>
          ) : (
            <div className="metric empty">Not enough data</div>
          )}
        </div>

        <div className="card">
          <h3>Total Messages</h3>
          <div className="metric">
            <span className="value">{totalMessages}</span>
          </div>
        </div>
      </div>

      <h3>Messages Per Minute</h3>
      <div className="chart-container timeline-chart">
        {report.metrics.messagesPerMinute.map((bucket, index) => {
          const height = `${(bucket.count / maxMessages) * 100}%`;
          return (
            <div key={index} className="bar-wrapper" title={`${bucket.count} messages at ${new Date(bucket.timestamp).toLocaleTimeString()}`}>
              <div className="bar" style={{ height }}></div>
              <div className="bar-label">{new Date(bucket.timestamp).getMinutes()}</div>
            </div>
          );
        })}
      </div>

      <div className="analytics-row">
        <div className="card half">
          <h3>Platform Share</h3>
          <ul className="platform-share-list">
            {platforms.map(platform => {
              const count = report.metrics.platformShare[platform as keyof typeof report.metrics.platformShare] || 0;
              const pct = Math.round((count / totalMessages) * 100);
              return (
                <li key={platform}>
                  <span className="platform-name">{platform}</span>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="platform-count">{count} ({pct}%)</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card half">
          <h3>Top Chatters</h3>
          <ul className="top-chatters-list">
            {report.metrics.topChatters.map((chatter, i) => (
              <li key={i}>
                <span className="chatter-name">{chatter.name} <small>({chatter.platform})</small></span>
                <span className="chatter-count">{chatter.messageCount} msgs</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
