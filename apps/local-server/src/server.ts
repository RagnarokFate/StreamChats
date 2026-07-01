import { WebSocketServer, WebSocket } from 'ws';
import {
  ChatEvent, ModerationEvent, CommandEvent, CommandEventV2,
  SettingsUpdateEvent, StatusUpdateEvent,
  StreamEvent, StreamEventWs, PersistedEvent,
  ReplyStatusEvent, PluginStatusEvent, IdentityUpdateEvent,
  ExportReadyEvent, AnalyticsReportEvent,
  CommandEventV2Schema,
} from '@obs-chat/event-schema';
import { EventBus } from '@obs-chat/event-bus';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

type CommandHandler = (command: CommandEventV2) => void;

// Track protocol version per client
interface ClientState {
  ws: WebSocket;
  protocolVersion: number; // 1 or 2
}

export class ChatServer {
  private wss: WebSocketServer;
  private httpServer: http.Server;
  private port: number;
  private onCommand?: CommandHandler;
  private eventBus: EventBus;
  private clients: Set<ClientState> = new Set();

  constructor(port: number = 9090, eventBus: EventBus, onCommand?: CommandHandler) {
    this.port = port;
    this.onCommand = onCommand;
    this.eventBus = eventBus;

    const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
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
    };

    // Create primary HTTP server
    this.httpServer = http.createServer(requestHandler);

    // Attach the WebSocket server to the primary HTTP server
    this.wss = new WebSocketServer({ server: this.httpServer });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[ChatServer] New client connected to WebSocket');

      // Default to v1 protocol until client announces v2
      const clientState: ClientState = { ws, protocolVersion: 1 };
      this.clients.add(clientState);
      
      ws.on('message', (data: Buffer) => {
        try {
          const parsed = JSON.parse(data.toString());

          // Protocol version negotiation (T028)
          if (parsed && parsed.type === 'handshake') {
            clientState.protocolVersion = parsed.protocol_version || 1;
            console.log(`[ChatServer] Client negotiated protocol v${clientState.protocolVersion}`);
            // Acknowledge handshake
            ws.send(JSON.stringify({
              type: 'handshake_ack',
              protocol_version: clientState.protocolVersion,
              session_id: this.eventBus.getSessionManager().getActiveSession()?.sessionId || null,
            }));
            return;
          }

          if (parsed && parsed.type === 'command') {
            // Try to parse as v2 command first
            const v2Result = CommandEventV2Schema.safeParse(parsed);
            if (v2Result.success) {
              this.handleV2Command(v2Result.data, clientState);
            } else if (this.onCommand) {
              // Fallback to v1 command handling
              this.onCommand(parsed as CommandEventV2);
            }
          }
        } catch (err) {
          console.error('[ChatServer] Failed to parse incoming WebSocket message', err);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientState);
        console.log('[ChatServer] Client disconnected');
      });

      ws.on('error', (err) => {
        console.error('[ChatServer] Client error:', err);
      });
    });

    this.httpServer.listen(this.port, () => {
      console.log(`[ChatServer] HTTP and WebSocket listening on port ${this.port}`);
      console.log(`[ChatServer] Main UI available at: http://localhost:${this.port}/`);
    });
  }

  /**
   * Handle v2 commands (T027)
   */
  private handleV2Command(command: CommandEventV2, client: ClientState): void {
    switch (command.action) {
      case 'backup_database': {
        if (this.onCommand) {
          this.onCommand(command);
        } else {
          // Send some status
        }
        break;
      }
      
      case 'restore_database': {
        if (this.onCommand) {
          this.onCommand(command);
        }
        break;
      }

      case 'place_marker': {
        const session = this.eventBus.getSessionManager().getActiveSession();
        if (session) {
           this.eventBus.getStore().getDatabase().prepare(
             'INSERT INTO stream_markers (markerId, sessionId, timestamp, label) VALUES (?, ?, ?, ?)'
           ).run(command.payload.markerId || crypto.randomUUID(), session.sessionId, new Date().toISOString(), command.payload.label || null);
           console.log(`[ChatServer] Marker placed for session: ${session.sessionId} (label: ${command.payload.label || 'none'})`);
        }
        break;
      }

      case 'get_markers': {
        let sessionId = (command.payload as any)?.sessionId;
        if (!sessionId) {
          const session = this.eventBus.getSessionManager().getActiveSession();
          sessionId = session?.sessionId;
        }

        if (sessionId) {
           const markers = this.eventBus.getStore().getDatabase().prepare(
             'SELECT markerId as id, label, timestamp as time FROM stream_markers WHERE sessionId = ? ORDER BY timestamp DESC'
           ).all(sessionId);
           client.ws.send(JSON.stringify({
             type: 'command_response',
             action: 'markers_list',
             payload: { markers }
           }));
        }
        break;
      }

      case 'switch_view_mode': {
        // Broadcast view mode change to all clients
        this.broadcastToAll({
          type: 'settings_update',
          settings: { activeViewMode: command.payload.mode } as any,
        });
        break;
      }

      case 'update_settings': {
        // Broadcast updated settings to all clients so they reflect immediately
        this.broadcastToAll({
          type: 'settings_update',
          settings: command.payload.settings,
        });
        // Delegate to onCommand if needed
        if (this.onCommand) {
          this.onCommand(command);
        }
        break;
      }

      case 'clear_chat': {
        // Broadcast clear_chat as a moderation event so UI clients clear their state
        this.broadcastToAll({
          type: 'moderation',
          action: 'clear_chat',
          eventId: crypto.randomUUID(),
          platform: 'custom',
          timestamp: new Date().toISOString()
        });
        // Delegate to onCommand if backend also wants to do something
        if (this.onCommand) {
          this.onCommand(command);
        }
        break;
      }

      case 'timeout':
      case 'ban': {
        this.broadcastToAll({
          type: 'moderation',
          action: command.action as 'timeout' | 'ban',
          eventId: crypto.randomUUID(),
          platform: command.payload.platform || 'custom',
          targetUserId: command.payload.userId,
          timestamp: new Date().toISOString()
        });
        if (this.onCommand) {
          this.onCommand(command);
        }
        break;
      }

      case 'link_identity': {
        if (this.onCommand) {
          this.onCommand(command);
        }
        break;
      }

      case 'update_reputation_weights': {
        if (this.onCommand) {
          this.onCommand(command);
        }
        break;
      }

      case 'export_session': {
        if (this.onCommand) {
          this.onCommand(command);
        }
        break;
      }

      case 'manage_plugin':
      case 'obs_action': {
        if (this.onCommand) {
          this.onCommand(command);
        }
        break;
      }

      default:
        // Delegate to v1 handler for backward-compatible commands
        if (this.onCommand) {
          this.onCommand(command);
        }
        break;
    }
  }

  /**
   * Broadcast a stream event to all clients, respecting protocol version.
   * v1 clients receive `chat_message` for chat events.
   * v2 clients receive `stream_event` wrapper for all event types.
   */
  public broadcastStreamEvent(event: PersistedEvent): void {
    for (const client of this.clients) {
      if (client.ws.readyState !== WebSocket.OPEN) continue;

      // v2: Send stream_event wrapper
      const wsEvent: StreamEventWs = {
        type: 'stream_event',
        event: event as any,
      };
      client.ws.send(JSON.stringify(wsEvent));
    }
  }



  /**
   * Broadcast to all clients regardless of protocol version.
   */
  public broadcastToAll(event: any): void {
    const data = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  public close(): Promise<void> {
    this.wss.close();
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
