# Feature Specification: StreamChats Product Roadmap

**Feature Branch**: `007-product-roadmap`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "Consolidated and structured list of top features and technical improvements for StreamChats, covering Core Architecture, OBS Integration, Moderation, Extensibility, Analytics, and Monetization."

## Clarifications

### Session 2026-06-27

- Q: What permission model should the Plugin SDK sandbox use? → A: Capability-based permissions — plugins declare needed capabilities from a fixed list (e.g., `network`, `filesystem-read`, `filesystem-write`, `notifications`, `overlay-render`). Users approve requested capabilities on install.
- Q: What signals should feed into the ViewerIdentity reputation score? → A: Weighted behavioral composite — combines positive signals (message count, gifts/subs, watch time, engagement actions) and negative signals (moderation actions, spam flags, shadow-suppressed messages). Streamer can adjust category weights.
- Q: Which chat view mode should load by default when the dashboard first opens? → A: Unified — all platforms merged into a single chronological feed. Matches the overlay and requires no initial configuration.
- Q: What should the default session data retention period be? → A: 14 days (2 weeks). Old session data is automatically rotated after this period. The retention period is configurable by the user.
- Q: What delivery guarantee should the Event Bus provide? → A: At-least-once with consumer-managed offsets. Events are persisted to the local database; consumers track their last-processed offset and can catch up after downtime. Duplicates are dedupable via the existing event ID.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Resilient Multi-Platform Chat Aggregation (Priority: P1)

A streamer launches StreamChats and connects to Twitch, YouTube, Kick, and TikTok simultaneously. During the stream, the Kick API becomes temporarily unreachable. The system automatically detects the failure, applies exponential backoff, and reconnects without affecting the other three platform feeds. The streamer sees a health indicator showing "Kick: Reconnecting…" while the remaining platforms continue to deliver messages without interruption. All chat events (including gifts, follows, raids, and super chats) are normalized into a unified event format and displayed in real time.

**Why this priority**: Reliability is the foundational requirement. If connectors crash the entire system when one undocumented API changes, no other feature matters. The expanded event schema (gifts, follows, raids) directly unlocks value across the dashboard, moderation, analytics, and plugin features.

**Independent Test**: Can be tested by simulating a connector failure (disconnecting a platform mid-stream) and verifying the remaining platforms remain unaffected. Gift, follow, and raid events can be tested by triggering them on test channels.

**Acceptance Scenarios**:

1. **Given** the streamer is connected to 4 platforms, **When** one platform's API becomes unreachable, **Then** the system isolates the failure and reconnects with exponential backoff while the other 3 platforms continue delivering messages.
2. **Given** a viewer sends a gift/super chat on any connected platform, **When** the event arrives, **Then** it is normalized into a standardized event format and delivered to all consumers (overlay, dashboard, plugins).
3. **Given** the system processes chat events, **When** events flow through the pipeline, **Then** they pass through a `Connector → Normalizer → Event Bus → Consumers` architecture that decouples producers from consumers.

---

### User Story 2 — Streamer Dashboard & OBS Control (Priority: P1)

A streamer opens the local dashboard in their browser alongside OBS Studio. From a single interface, they can read all incoming chat messages across platforms, reply to viewers (with replies dispatched to the correct platform), monitor per-platform connection health, view real-time statistics (messages per minute, platform share, top chatters), and customize the overlay theme, fonts, and colors with a live preview. They can also place stream markers with a hotkey for later VOD editing. Changes to the overlay are reflected in OBS within seconds.

**Why this priority**: The dashboard is the streamer's primary interaction surface. Without it, the product is a passive overlay — the dashboard transforms it into an active streaming tool.

**Independent Test**: Can be tested by opening the dashboard, connecting to at least one platform, sending test messages, replying via the dashboard, verifying the reply appears on the platform, and confirming overlay changes propagate to OBS.

**Acceptance Scenarios**:

1. **Given** the streamer opens the dashboard, **When** messages arrive from multiple platforms, **Then** all messages appear in a unified feed with platform badges and the streamer can reply to any message directly.
2. **Given** the streamer modifies font size or theme in the dashboard, **When** the change is saved, **Then** the OBS overlay reflects the update within 2 seconds.
3. **Given** the streamer presses the marker hotkey during a stream, **When** the hotkey is triggered, **Then** a timestamped marker is logged locally for later review.
4. **Given** a platform connector goes down, **When** the streamer views the health panel, **Then** they see the affected platform's status and can manually trigger a reconnection.

