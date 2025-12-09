# Session Summary: TASK-KT-042 - GameTable Shrinking Bug Fix

**Date:** 2025-12-09
**Task:** Fix GameTable shrinking when cards are played
**Model:** Opus 4.5
**Branch:** main
**Commit:** a07255b

## What Was Done

- Rebuilt GameTable component as GameTableV2 with new architecture
- Fixed persistent layout shrinking bug that occurred when cards were played
- Documented root cause and solution for future reference

## Files Modified

- `src/components/GameTableV2.tsx` - NEW: Complete rebuild with 3-layer architecture
- `src/components/index.ts` - Added GameTableV2 export
- `src/app/play/room/page.tsx` - Swapped GameTable to GameTableV2

## Root Cause Analysis

### The Problem
The GameTable would shrink progressively each time a card was played. Multiple CSS fixes were attempted (flex-shrink-0, min-height, fixed heights) - all failed.

### The Actual Cause
```
w-full max-w-[900px]  ← BROKEN
```

`w-full` means "100% of parent width". In nested flexbox:
1. React re-renders when game state changes (card played)
2. Flexbox asks "what's my parent's width?"
3. Parent recalculates its width
4. Child recalculates based on new parent width
5. Cascade causes progressive shrinking

### The Fix
```css
width: min(900px, calc(100vw - 32px))  ← FIXED
```

Viewport-based calculation (`100vw`) has NO parent dependency. Browser computes the value directly from viewport, not from parent chain.

## Key Pattern: Flexbox Layout Stability

### AVOID in nested flexbox (causes instability):
- `w-full` (100% of parent)
- Percentage widths (`w-1/2`, `w-3/4`)
- `flex-1` on frequently re-rendering elements

### USE instead (stable):
- Fixed pixel values (`w-[400px]`)
- Viewport units (`100vw`, `100vh`)
- `calc()` with viewport units (`calc(100vw - 32px)`)
- `min()`/`max()` with viewport units

### The Rule
**In nested flexbox, avoid relative widths on elements that re-render frequently. Use viewport units or fixed pixel values instead.**

## Architecture: GameTableV2

3-layer absolute positioning:
```
GameTableV2 (relative, fixed height, viewport-based width)
├── Layer 1 (z-0): Oval background - pure decoration, pointer-events-none
├── Layer 2 (z-10): Content grid - CSS Grid with fixed row tracks
└── Layer 3 (z-20): Players - absolutely positioned around edges
```

Key CSS:
```tsx
<div
  className="relative h-[400px] mx-auto flex-shrink-0"
  style={{ width: 'min(900px, calc(100vw - 32px))' }}
>
```

- `h-[400px]` - Fixed height, immune to content changes
- `flex-shrink-0` - Prevents flex parent from shrinking it
- `width: min(...)` - Viewport-based, no parent dependency
- CSS Grid `grid-rows-[40px_1fr_40px]` - Fixed row tracks

## Challenges & Solutions

- **Challenge:** Multiple CSS fixes failed (flex-shrink-0, min dimensions, fixed heights)
- **Solution:** Root cause was WIDTH not height. Changed from parent-relative to viewport-relative width.

- **Challenge:** Needed responsive behavior without parent dependency
- **Solution:** `min(900px, calc(100vw - 32px))` gives max 900px but shrinks on small screens

## Token Usage

- Estimated tokens: ~8,000
- Model: Opus 4.5

## Commits

- `a07255b` - fix: Rebuild GameTable to prevent shrinking when cards played

## Tags

#flexbox #css #layout #react #performance #debugging #kapu-ti
