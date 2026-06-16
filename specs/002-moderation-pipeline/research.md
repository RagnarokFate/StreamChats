# Research: Moderation Pipeline

## Interception Strategy
- **Decision**: The moderation pipeline will be an EventEmitter wrapper or middleware class between connectors and the local server.
- **Rationale**: Connectors emit `chat_message` and `moderation_action`. The local server listens to them. If we insert the moderation pipeline as a mediator, it can receive the raw events, modify or drop them, and emit the sanitized events to the server.
- **Alternatives considered**: Adding moderation directly into `BaseConnector`. Rejected because it violates single responsibility; connectors should just extract data, the aggregator should moderate.

## Masking vs Dropping
- **Decision**: Provide a configuration object `ModerationOptions` that allows specifying `bannedWordAction: 'drop' | 'mask'`.
- **Rationale**: Fulfills the user's specific request from the specification clarification. If `mask` is chosen, the system uses regex replacement.

## Memory Bound (FR-005)
- **Decision**: Implement a ring buffer / fixed-size array to store recent message IDs or user activity for spam detection, rather than an unbounded array.
- **Rationale**: Adheres to the Constitution's "Stability for Long Sessions" principle. Unbounded arrays would leak memory on 12-hour streams.
