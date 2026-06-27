# Feature Specification: Dashboard Controls Panel

**Feature Branch**: `006-dashboard-controls`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "Timelapse of each message. Main page at port 9090 with settings: preview livestreams buttons, font editing, clear chat, emoji toggle for twitch/youtube, stream statistics per platform, adjustable background color picker. Plus additional streamer-oriented controls."

## Clarifications

### Session 2026-06-20

- Q: Should the dashboard be a separate app or part of the existing overlay-ui React app? → A: Same React app with route-based separation (`/` = overlay, `/dashboard` = controls panel).
- Q: How should user preferences be persisted? → A: Hybrid — display preferences (background color, font, theme, emote toggles, timestamps) in browser local storage; moderation and connector settings (banned words, spam toggle, moderation actions) in a server-side JSON config file.
- Q: Are Twitch/YouTube connectors already populating the emote `fragments` array? → A: No — connector emote parsing for Twitch and YouTube is in-scope for this feature.
- Q: How should the dashboard communicate commands to the server? → A: Bidirectional WebSocket — commands sent as JSON messages over the existing WS connection, server responds on the same channel.
- Q: When should stream statistics reset? → A: On server restart (implicit) and via a manual "Reset Stats" button in the dashboard for mid-session resets.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Streamer Dashboard Home (Priority: P1)

A streamer opens `http://localhost:9090` in their browser and sees a full-featured dashboard — not just the raw chat overlay. The dashboard provides a sidebar navigation with sections for **Chat Controls**, **Overlay Customization**, **Stream Statistics**, and **Platform Health**. The page defaults to a dark theme but the streamer can pick any background color using an integrated color picker. All settings are persisted between sessions so the streamer does not have to reconfigure after restarting OBS.

**Why this priority**: The dashboard is the entry point for every other feature. Without it, no other control is accessible.

**Independent Test**: Open `http://localhost:9090` and verify a styled dashboard renders with navigation sections, a color picker, and that changing the background color persists after a page refresh.

**Acceptance Scenarios**:

1. **Given** the local server is running, **When** the streamer navigates to `http://localhost:9090`, **Then** a full dashboard UI loads with sidebar navigation, dark theme by default, and a header identifying the application.
2. **Given** the dashboard is open, **When** the streamer picks a new background color via the color picker, **Then** the background updates instantly and the choice persists after page refresh.
3. **Given** the dashboard is open, **When** the streamer clicks on different navigation sections, **Then** the corresponding panel content displays without a full page reload.

---

### User Story 2 - Chat Controls Panel (Priority: P1)

From the Chat Controls section of the dashboard, the streamer can **clear all chat messages** across every connected overlay with one button. They see a live preview of the current chat feed (same as what OBS displays). They can also adjust the **font family, font size, and font weight** used in the overlay, and the changes are broadcast in real-time to all connected OBS Browser Sources.

**Why this priority**: Chat management and font customization are the most frequently requested streamer controls and directly affect the live broadcast appearance.

**Independent Test**: Open the dashboard, send test messages, click "Clear Chat", and verify messages disappear from both the dashboard preview and any connected OBS overlay. Change font settings and verify the OBS overlay updates in real-time.

**Acceptance Scenarios**:

1. **Given** messages are visible in the chat preview, **When** the streamer clicks "Clear Chat", **Then** all messages are removed from the dashboard preview and from all connected OBS overlays simultaneously.
2. **Given** the Chat Controls panel is open, **When** the streamer changes font family from a dropdown of popular streaming fonts, **Then** the overlay preview and all connected OBS Browser Sources update to reflect the new font within 1 second.
3. **Given** the Chat Controls panel is open, **When** the streamer adjusts the font size slider, **Then** the overlay preview updates in real-time to match.

---

### User Story 3 - Emoji & Emote Rendering (Priority: P1)

Chat messages that contain emotes (Twitch emotes, YouTube emoji, etc.) display the actual emote images inline with the text instead of showing raw text codes. The streamer can toggle emote rendering on/off globally, and per platform (e.g., show Twitch emotes but hide YouTube emoji). When disabled, emotes render as their text-only fallback.

**Why this priority**: Emotes are a fundamental part of chat culture across all streaming platforms. Not rendering them makes the overlay feel broken and incomplete.

