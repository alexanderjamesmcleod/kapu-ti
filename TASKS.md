# Kapu Tī - Task Tracker

**Project:** Te Reo Māori Card Game
**Status:** Active Development
**Last Updated:** 2025-12-09

---

## Design Decisions

### Sentence Structure (2025-12-09)
- **Max 7 cards** per sentence (fits table with `sm` cards)
- Sentence patterns are **pre-generated** by server based on topic
- Players **match colors to slots** - no free-form building
- Removes complexity: no "add slot" button, predictable layout
- Game difficulty controlled via pattern generation

### Port Configuration (2025-12-09)
- Frontend (Next.js): **3100**
- WebSocket Server: **3102**
- Removed tunnelmole references, using cloudflared for tunneling

---

## Completed Tasks

### Infrastructure
- [x] WebSocket multiplayer server (port 3102)
- [x] Next.js frontend (port 3100)
- [x] Room creation/joining
- [x] Player lobby with ready states
- [x] Real-time game state sync
- [x] Voice chat integration (WebRTC)
- [x] Mobile/desktop responsive views
- [x] Scoring system (10 pts/card + topic bonuses)
- [x] Live score display in player seats
- [x] Game finished UI with leaderboard

### Vocabulary Database (2025-12-09)
- [x] Scraped 222 words from kupu.maori.nz
- [x] Extracted audio URLs for pronunciation (221/222 have audio)
- [x] Created `data/vocabulary.json` with word data
- [x] Identified verb types (transitive via passive suffixes)
- [x] Detected possession categories (a/o) where available

### Audio Playback (2025-12-09) ✅
- [x] Created `useAudio` hook for audio playback
- [x] Enhanced `wordLibrary.ts` with `getAudioUrl()` function
- [x] Audio lookup now supports all 222 vocabulary words (was 10 hardcoded)
- [x] Card component already had audio UI - just needed better data layer

### Vocabulary Classification (2025-12-09) ✅
- [x] Created classification script (`scripts/classify-vocabulary.ts`)
- [x] All 222 words classified with partOfSpeech, category, color
- [x] Added 47 essential grammar words (`src/data/grammarWords.ts`)
- [x] Created `vocabulary-classified.json` ready to activate
- [x] Updated `wordLibrary.ts` with category-based filtering functions

---

## Current Sprint: Sentence Pattern Refactor

### Task 1: Document Sentence Patterns ✅ COMPLETE
- [x] Define sentence pattern schema (`src/types/sentencePattern.types.ts`)
- [x] Create pattern examples for each topic (8 patterns in `src/data/sentencePatterns.ts`)
- [x] Document color-to-word-type mapping (11 word types with bidirectional mapping)

### Task 2: Server-Side Pattern Generation
- [ ] Modify `server/game-logic.ts` to generate pre-filled patterns
- [ ] Create pattern generator based on topic
- [ ] Remove `canCreateSlot` logic
- [ ] Patterns include: slot colors, expected word types, target sentence

### Task 3: Simplify MultiplayerSentenceBuilder
- [ ] Remove "add new slot" button
- [ ] Slots are read-only structure (just color targets)
- [ ] Players can only place matching color cards
- [ ] Show target sentence hint (optional/configurable)

### Task 4: Fix Table Layout
- [ ] Ensure table doesn't shrink with content
- [ ] Remove scrollbar approach
- [ ] Fixed 7-card max means predictable layout

### Task 5: Card Generation per Topic
- [ ] Generate hands that can complete the pattern
- [ ] Include some "wrong" cards for challenge
- [ ] Balance difficulty

---

## Backlog

### Gameplay
- [ ] Topic selection UI improvements
- [ ] Turn timer adjustments
- [ ] Bot AI improvements
- [ ] End-game statistics

### Polish
- [ ] Sound effects refinement
- [ ] Animations for card placement
- [ ] Celebration effects on completion
- [ ] Tutorial/onboarding flow

### Content
- [ ] Expand topic library
- [ ] Add more sentence patterns per topic
- [ ] Difficulty levels (beginner/intermediate/advanced)
- [ ] Vocabulary progression system

---

## Technical Debt

- [ ] Clean up unused code from free-form building approach
- [ ] Consolidate card size definitions
- [ ] Type safety improvements in game state

---

## Architecture Notes

```
┌─────────────────────────────────────────────┐
│              Kapu Tī Architecture           │
├─────────────────────────────────────────────┤
│  Frontend (Next.js) - Port 3100             │
│  ├─ /play/room - Main game UI               │
│  ├─ Components: GameTable, CardHand, etc    │
│  └─ Hooks: useOnlineGame, useVoiceChat      │
├─────────────────────────────────────────────┤
│  WebSocket Server - Port 3102               │
│  ├─ game-manager.ts - Room/player state     │
│  ├─ game-logic.ts - Turn flow, scoring      │
│  ├─ scoring.ts - Point calculations         │
│  └─ handlers.ts - Message routing           │
├─────────────────────────────────────────────┤
│  Shared Types                               │
│  └─ multiplayer.types.ts                    │
└─────────────────────────────────────────────┘
```

---

## Session Log

### 2025-12-09 (Session 1)
- Changed ports to 3100/3102 to avoid conflicts
- Removed tunnelmole references (using cloudflared)
- Identified table shrinking CSS issue
- **Design Decision:** Fixed sentence patterns, max 7 cards
- Created TASKS.md for tracking

### 2025-12-09 (Session 2 - Vocabulary Scraper)
- Used Chrome DevTools MCP to scrape kupu.maori.nz
- Discovered audio URL pattern: `https://kupu.maori.nz/blobs/Audio/{word}.mp3`
- Created `data/vocabulary.json` with 222 words
- Audio URLs tested and working (HTTP 200, audio/mpeg)
- Data includes: word, english, isVerb, possession, audioUrl
- Created `scripts/scrape-vocabulary.ts` for future updates

### 2025-12-09 (Session 3 - Parallel CC Tasks)
- Ran 3 CC subagents in parallel via AI Kitchen
- **Audio Playback**: useAudio hook, expanded audio lookup to 222 words
- **Sentence Patterns**: 8 patterns, 7 helper functions, full type system
- **Vocabulary Classification**: 222 words classified, 47 grammar words added
- All tasks completed and moved to kitchen/REVIEW/
- Total new code: ~1000+ lines across multiple files
