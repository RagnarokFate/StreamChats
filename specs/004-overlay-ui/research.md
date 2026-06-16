# Research: Overlay UI Design & Integration

## Styling Framework
- **Decision**: Vanilla CSS.
- **Rationale**: Direct CSS allows the most fine-grained control over advanced aesthetics like backdrop filters (glassmorphism), complex gradients, and smooth hardware-accelerated keyframe animations. This perfectly aligns with the `<web_application_development>` directive to prioritize rich aesthetics without relying on standard frameworks unless required.

## Animation Strategy
- **Decision**: CSS Keyframes combined with React state.
- **Rationale**: Messages entering the chat feed will trigger an `.animate-in` class (slide-up + fade-in). When a moderation event deletes a message, an `.animate-out` class (scale-down + fade-out) will be applied before unmounting the component from the DOM.

## WebSocket State Management
- **Decision**: A custom `useChatFeed` React hook.
- **Rationale**: Encapsulates the WebSocket connection logic, reconnect backoffs, and the complex state array manipulation (adding new messages, removing messages by `author.id` when a ban occurs).
