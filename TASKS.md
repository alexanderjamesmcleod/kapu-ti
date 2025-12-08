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

---

## Current Sprint: Sentence Pattern Refactor

### Task 1: Document Sentence Patterns
- [ ] Define sentence pattern schema
- [ ] Create pattern examples for each topic
- [ ] Document color-to-word-type mapping

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

### 2025-12-09
- Changed ports to 3100/3102 to avoid conflicts
- Removed tunnelmole references (using cloudflared)
- Identified table shrinking CSS issue
- **Design Decision:** Fixed sentence patterns, max 7 cards
- Created TASKS.md for tracking
