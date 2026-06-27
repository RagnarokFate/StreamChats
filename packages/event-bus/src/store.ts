import Database from 'better-sqlite3';
import path from 'path';
import { StreamEvent, StreamEventType } from '@obs-chat/event-schema';
import crypto from 'crypto';

/**
 * SQLite storage layer for the Event Bus.
 * Uses WAL mode for concurrent read/write access.
 */
export class EventBusStore {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const resolvedPath = dbPath || path.resolve(process.cwd(), 'data', 'streamchats.db');
    // Ensure data directory exists
    const dir = path.dirname(resolvedPath);
    const fs = require('fs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(resolvedPath);

    // Enable WAL mode for concurrent reads during writes
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000'); // 64MB cache
    this.db.pragma('temp_store = memory');

    this.createTables();
  }

  private createTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS stream_sessions (
        session_id TEXT PRIMARY KEY,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        platforms TEXT NOT NULL DEFAULT '[]',
        total_events INTEGER NOT NULL DEFAULT 0,
        last_sequence_number INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active'
          CHECK (status IN ('active', 'ended', 'crashed'))
      );

      CREATE TABLE IF NOT EXISTS stream_events (
        sequence_number INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT UNIQUE NOT NULL,
        session_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        payload TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES stream_sessions(session_id)
      );

      CREATE INDEX IF NOT EXISTS idx_events_session ON stream_events(session_id);
      CREATE INDEX IF NOT EXISTS idx_events_type ON stream_events(type);
      CREATE INDEX IF NOT EXISTS idx_events_platform ON stream_events(platform);
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON stream_events(timestamp);

