# HANDOVER: Kapu Tī - UI Polish Phase

**Date:** December 9, 2025  
**Project:** `/home/alex/ai-kitchen/projects/kapu-ti`  
**Stack:** Next.js 15 + Turbopack, WebSocket server on 3102, frontend on 3100  
**Restart:** `./restart.sh`

---

## What Is Kapu Tī

Te Reo Māori multiplayer card game. Players build sentences by placing colored word cards into slots. Real-time multiplayer via WebSocket.

---

## What Just Got Fixed

**Table shrinking bug** - RESOLVED ✅

The game table was shrinking horizontally every time a card was played. After 3+ hours and 10+ failed attempts, the fix was changing from relative width (`w-full max-w-[900px]`) to fixed/viewport width:

```tsx
style={{ width: 'min(900px, calc(100vw - 32px))' }}
```

Full details: `docs/BUGFIX-TABLE-SHRINKING.md`

---

## Current State

- Desktop game view is functional, table no longer shrinks
- GameTableV2 component replaced the old GameTable
- Mobile view (MobileGameView.tsx) is separate and unchanged
- UI works but needs polish

---

## Next Task

**TASK-KT-043: UI Polish for Desktop Game View**

Location: `kitchen/PREP_COOK/TASK-KT-043-ui-polish-desktop.md`

Key improvements needed:
1. **Table height** - Make responsive: `height: min(400px, 50vh)`
2. **Sentence builder** - More spacing between card slots
3. **Player avatars** - Slightly larger (w-14 h-14), better contrast
4. **Hand section** - Dark theme to match (currently stark white)
5. **Overall spacing** - Balance for common screen sizes

---

## Key Files

- `/src/components/GameTableV2.tsx` - The fixed table component
- `/src/components/MultiplayerSentenceBuilder.tsx` - Card slots in center
- `/src/app/play/room/page.tsx` - Main game page (desktop around line 870+)
- `/src/components/MobileGameView.tsx` - Mobile layout (ignore for now)

---

## Important Warning

**DO NOT** change the width calculation in GameTableV2.tsx:
```tsx
style={{ width: 'min(900px, calc(100vw - 32px))' }}
```
This fixed the shrinking bug. Use viewport/fixed values, not `w-full` or percentages.

---

## Testing

1. Start game: `./restart.sh`
2. Open two browser tabs to http://localhost:3100/play/room
3. Create room in tab 1, join with code in tab 2
4. Select topic, play cards
5. Verify table doesn't shrink, UI looks balanced

---

## Alex's Preferences

- Brief explanations, no code dumps in chat
- Use Desktop Commander for all file operations
- Write code directly to files, don't show in chat
- Confirm before using any 3rd party tools