**Independent Test**: Send a Twitch message containing an emote (e.g., Kappa). Verify the emote image renders inline. Toggle emotes off in the dashboard and verify the same message now shows the text fallback "Kappa".

**Acceptance Scenarios**:

1. **Given** emote rendering is enabled for Twitch, **When** a Twitch chat message arrives with emotes, **Then** the emote images render inline at the same size as surrounding text.
2. **Given** emote rendering is disabled for YouTube, **When** a YouTube chat message arrives with emoji, **Then** only the text fallback is displayed.
3. **Given** the streamer toggles emote rendering off globally, **When** new messages arrive from any platform, **Then** all emotes display as their text-only fallback.
4. **Given** the streamer re-enables emote rendering, **When** new messages arrive, **Then** emote images render inline again.

---

### User Story 4 - Message Timestamps (Priority: P2)

Each chat message in the overlay and dashboard preview shows a relative or absolute timestamp indicating when it was sent. The streamer can toggle timestamps on/off and choose between "relative" (e.g., "2m ago") and "absolute" (e.g., "7:42 PM") format from the dashboard.

**Why this priority**: Timestamps give streamers temporal context about chat flow. Useful for VOD review and understanding chat pacing, but not essential for the core chat display.

**Independent Test**: Verify messages show timestamps by default. Toggle timestamps off and verify they disappear. Switch between relative and absolute format and verify the display changes.

**Acceptance Scenarios**:

1. **Given** timestamps are enabled in "relative" mode, **When** a message arrives, **Then** it displays a timestamp like "just now" that updates to "1m ago", "2m ago", etc.
2. **Given** timestamps are enabled in "absolute" mode, **When** a message arrives, **Then** it displays the local time (e.g., "7:42 PM").
3. **Given** timestamps are disabled, **When** a message arrives, **Then** no timestamp is shown beside the message.

---

### User Story 5 - Overlay Preview & Theme Selector (Priority: P2)

The dashboard includes a live preview panel that mirrors exactly what the OBS Browser Source displays. The streamer can switch between all available themes (glass, minimal, neon, classic, retro, bubble, holographic, comic, terminal) from a visual theme picker and see the effect instantly in the preview. Each theme shows a thumbnail or live mini-preview so the streamer can compare without trial and error.

**Why this priority**: Streamers frequently switch themes to match their stream aesthetic. Having a live preview inside the dashboard eliminates the need to alt-tab into OBS to check each theme.

**Independent Test**: Open the dashboard, select different themes from the picker, and verify the preview panel updates immediately with the chosen theme's styling.

**Acceptance Scenarios**:

1. **Given** the dashboard is open, **When** the streamer views the Overlay Preview section, **Then** a live preview of the chat overlay is visible showing real incoming messages.
2. **Given** the theme picker is open, **When** the streamer clicks a theme thumbnail, **Then** the preview panel updates to that theme instantly and the currently active theme for OBS Browser Sources also updates.
3. **Given** a theme is selected, **When** the streamer copies the OBS Browser Source URL, **Then** the URL includes the selected theme as a query parameter.

---

### User Story 6 - Stream Statistics (Priority: P2)

The dashboard displays live statistics per connected platform, including: **messages per minute**, **total messages received this session**, **unique chatters**, and **platform connection status** (connected, waiting, reconnecting, error). Statistics update in real-time. The streamer can view aggregate totals across all platforms and also drill down into per-platform breakdowns.

**Why this priority**: Understanding chat engagement in real-time helps streamers gauge audience interaction and identify which platforms are most active. Important for multi-platform streamers.

**Independent Test**: Connect to Twitch and YouTube, send messages from both, and verify the statistics panel shows accurate per-platform and aggregate counts that update in real-time.

**Acceptance Scenarios**:

1. **Given** the server is connected to Twitch and YouTube, **When** the streamer opens the Statistics section, **Then** they see per-platform cards showing messages/minute, total messages, and unique chatters.
2. **Given** messages are flowing in, **When** the streamer watches the statistics panel, **Then** numbers update in real-time without page refresh.
3. **Given** a platform connection drops, **When** the streamer views the platform health indicator, **Then** the status updates to "Reconnecting" or "Error" with a visual badge change.
4. **Given** the stream session is active, **When** the streamer views aggregate stats, **Then** they see combined totals across all platforms.
5. **Given** the streamer wants to track stats for a new segment, **When** they click "Reset Stats", **Then** all counters (messages/minute, total messages, unique chatters) reset to zero across all platforms.

