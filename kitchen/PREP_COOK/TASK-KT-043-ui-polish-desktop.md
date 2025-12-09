# TASK-KT-043: UI Polish for Desktop Game View

**Priority:** Medium  
**Estimate:** 2-3 hours  
**Type:** UI Improvement  

---

## Context

The table shrinking bug is fixed (see `docs/BUGFIX-TABLE-SHRINKING.md`). Now we need to polish the desktop game UI for better proportions and visual balance.

## Goals

Make the desktop playing view feel more balanced, spacious, and visually cohesive.

## Specific Improvements

### 1. Table Height - Responsive

**Current:** Fixed `h-[400px]`

**Change to:** Responsive height that works on smaller screens

```tsx
style={{ 
  width: 'min(900px, calc(100vw - 32px))',
  height: 'min(400px, 50vh)'
}}
```

### 2. Sentence Builder - More Breathing Room

**File:** `/src/components/MultiplayerSentenceBuilder.tsx`

- Increase gap between card slots: `gap-1.5` → `gap-2` or `gap-3`
- Add more padding to the container
- Consider slightly larger card size in slots

### 3. Player Avatars - Better Visibility

**File:** `/src/components/GameTableV2.tsx` (PlayerSeatCompact)

- Increase avatar size: `w-12 h-12` → `w-14 h-14`
- Add subtle shadow for better contrast against table
- Increase name text size slightly

### 4. Hand Section - Theme Consistency

**File:** `/src/app/play/room/page.tsx` (Hand section around line 935)

**Current:** `bg-white/95` - stark white that clashes with dark theme

**Options:**
- A) Darker theme: `bg-gray-800/95 border border-gray-700`
- B) Teal accent: `bg-teal-900/90 border border-teal-700`
- C) Gradient: `bg-gradient-to-b from-gray-800 to-gray-900`

Also adjust text colors to match if background changes.

### 5. Overall Spacing

- Review vertical spacing between table and hand section
- Ensure consistent padding throughout
- Check that nothing feels cramped on 1366x768 screens

## Testing Checklist

- [ ] Test on 1920x1080 (full HD)
- [ ] Test on 1366x768 (common laptop)
- [ ] Test on 2560x1440 (larger displays)
- [ ] Verify table doesn't shrink (regression check)
- [ ] Cards readable at all sizes
- [ ] Player names visible
- [ ] Hand section usable and attractive

## Files to Modify

- `/src/components/GameTableV2.tsx`
- `/src/components/MultiplayerSentenceBuilder.tsx`
- `/src/app/play/room/page.tsx`

## Notes

- Do NOT change the width calculation that fixed the shrinking bug
- Keep mobile view (MobileGameView.tsx) unchanged for now
- Prioritize readability and usability over flashiness

---

**Created:** 2025-12-09  
**Assigned:** cc  
**Status:** PENDING
