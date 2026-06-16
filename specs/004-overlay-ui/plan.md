# Implementation Plan: Overlay UI

**Branch**: `004-overlay-ui` | **Date**: 2026-06-16 | **Spec**: [spec.md](file:///c:/Users/basha/Desktop/root/StreamChats/StreamChats/specs/004-overlay-ui/spec.md)

## Summary

The Overlay UI is a beautiful, animated frontend built with React and Vite. It connects to the Local Server's WebSocket (`ws://localhost:9090`) to ingest live chat and moderation events. The UI utilizes advanced CSS techniques (glassmorphism, vibrant gradients, and micro-animations) to present a premium experience tailored for OBS Browser Sources.

## Technical Context

**Language/Version**: React 18+, TypeScript, Vite
**Primary Dependencies**: `react`, `react-dom`
**Styling**: Vanilla CSS (Strict requirement: NO Tailwind unless explicitly requested. Custom tokens, glassmorphism, keyframe animations).
**Project Type**: Monorepo App (React SPA)
**Performance Goals**: <50ms rendering latency, transparent background, buttery smooth CSS transitions.

## Constitution Check

*GATE: Passed*
- **Aesthetics & UI**: Meets the mandate for premium, vibrant, and dynamic design aesthetics using Vanilla CSS.
- **Optimized for OBS**: Backgrounds are transparent (`rgba(0,0,0,0)`) so the game feed is visible underneath the chat bubbles.
- **Moderation Sync**: Implements `timeout` and `ban` processing on the UI side to immediately wipe offensive content from the screen.

## Project Structure

### Documentation (this feature)

```text
specs/004-overlay-ui/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
└── tasks.md             
```

### Source Code (repository root)

```text
apps/overlay-ui/
├── index.html
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx          # Main WebSocket integration and state management
│   ├── index.css        # Premium CSS tokens and animation keyframes
│   └── components/
│       ├── ChatFeed.tsx # Renders the list of messages with enter/exit animations
│       └── ChatMessage.tsx # Individual message bubble with platform iconography
```
