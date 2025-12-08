# Recipe: Mobile & PWA Improvements

**Project:** Kapu Ti
**Created:** 2025-12-08
**Status:** Planning (DO NOT START until Leaderboard is stable)
**Backup Branch:** `backup-leaderboard-pwa-dec8` (contains previous attempt)

## Goal

Make Kapu Ti work well on mobile devices and as a Progressive Web App.

## Lessons Learned (Dec 8 Rollback)

The previous attempt caused issues because:
1. CSS changes affected desktop layout (table shrinking)
2. Mobile view was introduced mid-feature development
3. Layout changes weren't isolated or tested independently

## Rules for This Recipe

- **DO NOT bundle with other features**
- **Test on BOTH desktop and mobile after each change**
- **Start with mobile detection, then add views**
- **Keep desktop layout unchanged initially**

---

## Prerequisites

- [ ] Leaderboard recipe completed and stable
- [ ] Full game playable on desktop without issues

---

## Phase 1: Mobile Detection (No Visual Changes)

### TASK-MOBILE-1: Add mobile detection hook
- [ ] Create `hooks/useIsMobile.ts`
- [ ] Detect screen width < 768px
- [ ] Detect touch capability
- [ ] Export `useIsMobile()` and `useIsLandscape()`
- **Test:** Console log values on desktop vs mobile

### TASK-MOBILE-2: Add breakpoint-based rendering
- [ ] In room page, conditionally render based on `isMobile`
- [ ] For now, render SAME content for both
- [ ] Just add the conditional structure
- **Test:** Verify desktop still works perfectly

---

## Phase 2: Mobile Layout (New View, Not Replacement)

### TASK-MOBILE-3: Create MobileGameView component
- [ ] New component `MobileGameView.tsx`
- [ ] Copy basic structure from desktop
- [ ] Simplified layout: players top, sentence middle, cards bottom
- [ ] NO changes to GameTable.tsx
- **Test:** Render on mobile, verify basic display

### TASK-MOBILE-4: Mobile card sizing
- [ ] Add 'xs' card size option
- [ ] Smaller cards for mobile (56x80px)
- [ ] Hide audio button on xs cards
- **Test:** Cards display correctly on small screens

### TASK-MOBILE-5: Mobile hand scroll
- [ ] Horizontal scrollable card hand
- [ ] Snap scrolling
- [ ] Touch-friendly
- **Test:** Can scroll through cards on mobile

### CHECKPOINT: Mobile Playtest
- [ ] Play full game on mobile device
- [ ] Play full game on desktop (verify no regression)
- [ ] Both should work independently

---

## Phase 3: PWA Infrastructure

### TASK-PWA-1: Add manifest.json
- [ ] Create `public/manifest.json`
- [ ] App name, icons, colors
- [ ] Display mode: standalone
- **Test:** Can add to home screen

### TASK-PWA-2: Add app icons
- [ ] Create 192x192 and 512x512 icons
- [ ] Apple touch icon
- [ ] Favicon update
- **Test:** Icons appear when installed

### TASK-PWA-3: Service worker (basic)
- [ ] Create `public/sw.js`
- [ ] Cache static assets only
- [ ] NO offline gameplay yet
- **Test:** Assets cached, app loads faster

### TASK-PWA-4: Safe area handling
- [ ] Add CSS for notched devices
- [ ] env(safe-area-inset-*) padding
- [ ] Test on iPhone with notch
- **Test:** Content not cut off by notch

---

## Phase 4: Responsive Polish

### TASK-MOBILE-6: Landscape mode
- [ ] Detect landscape orientation
- [ ] Adjust layout for landscape
- [ ] Players on side, cards at bottom
- **Test:** Rotate device, layout adjusts

### TASK-MOBILE-7: Touch improvements
- [ ] Larger tap targets
- [ ] Touch-friendly buttons
- [ ] Prevent double-tap zoom
- **Test:** Easy to tap all interactive elements

---

## Out of Scope

- Offline gameplay (requires significant server changes)
- Push notifications
- Background sync

---

## Reference: Code from Backup Branch

The backup branch contains:
- `hooks/useIsMobile.ts` - Detection hook
- `components/MobileGameView.tsx` - Mobile layout (needs review)
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service worker
- CSS in `globals.css` - `.game-viewport`, `.safe-area-all`, etc.

Review carefully before reusing - some CSS caused the table shrinking issue.
