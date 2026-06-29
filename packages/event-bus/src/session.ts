import { EventBusStore } from './store';
import crypto from 'crypto';

/**
 * StreamSession lifecycle manager.
 * Handles session creation, ending, and crash detection on startup.
 */
export class StreamSessionManager {
  private store: EventBusStore;
  private currentSessionId: string | null = null;
  private retentionDays: number;
  private retentionTimer: ReturnType<typeof setInterval> | null = null;

  constructor(store: EventBusStore, retentionDays: number = 14) {
    this.store = store;
    this.retentionDays = retentionDays;
  }

  /**
   * Initialize session management on startup.
   * Detects crashed sessions and creates a new active session.
   */
  initialize(platforms: string[]): string {
    // Step 1: Detect and mark any crashed sessions (active sessions from a previous run)
    const crashedCount = this.store.markCrashedSessions();
    if (crashedCount > 0) {
      console.log(`[SessionManager] Detected ${crashedCount} crashed session(s) from previous run`);
    }

    // Step 2: Create a new session
    const sessionId = crypto.randomUUID();
    this.store.createSession(sessionId, platforms);
    this.currentSessionId = sessionId;
    console.log(`[SessionManager] Created new session: ${sessionId}`);

    // Step 3: Run initial retention cleanup
    this.runRetentionCleanup();

    // Step 4: Schedule hourly retention cleanup
    this.retentionTimer = setInterval(() => {
      this.runRetentionCleanup();
    }, 60 * 60 * 1000); // 1 hour

    return sessionId;
  }

  /**
   * Get the current active session ID.
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * End the current session gracefully.
   */
  endCurrentSession(): void {
    if (this.currentSessionId) {
      this.store.endSession(this.currentSessionId);
      console.log(`[SessionManager] Ended session: ${this.currentSessionId}`);
      this.currentSessionId = null;
    }
  }

  /**
   * Delete sessions older than the retention period.
   * Runs on startup and hourly thereafter.
   */
  private runRetentionCleanup(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    const cutoffIso = cutoffDate.toISOString();

    const deletedCount = this.store.deleteSessionsBefore(cutoffIso);
    if (deletedCount > 0) {
      console.log(`[SessionManager] Retention cleanup: deleted ${deletedCount} session(s) older than ${this.retentionDays} days`);
    }

    // Check disk usage warning
    const sizeBytes = this.store.getDatabaseSizeBytes();
    const maxBytes = 2 * 1024 * 1024 * 1024; // 2GB default
    const usagePercent = (sizeBytes / maxBytes) * 100;
    if (usagePercent >= 80) {
      console.warn(`[SessionManager] WARNING: Database at ${usagePercent.toFixed(1)}% capacity (${(sizeBytes / 1024 / 1024).toFixed(1)}MB / ${(maxBytes / 1024 / 1024).toFixed(0)}MB)`);
    }
  }

  /**
   * Clean up resources on shutdown.
   */
  destroy(): void {
    if (this.retentionTimer) {
      clearInterval(this.retentionTimer);
      this.retentionTimer = null;
    }
    this.endCurrentSession();
  }
}