      CREATE TABLE IF NOT EXISTS consumer_offsets (
        consumer_id TEXT PRIMARY KEY,
        last_sequence_number INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS stream_markers (
        marker_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        label TEXT,
        sequence_number INTEGER,
        FOREIGN KEY (session_id) REFERENCES stream_sessions(session_id)
      );
    `);
  }

  // ── Session Operations ───────────────────────────────────────────────────

  createSession(sessionId: string, platforms: string[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO stream_sessions (session_id, started_at, platforms, status)
      VALUES (?, ?, ?, 'active')
    `);
    stmt.run(sessionId, new Date().toISOString(), JSON.stringify(platforms));
  }

  endSession(sessionId: string): void {
    const stmt = this.db.prepare(`
      UPDATE stream_sessions SET ended_at = ?, status = 'ended'
      WHERE session_id = ? AND status = 'active'
    `);
    stmt.run(new Date().toISOString(), sessionId);
  }

  getActiveSession(): { session_id: string; started_at: string; platforms: string; total_events: number; last_sequence_number: number } | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM stream_sessions WHERE status = 'active' ORDER BY started_at DESC LIMIT 1
    `);
    return stmt.get() as any;
  }

  markCrashedSessions(): number {
    const stmt = this.db.prepare(`
      UPDATE stream_sessions SET status = 'crashed'
      WHERE status = 'active'
    `);
    const result = stmt.run();
    return result.changes;
  }

  getSession(sessionId: string): any {
    const stmt = this.db.prepare(`SELECT * FROM stream_sessions WHERE session_id = ?`);
    return stmt.get(sessionId);
  }

  getAllSessions(): any[] {
    const stmt = this.db.prepare(`SELECT * FROM stream_sessions ORDER BY started_at DESC`);
    return stmt.all();
  }

  updateSessionEventCount(sessionId: string, sequenceNumber: number): void {
    const stmt = this.db.prepare(`
      UPDATE stream_sessions
      SET total_events = total_events + 1, last_sequence_number = ?
      WHERE session_id = ?
    `);
    stmt.run(sequenceNumber, sessionId);
  }

  // ── Event Operations ─────────────────────────────────────────────────────

  /**
   * Persist an event and return the assigned sequence number.
   * This is the core "persist-first" operation of the Event Bus.
   */
  persistEvent(event: StreamEvent, sessionId: string): number {
    const stmt = this.db.prepare(`
      INSERT INTO stream_events (event_id, session_id, platform, type, timestamp, payload)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      event.eventId,
      sessionId,
      event.platform,
      event.type,
      event.timestamp,
      JSON.stringify(event)
    );

    const sequenceNumber = Number(result.lastInsertRowid);

    // Update session event count
    this.updateSessionEventCount(sessionId, sequenceNumber);

    return sequenceNumber;
  }

  /**
   * Retrieve events from a given sequence number for replay/catch-up.
   */
  getEventsFrom(fromSequenceNumber: number, filter?: StreamEventType[], limit: number = 1000): Array<{ sequence_number: number; payload: string }> {
    let sql = `
      SELECT sequence_number, payload FROM stream_events
      WHERE sequence_number > ?
    `;
    const params: any[] = [fromSequenceNumber];

    if (filter && filter.length > 0) {
      const placeholders = filter.map(() => '?').join(', ');
      sql += ` AND type IN (${placeholders})`;
      params.push(...filter);
    }

    sql += ` ORDER BY sequence_number ASC LIMIT ?`;
    params.push(limit);

    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as any[];
  }

  getLatestSequenceNumber(): number {
    const stmt = this.db.prepare(`
      SELECT MAX(sequence_number) as max_seq FROM stream_events
    `);
    const result = stmt.get() as any;
    return result?.max_seq || 0;
  }

  getEventById(eventId: string): any {
    const stmt = this.db.prepare(`SELECT * FROM stream_events WHERE event_id = ?`);
    return stmt.get(eventId);
  }

  // ── Consumer Offset Operations ───────────────────────────────────────────

  getOffset(consumerId: string): number | null {
    const stmt = this.db.prepare(`
      SELECT last_sequence_number FROM consumer_offsets WHERE consumer_id = ?
    `);
    const result = stmt.get(consumerId) as any;
    return result ? result.last_sequence_number : null;
  }

  setOffset(consumerId: string, sequenceNumber: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO consumer_offsets (consumer_id, last_sequence_number, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(consumer_id) DO UPDATE SET
        last_sequence_number = excluded.last_sequence_number,
        updated_at = excluded.updated_at
    `);
    stmt.run(consumerId, sequenceNumber, new Date().toISOString());
  }

  // ── Marker Operations ────────────────────────────────────────────────────

  createMarker(sessionId: string, label?: string): string {
    const markerId = crypto.randomUUID();
    const latestSeq = this.getLatestSequenceNumber();
    const stmt = this.db.prepare(`
      INSERT INTO stream_markers (marker_id, session_id, timestamp, label, sequence_number)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(markerId, sessionId, new Date().toISOString(), label || null, latestSeq);
    return markerId;
  }

  getMarkers(sessionId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM stream_markers WHERE session_id = ? ORDER BY timestamp ASC
    `);
    return stmt.all(sessionId);
  }

  // ── Retention / Cleanup ──────────────────────────────────────────────────

  deleteSessionsBefore(cutoffDate: string): number {
    // Delete events for old sessions first, then sessions
    const deleteEvents = this.db.prepare(`
      DELETE FROM stream_events WHERE session_id IN (
        SELECT session_id FROM stream_sessions WHERE started_at < ? AND status != 'active'
      )
    `);
    const deleteSessions = this.db.prepare(`
      DELETE FROM stream_sessions WHERE started_at < ? AND status != 'active'
    `);
    const deleteMarkers = this.db.prepare(`
      DELETE FROM stream_markers WHERE session_id IN (
        SELECT session_id FROM stream_sessions WHERE started_at < ? AND status != 'active'
      )
    `);

    const transaction = this.db.transaction(() => {
      deleteMarkers.run(cutoffDate);
      deleteEvents.run(cutoffDate);
      const result = deleteSessions.run(cutoffDate);
      return result.changes;
    });

    const deleted = transaction();
    // Reclaim space
    this.db.pragma('incremental_vacuum');
    return deleted;
  }

  getDatabaseSizeBytes(): number {
    const pageCount = (this.db.pragma('page_count', { simple: true }) as number);
    const pageSize = (this.db.pragma('page_size', { simple: true }) as number);
    return pageCount * pageSize;
  }

  // ── Query Helpers (for analytics) ────────────────────────────────────────

  getEventsBySession(sessionId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM stream_events WHERE session_id = ? ORDER BY sequence_number ASC
    `);
    return stmt.all(sessionId);
  }

  getEventCountByPlatform(sessionId: string): Record<string, number> {
    const stmt = this.db.prepare(`
      SELECT platform, COUNT(*) as count FROM stream_events
      WHERE session_id = ?
      GROUP BY platform
    `);
    const rows = stmt.all(sessionId) as any[];
    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.platform] = row.count;
    }
    return result;
  }

  getEventCountByType(sessionId: string): Record<string, number> {
    const stmt = this.db.prepare(`
      SELECT type, COUNT(*) as count FROM stream_events
      WHERE session_id = ?
      GROUP BY type
    `);
    const rows = stmt.all(sessionId) as any[];
    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.type] = row.count;
    }
    return result;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  close(): void {
    this.db.close();
  }
}
