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
              session_id: this.eventBus.getCurrentSessionId(),
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
      case 'reply_message': {
        if (this.onCommand) {
          this.onCommand(command);
        } else {
          const replyStatus: ReplyStatusEvent = {
            type: 'reply_status',
            platform: command.payload.platform,
            status: 'read_only',
            error: 'Outbound messaging not configured',
          };
          client.ws.send(JSON.stringify(replyStatus));
        }
        break;
      }

      case 'place_marker': {
        const markerId = this.eventBus.createMarker(command.payload.label);
        if (markerId) {
          console.log(`[ChatServer] Marker placed: ${markerId} (label: ${command.payload.label || 'none'})`);
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

      if (client.protocolVersion >= 2) {
        // v2: Send stream_event wrapper
        const wsEvent: StreamEventWs = {
          type: 'stream_event',
          event: event as any,
        };
        client.ws.send(JSON.stringify(wsEvent));
      } else {
        // v1: Only send chat_message events (backward compatible)
        if (event.type === 'chat') {
          client.ws.send(JSON.stringify(event));
        }
      }
    }
  }

  /**
   * Legacy broadcast for non-stream events (settings, status, moderation).
   */
  public broadcast(event: ChatEvent | ModerationEvent | SettingsUpdateEvent | StatusUpdateEvent | ReplyStatusEvent | PluginStatusEvent): void {
    const data = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
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