---

### User Story 7 - Platform Connection Manager (Priority: P3)

The dashboard shows the live connection status of each configured platform (Twitch, YouTube, Kick, TikTok) with visual indicators (green = connected, yellow = waiting/reconnecting, red = error). The streamer can trigger a manual reconnect for any platform from the dashboard. Platform health includes last error message and time since last successful connection.

**Why this priority**: Diagnosing connection issues currently requires reading server console logs. A visual status panel makes this accessible to non-technical streamers.

**Independent Test**: Disconnect a platform (e.g., by ending the YouTube stream) and verify the status indicator changes. Click "Reconnect" and verify the connector attempts to reconnect.

**Acceptance Scenarios**:

1. **Given** all platforms are connected, **When** the streamer views the platform manager, **Then** each platform shows a green "Connected" status indicator.
2. **Given** a platform enters an error state, **When** the streamer views the platform manager, **Then** that platform shows a red indicator with the last error message and a "Reconnect" button.
3. **Given** the streamer clicks "Reconnect" on a failed platform, **Then** the connector re-initiates the connection handshake and the status updates accordingly.

---

### User Story 8 - Banned Words & Moderation Settings (Priority: P3)

The dashboard provides a section where the streamer can manage the moderation pipeline settings: add/remove banned words, toggle spam protection, choose the banned word action (mask, drop, or flag), and set the mask character. Changes take effect immediately on the running server without restart.

**Why this priority**: Currently banned words are hardcoded. Giving streamers control over moderation at runtime is important for content safety but not blocking for initial dashboard release.

**Independent Test**: Add a banned word via the dashboard, send a message containing that word, and verify it is masked/dropped according to the selected action.

**Acceptance Scenarios**:

1. **Given** the Moderation Settings panel is open, **When** the streamer adds a new banned word, **Then** subsequent messages containing that word are processed according to the selected action (mask/drop/flag).
2. **Given** the streamer changes the action from "mask" to "drop", **When** a message containing a banned word arrives, **Then** the message is silently dropped instead of masked.
3. **Given** the streamer removes a word from the banned list, **When** a message containing that word arrives, **Then** it passes through without any moderation action.

---

### Edge Cases

