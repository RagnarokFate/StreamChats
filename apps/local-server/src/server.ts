import { WebSocketServer, WebSocket } from 'ws';
import { ChatEvent, ModerationEvent } from '@obs-chat/event-schema';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

export class ChatServer {
  private wss: WebSocketServer;
  private httpServer: http.Server;
  private port: number;

  constructor(port: number = 9090) {
    this.port = port;

    // Create an HTTP server to serve the static Vite UI
    this.httpServer = http.createServer((req, res) => {
      // Resolve the path to the overlay-ui/dist folder
      const distPath = path.resolve(__dirname, '../../overlay-ui/dist');
      
      let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url || '');
      
      // Basic security check to prevent directory traversal
      if (!filePath.startsWith(distPath)) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
      }

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          // Fallback to index.html for SPA routing if file not found
          filePath = path.join(distPath, 'index.html');
        }

        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.statusCode = 404;
            res.end('UI build not found. Did you run npm run build in apps/overlay-ui?');
            return;
          }

          const ext = path.extname(filePath);
          let contentType = 'text/html';
          if (ext === '.js') contentType = 'application/javascript';
          else if (ext === '.css') contentType = 'text/css';
          else if (ext === '.svg') contentType = 'image/svg+xml';
          else if (ext === '.png') contentType = 'image/png';
          else if (ext === '.ico') contentType = 'image/x-icon';

          res.setHeader('Content-Type', contentType);
          res.writeHead(200);
          res.end(data);
        });
      });
    });

    // Attach the WebSocket server to the HTTP server
    this.wss = new WebSocketServer({ server: this.httpServer });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[ChatServer] New client connected to WebSocket');
      
      ws.on('close', () => {
        console.log('[ChatServer] Client disconnected');
      });

      ws.on('error', (err) => {
        console.error('[ChatServer] Client error:', err);
      });
    });

    this.httpServer.listen(this.port, () => {
      console.log(`[ChatServer] HTTP and WebSocket listening on port ${this.port}`);
      console.log(`[ChatServer] UI available at: http://localhost:${this.port}/`);
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
    this.httpServer.close();
  }
}