---

### User Story 3 — Local-First Moderation & Safety (Priority: P2)

A streamer enables cross-platform moderation from the dashboard. When a toxic message arrives from any platform, the local moderation pipeline detects it and suppresses it from the overlay without deleting it on the native platform (shadow suppression). During a raid, the system detects the rapid influx of messages and auto-collapses identical spam. The streamer can also link viewer identities across platforms (recognizing the same person across Twitch, YouTube, and Kick) to build a unified reputation score. All moderation processing runs entirely on the streamer's machine — no chat data is sent to any external service.

**Why this priority**: Moderation directly protects the streamer's experience and community. Shadow suppression and cross-platform identity are high-impact differentiators that no competitor offers in a local-first model.

**Independent Test**: Can be tested by sending test messages through the moderation pipeline with known toxic content and verifying they are suppressed from the overlay but not deleted from the platform. Raid detection can be tested by flooding messages rapidly.

**Acceptance Scenarios**:

1. **Given** a toxic message is detected, **When** the moderation pipeline processes it, **Then** the message is hidden from the overlay but remains visible on the native platform.
2. **Given** 50+ identical messages arrive within 5 seconds (raid scenario), **When** the rate limiter triggers, **Then** messages are auto-collapsed into a single "x50" summary and an alert is shown to the streamer.
3. **Given** the streamer links two viewer accounts ("JohnYT" on YouTube, "john123" on Twitch), **When** either account sends a message, **Then** the system displays a unified identity badge and combined reputation score.
4. **Given** the moderation pipeline is running, **When** processing any message, **Then** no chat data leaves the local machine.

---

### User Story 4 — Session Recording, Analytics & Export (Priority: P2)

After a 3-hour stream, the streamer opens the analytics dashboard and sees a post-stream report showing messages per minute over time, platform share breakdown (e.g., 60% Twitch, 40% YouTube), top 10 chatters, and peak engagement windows. All data was collected locally during the stream using a lightweight embedded database. The streamer can export the chat log as a timestamped file for VOD replay and export moderation/engagement data as CSV for sponsor reports or compliance records.

**Why this priority**: Analytics transform StreamChats from a real-time tool into a long-term growth platform. Session recording enables crash recovery and chat replay, which are must-have features for professional streamers.

**Independent Test**: Can be tested by running a simulated stream with known message volumes, ending the session, and verifying the analytics report matches expected values. Export can be tested by downloading CSV and verifying data integrity.

**Acceptance Scenarios**:

1. **Given** a stream session ends, **When** the streamer opens analytics, **Then** they see accurate metrics including messages per minute, platform share, top chatters, and peak engagement periods.
2. **Given** a stream session is in progress, **When** the system logs events, **Then** all events are persisted to a local database enabling crash recovery (resuming from last known state).
3. **Given** the streamer requests a chat export, **When** they select a format (CSV or timestamped log), **Then** the export file is generated and available for download within 30 seconds for sessions up to 8 hours.
4. **Given** the streamer wants to replay chat alongside a VOD, **When** they load a session recording, **Then** messages are displayed with accurate timestamps matching the original stream timeline.

---

### User Story 5 — Plugin Ecosystem & Developer Tooling (Priority: P3)

A developer wants to build a Text-to-Speech plugin for StreamChats. They install the `streamchats-cli`, scaffold a new plugin from a template, and use the built-in connector simulator to test it without needing live platform credentials. The plugin listens to the internal Event Bus for chat events and speaks them aloud. Once published, streamers can discover and install the plugin from the local marketplace within the dashboard. The plugin runs in a sandboxed environment that prevents it from accessing the streamer's file system or network beyond defined permissions.

**Why this priority**: The plugin ecosystem is a force multiplier but depends on the Event Bus (P1) and dashboard (P1) being built first. This is the primary path to community-driven growth and long-term extensibility.

**Independent Test**: Can be tested by using the CLI to scaffold a plugin, loading it via the Event Bus, and verifying it receives events. Sandbox can be tested by attempting a file system access from within a plugin and verifying it is blocked.

**Acceptance Scenarios**:

