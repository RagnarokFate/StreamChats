export interface SyncMetadata {
  lastUpdated: string;
  deviceId: string;
  version: number;
}

export interface SyncConflict<T> {
  local: { data: T; meta: SyncMetadata };
  remote: { data: T; meta: SyncMetadata };
}

export interface ResolutionResult<T> {
  resolvedData: T;
  resolvedMeta: SyncMetadata;
  wasConflict: boolean;
  winner: 'local' | 'remote' | 'none';
}

export class ConflictResolver {
  private conflictLog: any[] = [];

  /**
   * Resolves a conflict using a Last-Write-Wins (LWW) strategy.
   */
  resolveLWW<T>(local: { data: T; meta: SyncMetadata }, remote: { data: T; meta: SyncMetadata } | null): ResolutionResult<T> {
    if (!remote) {
      return { resolvedData: local.data, resolvedMeta: local.meta, wasConflict: false, winner: 'local' };
    }

    const localTime = new Date(local.meta.lastUpdated).getTime();
    const remoteTime = new Date(remote.meta.lastUpdated).getTime();

    // If perfectly synchronized (same version, same device, etc)
    if (localTime === remoteTime && local.meta.version === remote.meta.version) {
      return { resolvedData: local.data, resolvedMeta: local.meta, wasConflict: false, winner: 'none' };
    }

    const wasConflict = true;
    let winner: 'local' | 'remote';

    if (localTime >= remoteTime) {
      winner = 'local';
    } else {
      winner = 'remote';
    }

    const resolvedData = winner === 'local' ? local.data : remote.data;
    const resolvedMeta = winner === 'local' ? local.meta : remote.meta;

    this.logConflict({ local, remote, winner });

    return { resolvedData, resolvedMeta, wasConflict, winner };
  }

  private logConflict(conflictDetail: any) {
    this.conflictLog.push({
      timestamp: new Date().toISOString(),
      ...conflictDetail
    });
    // Keep log size bounded
    if (this.conflictLog.length > 50) {
      this.conflictLog.shift();
    }
  }

  getConflictLog() {
    return this.conflictLog;
  }
}
