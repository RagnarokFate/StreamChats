import { WebSocketServer, WebSocket } from 'ws';
import { ChatEvent, ModerationEvent } from '@obs-chat/event-schema';

export class ChatServer {
  private wss: WebSocketServer;
  private port: number;

  constructor(port: number = 9090) {
    this.port = port;
    this.wss = new WebSocketServer({ port: this.port });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[ChatServer] New client connected');
      
      ws.on('close', () => {
        console.log('[ChatServer] Client disconnected');
      });

      ws.on('error', (err) => {
        console.error('[ChatServer] Client error:', err);
      });
    });

    this.wss.on('listening', () => {
      console.log(`[ChatServer] Listening on ws://localhost:${this.port}`);
    });
  }

  public broadcast(event: ChatEvent | ModerationEvent): void {
    const data = JSON.stringify(event);
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  public close(): void {
    this.wss.close();
  }
}
