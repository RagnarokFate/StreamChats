import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { z } from 'zod';
import { PersistedEvent, StreamSession, StreamMarker } from '@obs-chat/event-schema';

export class EventStore {
  private db: Database.Database;

  constructor(dbPath: string = ':memory:') {
    if (dbPath !== ':memory:') {
      const dir = join(dbPath, '..');
      try {
        mkdirSync(dir, { recursive: true });
      } catch (e) {
        // ignore
      }
    }
    
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.initializeTables();
  }

  private initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sessionId TEXT PRIMARY KEY,
        startedAt TEXT NOT NULL,
        endedAt TEXT,
        platforms TEXT NOT NULL, -- JSON array
        totalEvents INTEGER DEFAULT 0,
        lastSequenceNumber INTEGER DEFAULT 0,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS events (
        sequenceNumber INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId TEXT UNIQUE NOT NULL,
        sessionId TEXT NOT NULL,
        type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        payload TEXT NOT NULL, -- JSON payload
        FOREIGN KEY(sessionId) REFERENCES sessions(sessionId)
      );

      CREATE TABLE IF NOT EXISTS stream_markers (
        markerId TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        label TEXT,
        sequenceNumber INTEGER,
        FOREIGN KEY(sessionId) REFERENCES sessions(sessionId)
      );



      CREATE INDEX IF NOT EXISTS idx_events_session ON events(sessionId);
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
    `);
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  public persistEvent(sessionId: string, type: string, eventId: string, timestamp: string, payload: any): number {
    const stmt = this.db.prepare(`
      INSERT INTO events (eventId, sessionId, type, timestamp, payload) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(eventId, sessionId, type, timestamp, JSON.stringify(payload));
    
    // Update session metrics
    this.db.prepare(`
      UPDATE sessions 
      SET totalEvents = totalEvents + 1, lastSequenceNumber = ? 
      WHERE sessionId = ?
    `).run(info.lastInsertRowid, sessionId);

    return info.lastInsertRowid as number;
  }

  public getEventsAfter(sequenceNumber: number, limit: number = 1000): PersistedEvent[] {
    const stmt = this.db.prepare(`
      SELECT sequenceNumber, sessionId, payload 
      FROM events 
      WHERE sequenceNumber > ? 
      ORDER BY sequenceNumber ASC 
      LIMIT ?
    `);
    
    const rows = stmt.all(sequenceNumber, limit) as any[];
    return rows.map(row => {
      const parsed = JSON.parse(row.payload);
      return {
        ...parsed,
        sequenceNumber: row.sequenceNumber,
        sessionId: row.sessionId
      } as PersistedEvent;
    });
  }

  public getSession(sessionId: string): StreamSession | null {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE sessionId = ?');
    const row = stmt.get(sessionId) as any;
    if (!row) return null;
    return {
      ...row,
      platforms: JSON.parse(row.platforms)
    } as StreamSession;
  }

  public createSession(session: StreamSession): void {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (sessionId, startedAt, endedAt, platforms, totalEvents, lastSequenceNumber, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      session.sessionId,
      session.startedAt,
      session.endedAt,
      JSON.stringify(session.platforms),
      session.totalEvents,
      session.lastSequenceNumber,
      session.status
    );
  }

  public updateSession(session: StreamSession): void {
    const stmt = this.db.prepare(`
      UPDATE sessions 
      SET endedAt = ?, status = ?, totalEvents = ?, lastSequenceNumber = ?
      WHERE sessionId = ?
    `);
    stmt.run(
      session.endedAt,
      session.status,
      session.totalEvents,
      session.lastSequenceNumber,
      session.sessionId
    );
  }

  public getEventsBySession(sessionId: string): any[] {
    const stmt = this.db.prepare('SELECT * FROM events WHERE sessionId = ? ORDER BY sequenceNumber ASC');
    return stmt.all(sessionId) as any[];
  }

  public getEventCountByPlatform(sessionId: string): Record<string, number> {
    const stmt = this.db.prepare("SELECT json_extract(payload, '$.platform') as platform, COUNT(*) as count FROM events WHERE sessionId = ? GROUP BY json_extract(payload, '$.platform')");
    const rows = stmt.all(sessionId) as any[];
    const result: Record<string, number> = {};
    for (const row of rows) {
      if (row.platform) {
        result[row.platform] = row.count;
      }
    }
    return result;
  }

  public getEventCountByType(sessionId: string): Record<string, number> {
    const stmt = this.db.prepare('SELECT type, COUNT(*) as count FROM events WHERE sessionId = ? GROUP BY type');
    const rows = stmt.all(sessionId) as any[];
    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.type] = row.count;
    }
    return result;
  }
  
  public close() {
    this.db.close();
  }
}