1. **Given** a developer runs `streamchats-cli create plugin my-plugin`, **When** the scaffold completes, **Then** a working plugin template is generated with Event Bus listener boilerplate and documentation.
2. **Given** a plugin is installed, **When** a chat event arrives on the Event Bus, **Then** the plugin receives the event within 100ms and can process it.
3. **Given** a plugin attempts to access the file system outside its sandbox, **When** the access is attempted, **Then** the system blocks the operation and logs a security warning.
4. **Given** a streamer browses the local marketplace, **When** they select a plugin, **Then** they can install it with a single click and it becomes active immediately.

---

### User Story 6 — Native Desktop App & OBS Deep Integration (Priority: P3)

A non-technical streamer downloads StreamChats as a desktop application (no Node.js installation required). They launch the app, enter their channel names, and the system automatically creates browser sources in OBS via the obs-websocket protocol. The app runs as a lightweight native process using minimal system resources. During the stream, the app can switch OBS scenes based on chat activity thresholds and display connector health directly inside the OBS interface.

**Why this priority**: The native desktop wrapper removes the biggest adoption barrier (installing Node.js) and the obs-websocket integration provides deep OBS automation that differentiates StreamChats from browser-based competitors. However, these are packaging and integration concerns that don't block core feature development.

**Independent Test**: Can be tested by building the desktop installer, launching the app on a clean machine (no Node.js), and verifying it connects to platforms and creates OBS browser sources automatically.

**Acceptance Scenarios**:

1. **Given** a user downloads the desktop installer, **When** they launch it on a machine without Node.js, **Then** the application starts successfully and all features work identically to the manual setup.
2. **Given** the app is configured with OBS connection details, **When** the streamer starts a session, **Then** the app automatically creates/updates browser sources in OBS with the correct overlay URL.
3. **Given** chat activity exceeds a configurable threshold, **When** the threshold is crossed, **Then** the app can trigger an OBS scene switch via the obs-websocket protocol.
4. **Given** the desktop app is running during a 6-hour stream, **When** resource usage is monitored, **Then** memory consumption remains stable (no unbounded growth) and CPU usage stays below 3%.

---

### User Story 7 — Premium Features & Monetization (Priority: P4)

A streamer who uses StreamChats across multiple machines opts into the paid cloud sync service. Their custom themes, moderation filters, and viewer identity links sync seamlessly across devices. An esports organization deploys the Studio Edition, where multiple moderators can manage chat simultaneously with role-based access, NDI output feeds to their broadcast infrastructure, and the system handles remote network broadcasting for tournament coverage.

**Why this priority**: Monetization is essential for long-term sustainability but should only be built after the core product is mature and has an established user base. The open-core model (free engine + premium add-ons) allows growth without alienating the community.

**Independent Test**: Can be tested by simulating multi-device sync (two instances with cloud sync enabled) and verifying settings propagate. Studio Edition can be tested by configuring multiple moderator accounts and verifying role-based permissions.

**Acceptance Scenarios**:

1. **Given** a streamer enables cloud sync on two machines, **When** they update a theme on Machine A, **Then** the change appears on Machine B within 30 seconds.
2. **Given** an esports organization uses the Studio Edition, **When** a moderator logs in, **Then** they see only the controls and chat feeds assigned to their role.
3. **Given** the open-core marketplace is available, **When** a streamer browses premium themes, **Then** they can preview, purchase, and apply a theme entirely within the application.

---

### Edge Cases

- What happens when all 4 platform connectors fail simultaneously? → System enters a "degraded mode" displaying a clear status banner and retries all connectors independently.
- How does the system handle conflicting cross-platform identity links (same person linked to two different identities)? → Manual conflict resolution via the dashboard with an audit trail.
- What if a plugin crashes or enters an infinite loop? → The sandbox enforces resource limits (CPU time, memory) and terminates runaway plugins with a user-facing notification.
- What happens when the local database exceeds available disk space during a marathon session? → The system warns the streamer at 80% capacity and automatically rotates old session data beyond the default 14-day retention period (configurable by the user).
- How does the desktop app handle OBS not being installed? → The app functions in standalone mode (browser-based overlay only) with a prompt to install OBS for the full experience.
- What if the streamer's machine loses power during a session? → The durable local storage enables crash recovery, replaying events from the last checkpoint on next startup.

## Requirements *(mandatory)*

### Functional Requirements

**Core Architecture & Infrastructure**