- What happens when the streamer opens the dashboard in multiple browser tabs simultaneously? (Settings should sync across tabs via WebSocket.)
- How does the dashboard behave when the server has zero connected platforms? (Show an empty state with setup instructions.)
- What happens when the streamer picks a font that is not installed on the system rendering the OBS overlay? (Fall back to a safe default web font.)
- What happens when the streamer clears chat while new messages are actively streaming in? (Clear should win; new messages arriving after the clear should display normally.)
- How does the dashboard handle extremely high message volume (500+ messages/minute)? (Statistics update at a capped interval; chat preview uses the same 50-message buffer as the overlay.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST serve a streamer-facing dashboard UI on the primary HTTP port (9090 by default) at the `/dashboard` route within the same React application that serves the overlay, using client-side routing to separate the dashboard from the overlay output (served at `/`).
- **FR-002**: System MUST provide a global color picker that changes the dashboard background color, with the selection persisted to local storage.
- **FR-003**: System MUST include a "Clear Chat" button that sends a moderation `clear_chat` event to all connected OBS overlays and clears the dashboard preview.
- **FR-004**: System MUST provide font customization controls (font family dropdown, font size slider, font weight selector) that broadcast style changes to all connected OBS Browser Sources in real-time via WebSocket.
- **FR-005**: System MUST render emote images inline within chat messages using the `fragments` array from the `ChatEvent` schema, displaying emote URLs as `<img>` elements at text-line height.
- **FR-006**: System MUST provide per-platform emote toggle switches (Twitch, YouTube, Kick, TikTok) and a global toggle, allowing the streamer to control emote visibility.
- **FR-007**: System MUST display a configurable timestamp on each chat message, supporting both relative ("2m ago") and absolute ("7:42 PM") formats, with a toggle to hide timestamps entirely.
- **FR-008**: System MUST display a live preview of the chat overlay within the dashboard that mirrors the OBS Browser Source output, including theme, font, and emote settings.
- **FR-009**: System MUST provide a visual theme picker showing all available themes with preview thumbnails, allowing the streamer to switch the active theme.
- **FR-010**: System MUST track and display real-time stream statistics per platform: messages per minute, total messages, unique chatters count, and connection status. System MUST include a "Reset Stats" button that zeroes all counters for a fresh mid-session tracking period.
- **FR-011**: System MUST display platform connection status with visual indicators (connected, waiting, reconnecting, error) and expose a manual "Reconnect" button per platform.
- **FR-012**: System MUST provide a moderation settings panel for managing banned words, toggling spam protection, selecting banned word actions (mask/drop/flag), and setting the mask character, with changes taking immediate effect.
- **FR-013**: System MUST broadcast all dashboard setting changes (font, theme, emote toggles, timestamps) to connected OBS overlays via WebSocket so they update in real-time without page reload.
- **FR-014**: System MUST persist display preferences (background color, font settings, emote toggles, timestamp mode, active theme) in browser local storage, and persist moderation/connector settings (banned words, spam protection toggle, moderation action type) in a server-side JSON config file, so that all settings survive server and browser restarts.
- **FR-015**: The Twitch and YouTube connectors MUST parse emote data from their respective platform payloads and populate the `fragments` array in each `ChatEvent` with properly structured `EmoteFragment` objects (containing `id`, `url`, and `alt` text), so that the overlay can render emote images inline.
- **FR-016**: System MUST accept dashboard commands (clear chat, reconnect platform, update moderation settings, change overlay settings) as JSON messages received over the existing WebSocket connection, using a bidirectional protocol. The server MUST process these commands and broadcast resulting state changes back to all connected clients on the same WebSocket channel.

### Key Entities

- **DashboardSettings**: Represents the full set of user-configurable preferences — background color, font family/size/weight, emote toggles (per-platform and global), timestamp mode, active theme, banned words list, and moderation action type.
- **PlatformStatus**: Represents the live state of a platform connector — platform name, connection status, last error, reconnect count, last connected timestamp.
- **StreamStatistics**: Represents real-time engagement metrics — messages per minute, total messages, unique chatter set, per-platform breakdown.
- **SettingsChangeEvent**: A WebSocket event broadcast from the dashboard to all connected overlays when any display setting changes, containing the setting key and new value.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Streamers can access and fully interact with the dashboard within 2 seconds of opening `http://localhost:9090`.
- **SC-002**: Font, theme, and emote changes made in the dashboard are reflected in the OBS overlay within 1 second.
- **SC-003**: Clearing chat removes all visible messages from both the dashboard preview and all connected OBS overlays within 500 milliseconds.
- **SC-004**: Stream statistics update in real-time with no more than a 2-second delay from when messages are received.
- **SC-005**: Platform connection status changes are reflected on the dashboard within 2 seconds of the actual status change.
- **SC-006**: All user preferences persist across server restarts and browser reloads with zero configuration loss.
- **SC-007**: Emote images render inline at the correct size without breaking text flow or message layout.
- **SC-008**: The dashboard remains responsive and usable at message rates of 500+ messages per minute across all platforms combined.

## Assumptions

- The streamer accesses the dashboard from the same machine running OBS and the local server (localhost access only).
- The existing overlay-ui React application will be extended to include the dashboard at the `/dashboard` route using client-side routing, while the overlay remains at `/`. Both share the same build pipeline and codebase.
- Font customization will use web-safe fonts and popular Google Fonts; the streamer does not need to install fonts locally on the OBS machine.
- Display preferences (background color, font, theme, emote toggles, timestamps) are persisted in browser local storage for instant load. Moderation and connector settings (banned words, spam toggle, moderation actions) are persisted in a server-side JSON config file so they apply across all connected clients.
- The Twitch and YouTube connectors do not currently populate the `fragments` array with emote data. Connector-level emote parsing is in-scope for this feature and must be implemented for emote rendering to function end-to-end. Kick and TikTok emote parsing is out of scope for the initial release.
- Statistics are session-scoped (reset when the server restarts) and can also be manually reset via a "Reset Stats" button in the dashboard for mid-session tracking. Historical statistics are not persisted.
- The dashboard is designed for desktop browsers; mobile responsiveness is a nice-to-have but not required for the initial release.
