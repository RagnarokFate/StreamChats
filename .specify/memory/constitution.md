<!--
SYNC IMPACT REPORT
Version change: [NEW] -> 1.0.0
Modified principles: 
  - [PRINCIPLE_1_NAME] -> Local-First Execution
  - [PRINCIPLE_2_NAME] -> Stability for Long Sessions
  - [PRINCIPLE_3_NAME] -> Open-Source Extensibility
  - [PRINCIPLE_4_NAME] -> Branch Strategy
  - [PRINCIPLE_5_NAME] -> Commit Convention
Added sections: Architecture & Performance Standards, Security & Moderation
Removed sections: None
Templates requiring updates: None currently, standard specs apply.
Follow-up TODOs: None.
-->
# OBS Chat Aggregator Constitution

## Core Principles

### I. Local-First Execution
The architecture MUST prioritize local-first execution. The engine should run with low resources and minimal external API dependency, relying on direct stream URLs for realtime chat fusion where possible.

### II. Stability for Long Sessions
Stability is critical for extended broadcasting. The implementation MUST include an anti-memory-leak architecture and robust failure recovery/reconnection mechanisms to ensure continuous operation over long streaming sessions.

### III. Open-Source Extensibility
The platform MUST provide a flexible Connector Framework and OBS Plugin architecture. It should allow the open-source community to easily develop and integrate new platform extractors (e.g., via Playwright DOM mutation models).

### IV. Branch Strategy (Non-Negotiable)
Development MUST follow a strict branching model:
- `main` branch is strictly reserved for stable releases.
- `dev` branch is used for active development and integration.
Feature branches should branch off `dev` and merge back into `dev`.

### V. Commit Convention
Commit messages MUST be brief, professional, and strictly contain NO emojis. They MUST follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `docs:`) to maintain a clean and readable project history.

## Architecture & Performance Standards

The core extraction mechanism (including the WebSocket interception model and DOM mutation extraction) and the local overlay rendering engine MUST be highly optimized for OBS Studio compatibility. They should have minimal overhead to ensure stream encoding performance is not degraded.

## Security & Moderation

A secure environment is required. The system MUST include a comprehensive moderation pipeline to filter unwanted content before it reaches the OBS overlay. The local overlay server design must adhere to strict security constraints to prevent unauthorized access.

## Governance

This Constitution supersedes all other practices. All Pull Requests and code reviews MUST verify compliance with these core principles, particularly the branching strategy, commit conventions, and performance guidelines. Any proposed amendments to these principles require documentation and consensus before adoption.

**Version**: 1.0.0 | **Ratified**: 2026-05-25 | **Last Amended**: 2026-05-25