- **FR-001**: System MUST route all platform events through a normalized pipeline (`Connector → Normalizer → Event Bus → Consumers`) that decouples event producers from consumers. The Event Bus MUST provide at-least-once delivery guarantees: events are persisted to the local database, each consumer tracks its own last-processed offset, and consumers can catch up after downtime. Duplicate events are dedupable via the unique event ID.
- **FR-002**: System MUST implement a Connector Supervisor with circuit breakers that isolate individual platform failures, apply health checks, and use exponential backoff for reconnection.
- **FR-003**: System MUST persist all events to a local embedded database, enabling session recording, crash recovery, and post-stream analytics. Session data MUST be automatically rotated after a configurable retention period (default: 14 days), with a warning issued at 80% disk capacity.
- **FR-004**: System MUST support an expanded event schema covering at minimum: `ChatEvent`, `GiftEvent`, `FollowEvent`, `RaidEvent`, and `SuperChatEvent`, each with platform-specific metadata normalized into a common format.
- **FR-005**: System MUST be packageable as a native desktop application that runs without requiring the user to install runtime dependencies.

**OBS Integration & Streamer UX**

- **FR-006**: System MUST provide a two-way broadcaster dashboard where the streamer can read chat from all platforms and reply to messages, with replies dispatched to the correct originating platform.
- **FR-007**: System MUST integrate with the obs-websocket protocol to automatically create/update browser sources, switch scenes based on configurable triggers, and display connector health.
- **FR-008**: System MUST support global hotkey-based stream markers that log local timestamps for VOD editing.
- **FR-009**: System MUST enable session recording with timestamped chat logs that can be replayed alongside offline VODs.
- **FR-010**: System MUST provide a visual theme editor with live preview, allowing users to customize colors, fonts, and animations before applying changes to the OBS overlay.
- **FR-011**: System MUST support multiple chat view modes: Unified (default on first load), Split-screen (by platform), Priority-platform (weighted display), and Moderator (with moderation actions inline). The dashboard MUST default to Unified mode, showing all platforms in a single chronological feed, with the user able to switch modes at any time.

**Moderation & Safety**

- **FR-012**: System MUST support cross-platform identity linking, allowing the streamer to group multiple viewer accounts into a single unified identity with a combined reputation score. The reputation score MUST be computed as a weighted behavioral composite of positive signals (message count, gifts/subscriptions, watch time, engagement) and negative signals (moderation actions, spam flags, shadow-suppressed messages), with streamer-adjustable category weights.
- **FR-013**: System MUST provide a local moderation pipeline capable of detecting toxicity and context-specific spam without sending any chat data to external services.
- **FR-014**: System MUST implement shadow suppression — hiding flagged messages from the local overlay without deleting or actioning them on the native platform.
- **FR-015**: System MUST auto-detect rapid message influxes (raids) and auto-collapse repeated identical messages with a count indicator.

**Extensibility & Plugins**

- **FR-016**: System MUST expose a Plugin SDK that allows third-party plugins to subscribe to Event Bus events and interact with the system through sandboxed interfaces governed by a capability-based permission model. Plugins MUST declare required capabilities from a fixed list (e.g., `network`, `filesystem-read`, `filesystem-write`, `notifications`, `overlay-render`) in their manifest, and users MUST approve requested capabilities at install time.
- **FR-017**: System MUST provide a developer CLI (`streamchats-cli`) with commands to scaffold plugins, simulate connectors, and test integrations without live platform credentials.
- **FR-018**: System MUST include a local marketplace where users can discover, install, and manage community-made plugins and themes.

**Zero-Cloud Analytics**

- **FR-019**: System MUST generate post-stream analytics entirely offline, including: messages per minute over time, platform share breakdown, top chatters by volume, and peak engagement windows.
- **FR-020**: System MUST support exporting moderation logs, chat history, and engagement data in CSV format for compliance, appeals, or reporting purposes.

**Premium & Monetization**

- **FR-021**: System MUST follow an open-core model where the engine and core features remain free, with monetization through a built-in store for premium themes and advanced plugins.
- **FR-022**: System MUST offer optional, opt-in cloud synchronization for settings, filters, themes, and identity links across multiple devices.
- **FR-023**: System MUST support a Studio Edition with multi-operator moderator roles, NDI output, and remote network broadcasting capabilities for professional/enterprise use.

### Key Entities

