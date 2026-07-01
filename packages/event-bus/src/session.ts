import { StreamSession } from '@obs-chat/event-schema';
import { EventStore } from './store';
import { randomUUID } from 'crypto';

export class SessionManager {
  private store: EventStore;
  private currentSession: StreamSession | null = null;
  private maxCapacityEvents = 100000; // arbitrary high number for checking 80% capacity

  constructor(store: EventStore) {
    this.store = store;
  }

  public getActiveSession(): StreamSession | null {
    if (this.currentSession) return this.currentSession;

    // Check if there's a crashed or active session in DB (simplification: get latest session)
    const db = this.store.getDatabase();
    const row = db.prepare(`
      SELECT * FROM sessions 
      ORDER BY startedAt DESC LIMIT 1
    `).get() as any;

    if (row && (row.status === 'active' || row.status === 'crashed')) {
      this.currentSession = {
        ...row,
        platforms: JSON.parse(row.platforms)
      } as StreamSession;
      return this.currentSession;
    }

    return null;
  }

  public startSession(platforms: string[] = []): StreamSession {
    const active = this.getActiveSession();
    if (active) {
      if (active.status === 'active') {
        return active; // already active
      } else if (active.status === 'crashed') {
        // recover
        active.status = 'active';
        this.store.updateSession(active);
        return active;
      }
    }

    const newSession: StreamSession = {
      sessionId: randomUUID(),
      startedAt: new Date().toISOString(),
      endedAt: null,
      platforms: platforms as any,
      totalEvents: 0,
      lastSequenceNumber: 0,
      status: 'active',
    };

    this.store.createSession(newSession);
    this.currentSession = newSession;
    return newSession;
  }

  public clearSession(): void {
    this.currentSession = null;
  }

  public endSession(): void {
    if (this.currentSession) {
      this.currentSession.endedAt = new Date().toISOString();
      this.currentSession.status = 'ended';
      this.store.updateSession(this.currentSession);
      this.currentSession = null;
    }
  }

  public checkCapacity(): { isNearCapacity: boolean; percentage: number } {
    if (!this.currentSession) return { isNearCapacity: false, percentage: 0 };
    const percentage = (this.currentSession.totalEvents / this.maxCapacityEvents) * 100;
    return {
      isNearCapacity: percentage >= 80,
      percentage
    };
  }

  public enforceRetentionPolicy(days: number = 14): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString();

    const db = this.store.getDatabase();
    // find sessions older than cutoff and ended
    const oldSessions = db.prepare(`
      SELECT sessionId FROM sessions 
      WHERE endedAt < ? AND status = 'ended'
    `).all(cutoffStr) as { sessionId: string }[];

    let deletedCount = 0;
    for (const row of oldSessions) {
      db.prepare('DELETE FROM events WHERE sessionId = ?').run(row.sessionId);
      db.prepare('DELETE FROM stream_markers WHERE sessionId = ?').run(row.sessionId);
      db.prepare('DELETE FROM sessions WHERE sessionId = ?').run(row.sessionId);
      deletedCount++;
    }

    return deletedCount;
  }
}
