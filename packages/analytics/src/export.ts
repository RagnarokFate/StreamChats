import { EventBusStore } from '@obs-chat/event-bus';
import { StreamEvent } from '@obs-chat/event-schema';
import fs from 'fs';
import path from 'path';

export class SessionExporter {
  private store: EventBusStore;

  constructor(store: EventBusStore) {
    this.store = store;
  }

  /**
   * Export the chat session as a CSV file.
   */
  public exportToCSV(sessionId: string, outputPath: string): string {
    const events = this.store.getEventsBySession(sessionId);
    
    let csvContent = 'SequenceNumber,Timestamp,Platform,Type,Author,Message\n';
    
    events.forEach(row => {
      try {
        const payload = JSON.parse(row.payload) as StreamEvent;
        const seq = row.sequence_number;
        const ts = payload.timestamp;
        const platform = payload.platform;
        const type = payload.type;
        const author = (payload as any).author ? (payload as any).author.name.replace(/"/g, '""') : '';
        
        let message = '';
        if ('text' in payload && typeof payload.text === 'string') {
          message = payload.text.replace(/"/g, '""');
        }

        csvContent += `${seq},"${ts}","${platform}","${type}","${author}","${message}"\n`;
      } catch (e) {
        // Skip invalid rows
      }
    });

    const fullPath = path.resolve(outputPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, csvContent, 'utf8');
    
    return fullPath;
  }

  /**
   * Export the chat session as a JSON array with relative timestamps for VOD replay.
   */
  public exportToVODFormat(sessionId: string, outputPath: string): string {
    const session = this.store.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const events = this.store.getEventsBySession(sessionId);
    const sessionStartTs = new Date(session.started_at).getTime();

    const vodEvents = events.map(row => {
      const payload = JSON.parse(row.payload) as StreamEvent;
      const eventTs = new Date(payload.timestamp).getTime();
      const relativeTimeMs = Math.max(0, eventTs - sessionStartTs);
      
      return {
        ...payload,
        relativeTimeMs
      };
    });

    const fullPath = path.resolve(outputPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(vodEvents, null, 2), 'utf8');
    
    return fullPath;
  }
}
