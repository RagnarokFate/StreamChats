# Data Model: Local Server

The local server does not define new entities. It operates on the existing types:
- `ChatEvent`
- `ModerationEvent`

## WebSocket API Contract
- **Protocol**: Unauthenticated WebSocket connection on `ws://localhost:9090`
- **Direction**: Server -> Client only.
- **Format**: JSON serialized `ChatEvent` or `ModerationEvent`.

```json
{
  "eventId": "uuid",
  "platform": "twitch",
  "timestamp": "ISO-string",
  "type": "chat",
  "author": { "id": "1", "name": "user" },
  "message": { "text": "hello" }
}
```
