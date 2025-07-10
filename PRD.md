# Hemingway Editor Clone - Product Requirements Document (PRD)

## Document History
| Date | Version | Author | Description |
|------|---------|--------|-------------|
| 2025-07-10 | 0.1 | AI assistant | Initial draft |

## Purpose
Provide an internal, offline-capable web application that helps writers refine text by highlighting readability issues, inspired by the public Hemingway Editor. The tool targets employees on the corporate intranet.

## Goals & Objectives
1. Improve clarity and simplicity of written communication.
2. Offer immediate, actionable feedback within the editor.
3. Operate fully offline—no 3rd-party requests once loaded.
4. Deliver a delightful, responsive UI consistent with modern design guidelines.

## Key Personas
- **Staff Writer** – Creates or refines reports, wants quick feedback.
- **Team Lead** – Reviews documents, wants readability metrics.
- **IT Administrator** – Deploys and maintains the app inside intranet.

## User Stories
1. As a writer, I can paste or type text and see readability highlights in real-time.
2. As a writer, I can toggle between “Write” and “Edit” modes to focus or refine.
3. As a writer, I can view counts for words, characters, sentences, paragraphs, and estimated reading time.
4. As a writer, I can export the refined text to plain text or copy it to the clipboard.
5. As a writer, I can switch between light and dark themes for comfort.
6. As an IT admin, I can deploy the app without external dependencies so that it works in an air-gapped network.

## Functional Requirements
FR-1 Text editor allows typing, pasting, undo/redo.  
FR-2 Real-time analysis of the current document identifying:
  • Passive voice instances  
  • Adverbs (words ending in ‑ly)  
  • Complex phrases with simpler alternatives (configurable list)  
  • Sentences > 20 words (hard)  
  • Sentences > 30 words (very hard)  
FR-3 Color-coded highlights for each issue type.  
FR-4 Sidebar displaying:
  • Readability grade (Automated Readability Index)  
  • Total counts per issue type  
  • Document statistics (words, sentences, etc.)  
FR-5 Toggle to enable/disable each highlight category.  
FR-6 Modes:  
  • Write Mode – plain editor with minimal UI  
  • Edit Mode – shows highlights and sidebar  
FR-7 Import (.txt, .md) and Export (.txt, .md, clipboard).  
FR-8 Theme switcher (light/dark, system default).  
FR-9 All processing done client-side; no network calls after initial load.  
FR-10 Application must load in < 2 s on a modern intranet workstation.

## Non-Functional Requirements
NFR-1 Availability: 99.9 % inside intranet.  
NFR-2 Performance: <50 ms analysis latency for 5 k words.  
NFR-3 Security: Operates with Content Security Policy blocking external calls.  
NFR-4 Accessibility: WCAG 2.1 AA compliance.  
NFR-5 Browser support: Latest Chrome, Edge (Chromium).  
NFR-6 Maintainability: Codebase documented, unit-tested to >90 % coverage.

## Assumptions / Constraints
- No external APIs (grammar or AI).  
- Tech stack chosen: JavaScript (ES2023), React, Tailwind CSS, shadcn UI.  
- Deployed as static files behind corporate web server.

## Success Metrics
- >80 % of users report the tool helped improve clarity (survey).  
- p95 page-load < 2 s; p95 keystroke-to-highlight < 60 ms.  
- Zero external HTTP requests observed in audit.

## Out of Scope
- Real-time collaborative editing.  
- AI-generated rewrite suggestions.  
- Mobile native apps.

## Risks & Mitigations
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Text parser false positives | Medium | Medium | Unit tests + user toggle |
| Performance degradation on large docs | High | Medium | Web Worker offload |
| Tailwind version drift | Low | Low | Pin versions in lockfile | 