- **StreamEvent**: The base normalized event type produced by all connectors. Subtypes include ChatEvent, GiftEvent, FollowEvent, RaidEvent, and SuperChatEvent. Each carries a unique event ID (used for at-least-once deduplication by consumers), platform-specific metadata (badges, emotes, amounts) in a standardized structure, and a monotonic sequence number for consumer offset tracking.
- **ViewerIdentity**: A cross-platform identity grouping that links one or more platform-specific viewer accounts. Carries a reputation score computed as a weighted behavioral composite (positive: message count, gifts/subs, watch time, engagement; negative: moderation actions, spam flags, shadow suppressions), moderation history, and linking metadata. Category weights are adjustable by the streamer.
- **StreamSession**: A time-bounded recording of a single streaming session. Contains all events, markers, connector health snapshots, and analytics aggregates. Persisted in the local database.
- **Plugin**: A sandboxed extension that subscribes to Event Bus topics and exposes configurable settings. Has a manifest (name, version, declared capabilities from a fixed permission list, event subscriptions) and lifecycle hooks (install, activate, deactivate, uninstall). Capabilities are approved by the user at install time; the sandbox enforces that only approved capabilities are accessible at runtime.
- **Connector**: A platform-specific module that establishes a connection to a streaming platform's chat system, normalizes raw messages into StreamEvents, and reports health status to the Supervisor.
- **ThemeConfiguration**: A user-customizable set of visual properties (colors, fonts, animations, layout) that can be previewed live and applied to the OBS overlay. Supports import/export for sharing.
- **ModerationRule**: A configurable rule in the moderation pipeline (banned words, toxicity thresholds, rate limits, shadow suppression toggles) that can be edited from the dashboard and persisted to local configuration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a single platform connector fails, the remaining connected platforms continue delivering messages with zero interruption. Recovery occurs within 60 seconds via automated retry.
- **SC-002**: The streamer can read, filter, and reply to chat messages from all connected platforms through a single dashboard interface, with replies appearing on the target platform within 3 seconds.
- **SC-003**: Overlay customization changes (theme, font, color) made in the dashboard are reflected in the OBS Browser Source within 2 seconds.
- **SC-004**: The local moderation pipeline processes and classifies messages in under 200ms per message with no chat data leaving the local machine.
- **SC-005**: Post-stream analytics are generated within 30 seconds of session end for streams up to 8 hours in duration.
- **SC-006**: A developer can scaffold, build, and test a new plugin using the CLI in under 15 minutes without needing live platform credentials.
- **SC-007**: The native desktop application launches and is ready for use within 10 seconds on a machine with no pre-installed development dependencies.
- **SC-008**: The system maintains stable resource consumption (no memory leaks, CPU below 3%) during continuous sessions lasting 8+ hours.
- **SC-009**: Chat log and analytics exports for an 8-hour session are generated in under 60 seconds.
- **SC-010**: Cross-platform identity linking correctly unifies viewer accounts across at least 4 platforms with a false-positive link rate below 1%.
- **SC-011**: Plugins installed from the marketplace activate and begin receiving events within 5 seconds of installation.
- **SC-012**: Cloud sync propagates settings changes between devices within 30 seconds.

## Assumptions

- The existing monorepo structure (apps, connectors, packages, plugins) will be preserved and extended rather than replaced.
- The current 4 platform connectors (Twitch, YouTube, Kick, TikTok) remain the initial supported platforms, with the architecture designed to accommodate additional platforms.
- The local-first philosophy remains the core product principle — cloud features are always opt-in and supplementary.
- Streamers have a stable local network connection but may not have reliable internet for all platforms simultaneously.
- The desktop wrapper will use a lightweight framework (such as Tauri) rather than a heavier solution to maintain the low-resource-usage principle.
- The local AI moderation pipeline will use small, quantized models that can run on consumer hardware (8GB+ RAM) without requiring a dedicated GPU.
- Reply-to-platform functionality depends on platform API support — platforms that do not expose a send-message API will show a "read-only" indicator.
- The Studio Edition (B2B) is a future milestone that will be developed after the core product reaches maturity.
- Mobile browser access to the dashboard is out of scope for the initial roadmap — desktop browser and OBS Browser Source are the primary targets.
- The marketplace will initially be a local registry (curated JSON catalog) before evolving into a networked discovery system.
