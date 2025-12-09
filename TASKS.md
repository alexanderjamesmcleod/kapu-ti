# Kapu Tī - Task Tracker

**Project:** Te Reo Māori Card Game
**Status:** Active Development
**Last Updated:** 2025-12-10

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

## Current Sprint: Game Rules Implementation

### Completed: Scoring & Game Flow Refactor (2025-12-09) ✅
- [x] **Card ownership tracking** - Each card on table tracks who played it
- [x] **Round-end scoring** - ALL players who contributed cards get 10 pts/card
- [x] **Completion bonus** - Player who completes sentence gets 25 pts
- [x] **Streak system** - +10 pts per consecutive completion (caps at 50 max)
- [x] **Rejection flow** - Failed player gets 3 penalty cards, next player continues
- [x] **Discard phase** - Winner can optionally discard up to 2 cards
- [x] **Max 9 players** per table (was 10)
- [x] Added `discardCards()` and `skipDiscard()` actions
- [x] Updated types: `TableSlot.cardOwners`, `Player.sentenceStreak`
- [x] New phase: `discardSelect` between verification and topicSelect

### Completed: Desktop UI Polish (2025-12-10) ✅
- [x] **Responsive table height** - `min(400px, 50vh)` for different screens
- [x] **Better slot spacing** - Increased gap in sentence builder
- [x] **Larger avatars** - w-14 h-14 with dark background for contrast
- [x] **Dark theme hand section** - Matches overall game aesthetic
- [x] **Decluttered table** - Removed duplicate text displays
- [x] **Topic badge repositioned** - Now above table, not covering players
- [x] **Turn indicator moved** - Now in hand header, not on table
- [x] **Kōrero modal z-index fix** - Portal renders to body, no more avatar overlap

### Next Up: Discard UI & Polish
- [ ] Create discard selection UI component (select up to 2 cards)
- [ ] Add confirmation dialog for discard
- [ ] Show streak indicator on player seats
- [ ] Test full game loop with new scoring

### Previous: Sentence Pattern Refactor ✅ COMPLETE
- [x] Define sentence pattern schema (`src/types/sentencePattern.types.ts`)
- [x] Create pattern examples for each topic (8 patterns in `src/data/sentencePatterns.ts`)
- [x] Document color-to-word-type mapping (11 word types with bidirectional mapping)
- [x] Server-side pattern generation based on topic
- [x] Simplified MultiplayerSentenceBuilder (fixed slots from pattern)

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

### 2025-12-09 (Session 4 - Game Rules Implementation)
- Implemented new scoring system: all card contributors get points
- Added streak tracking for consecutive sentence completions
- Fixed rejection flow: 3 penalty cards, next player continues (not table reset)
- Added discard phase: winner can optionally discard up to 2 cards
- Card ownership tracking: `TableSlot.cardOwners[]` array
- New actions: `DISCARD_CARDS`, `SKIP_DISCARD`
- Updated max players to 9
- Files modified: scoring.ts, game-logic.ts, game-manager.ts, multiplayer.types.ts, useOnlineGame.ts, useMultiplayerGame.ts

### 2025-12-10 (Session 5 - UI Polish)
- **Table height**: Made responsive with `min(400px, 50vh)`
- **Slot spacing**: Increased gap from 1.5 to 3 in sentence builder
- **Player avatars**: Enlarged to w-14 h-14 with darker background for contrast
- **Hand section**: Dark themed (bg-slate-800) to match game aesthetic
- **Decluttered table center**: Removed duplicate sentence text, "played this turn" indicator
- **Topic badge**: Moved above table (was covering top player avatar)
- **Turn indicator**: Moved from table to hand header next to "Your Hand"
- **Kōrero modal fix**: Used React Portal to escape stacking context (avatar was overlaying modal)
- Files modified: GameTableV2.tsx, MultiplayerSentenceBuilder.tsx, room/page.tsx, KoreroButton.tsx
