import Database from 'better-sqlite3';
import { Platform } from '@obs-chat/event-schema';

export interface ViewerIdentity {
  id: string; // UUID
  displayName: string;
  reputationScore: number;
  createdAt: number;
  updatedAt: number;
}

export interface PlatformAccount {
  platform: Platform;
  platformUserId: string;
  identityId: string;
  platformUsername: string;
  linkedAt: number;
}

export class IdentityStore {
  private db: Database.Database;

  constructor(dbPath: string = 'identities.db') {
    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema() {
    this.db.pragma('journal_mode = WAL');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS viewer_identities (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        reputation_score REAL NOT NULL DEFAULT 1.0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS platform_accounts (
        platform TEXT NOT NULL,
        platform_user_id TEXT NOT NULL,
        platform_username TEXT NOT NULL,
        identity_id TEXT NOT NULL,
        linked_at INTEGER NOT NULL,
        PRIMARY KEY (platform, platform_user_id),
        FOREIGN KEY (identity_id) REFERENCES viewer_identities(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_platform_accounts_identity_id ON platform_accounts(identity_id);
    `);
  }

  // Identity CRUD
  public createIdentity(displayName: string): ViewerIdentity {
    const id = crypto.randomUUID();
    const now = Date.now();
    const stmt = this.db.prepare(
      `INSERT INTO viewer_identities (id, display_name, reputation_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    );
    stmt.run(id, displayName, 1.0, now, now);

    return {
      id,
      displayName,
      reputationScore: 1.0,
      createdAt: now,
      updatedAt: now
    };
  }

  public getIdentity(id: string): ViewerIdentity | null {
    const stmt = this.db.prepare('SELECT * FROM viewer_identities WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapIdentity(row);
  }

  public updateIdentityReputation(id: string, score: number): void {
    const stmt = this.db.prepare(
      'UPDATE viewer_identities SET reputation_score = ?, updated_at = ? WHERE id = ?'
    );
    stmt.run(score, Date.now(), id);
  }

  public deleteIdentity(id: string): void {
    const stmt = this.db.prepare('DELETE FROM viewer_identities WHERE id = ?');
    stmt.run(id);
  }

  public listIdentities(): ViewerIdentity[] {
    const stmt = this.db.prepare('SELECT * FROM viewer_identities ORDER BY updated_at DESC');
    return stmt.all().map((row: any) => this.mapIdentity(row));
  }

  // Account Linking
  public linkAccount(platform: Platform, platformUserId: string, platformUsername: string, identityId: string): void {
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO platform_accounts (platform, platform_user_id, platform_username, identity_id, linked_at)
       VALUES (?, ?, ?, ?, ?)`
    );
    stmt.run(platform, platformUserId, platformUsername, identityId, Date.now());
  }

  public unlinkAccount(platform: Platform, platformUserId: string): void {
    const stmt = this.db.prepare(
      'DELETE FROM platform_accounts WHERE platform = ? AND platform_user_id = ?'
    );
    stmt.run(platform, platformUserId);
  }

  public getAccountsForIdentity(identityId: string): PlatformAccount[] {
    const stmt = this.db.prepare('SELECT * FROM platform_accounts WHERE identity_id = ?');
    return stmt.all(identityId).map((row: any) => this.mapPlatformAccount(row));
  }

  public getIdentityByPlatformAccount(platform: Platform, platformUserId: string): ViewerIdentity | null {
    const stmt = this.db.prepare(`
      SELECT vi.* 
      FROM viewer_identities vi
      JOIN platform_accounts pa ON vi.id = pa.identity_id
      WHERE pa.platform = ? AND pa.platform_user_id = ?
    `);
    const row = stmt.get(platform, platformUserId) as any;
    if (!row) return null;
    return this.mapIdentity(row);
  }

  private mapIdentity(row: any): ViewerIdentity {
    return {
      id: row.id,
      displayName: row.display_name,
      reputationScore: row.reputation_score,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapPlatformAccount(row: any): PlatformAccount {
    return {
      platform: row.platform as Platform,
      platformUserId: row.platform_user_id,
      platformUsername: row.platform_username,
      identityId: row.identity_id,
      linkedAt: row.linked_at
    };
  }

  public close() {
    this.db.close();
  }
}

export * from './reputation';
export * from './suggestions';
export * from './roles';
