# Recipe: Leaderboard & Scoring System

**Project:** Kapu Ti
**Created:** 2025-12-08
**Status:** Planning
**Backup Branch:** `backup-leaderboard-pwa-dec8` (contains previous attempt)

## Goal

Add a scoring and leaderboard system to Kapu Ti that tracks player performance across games.

## Lessons Learned (Dec 8 Rollback)

The previous attempt failed because:
1. UI layout changes (mobile/PWA) were bundled with scoring logic
2. Changes weren't atomic - hard to revert specific parts
3. No testing checkpoints between changes
4. CSS flexbox issues caused table shrinking when cards were played

## Rules for This Recipe

- **One task = one commit**
- **Test after every server change** - play a full game loop
- **NO layout/CSS overhauls** - only minimal UI changes to display scores
- **Mobile/PWA is a SEPARATE recipe**

---

## Phase 1: Server-Side Scoring (No UI Changes)

### TASK-SCORE-1: Add score field to player state
- [ ] Add `score: number` to Player type in `server/game-logic.ts`
- [ ] Initialize to 0 when player joins
- [ ] Ensure score is included in game state broadcasts
- **Test:** Start game, verify no errors, score field exists in state

### TASK-SCORE-2: Create scoring logic module
- [ ] Create `server/scoring.ts` with pure functions
- [ ] `calculateTurnScore(playedCards, topic)` - returns points
- [ ] Base scoring: 10 points per card played
- [ ] Bonus: +5 if cards match topic
- [ ] Export functions, no side effects
- **Test:** Unit test the functions manually

### TASK-SCORE-3: Integrate scoring into game flow
- [ ] Import scoring module into `game-manager.ts`
- [ ] Call `calculateTurnScore()` when turn is submitted
- [ ] Update player's score in game state
- [ ] Broadcast updated state
- **Test:** Play full game, check scores update correctly

### CHECKPOINT: Full Game Test
- [ ] Create room, add bot
- [ ] Play 3+ rounds
- [ ] Verify table doesn't shrink
- [ ] Verify scores accumulate
- [ ] Verify no console errors

---

## Phase 2: Minimal UI - Score Display

### TASK-SCORE-4: Show score in player seat (desktop)
- [ ] Modify `PlayerSeatCompact` in `GameTable.tsx`
- [ ] Add score display next to cards count: `🃏 5 ⭐ 30`
- [ ] NO other layout changes
- **Test:** Visual check, verify table still renders correctly

### TASK-SCORE-5: Show score in game header
- [ ] Add current player's score to turn indicator area
- [ ] Simple text: "Your score: 30"
- [ ] NO layout restructuring
- **Test:** Play game, verify display updates

### CHECKPOINT: UI Test
- [ ] Play full game on desktop
- [ ] Verify scores display correctly
- [ ] Verify table doesn't shrink when playing cards
- [ ] Verify no CSS regressions

---

## Phase 3: Game End & Persistence

### TASK-SCORE-6: Add game finished phase
- [ ] Add `finished` to game phases
- [ ] Trigger when deck is empty OR player reaches target score
- [ ] Broadcast final scores to all players
- **Test:** Play until game ends naturally

### TASK-SCORE-7: Game finished UI
- [ ] Show final scores sorted by rank
- [ ] Simple modal or overlay (NOT full layout change)
- [ ] "Play Again" button returns to lobby
- **Test:** Complete game, verify end screen

### TASK-SCORE-8: Leaderboard persistence (SQLite)
- [ ] Create `server/leaderboard.ts`
- [ ] SQLite database in `data/leaderboard.db`
- [ ] Functions: `saveScore()`, `getTopScores()`, `checkHighScore()`
- [ ] Store: name, score, date
- **Test:** Verify data persists across server restarts

### TASK-SCORE-9: High score check
- [ ] After game ends, check if score qualifies for top 10
- [ ] Send `HIGH_SCORE_QUALIFIED` event to player
- [ ] Include rank position
- **Test:** Get high score, verify event fires

### TASK-SCORE-10: High score modal
- [ ] Simple celebratory modal when player gets high score
- [ ] Show rank achieved
- [ ] NO confetti/animations (keep it simple)
- **Test:** Achieve high score, verify modal appears

---

## Phase 4: Leaderboard Display (Optional)

### TASK-SCORE-11: Leaderboard sidebar (desktop only)
- [ ] Add collapsible sidebar on right side
- [ ] Show top 10 scores
- [ ] Highlight current player's best
- [ ] Only show on desktop (hidden on mobile)
- **Test:** Verify doesn't affect game table layout

---

## Out of Scope (Separate Recipes)

These should be their own recipes:
- [ ] Mobile/PWA layout improvements
- [ ] Responsive design overhaul
- [ ] Service worker / offline support
- [ ] App icons and manifest

---

## Reference: Code from Backup Branch

The backup branch `backup-leaderboard-pwa-dec8` contains:
- `server/leaderboard.ts` - Persistence module (reusable)
- `server/scoring.ts` - Scoring logic (reusable)
- `src/components/Leaderboard.tsx` - Sidebar component
- `src/components/HighScoreModal.tsx` - Celebration modal

These can be cherry-picked or used as reference, but should be integrated one at a time with testing.

---

## How to Use This Recipe

1. Move individual TASKs to `kitchen/PREP_COOK/` when ready to implement
2. Complete one task, commit, test
3. Only proceed to next task after checkpoint passes
4. If any task breaks gameplay, revert that single commit
