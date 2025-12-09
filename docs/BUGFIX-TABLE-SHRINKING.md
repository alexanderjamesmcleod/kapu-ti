# Bugfix: Table Shrinking on Card Play

**Date:** December 9, 2025  
**Status:** ✅ RESOLVED  
**Time spent:** ~3 hours debugging  

---

## The Problem

When a card was played in the game, the entire game table container would shrink horizontally. Each successive card played caused further shrinking, making the game unplayable.

## What We Tried (All Failed)

1. Added `flex-shrink-0` to GameTable
2. Added `min-h-[200px]` to center content area
3. Added `min-w-[320px]` to GameTable
4. Changed `overflow-y-auto` to `overflow-y-scroll`
5. Added `scrollbar-gutter: stable` CSS
6. Changed from percentage height to fixed pixel heights
7. Made sentence display always visible with min dimensions
8. Rebuilt GameTable as GameTableV2 with CSS Grid and layered architecture
9. Added `[&>*]:flex-shrink-0` to parent container
10. Removed flex layout from parent container

## The Root Cause

The table used `w-full max-w-[900px]` for width. 

- `w-full` = 100% of parent width
- This gets **recalculated on every React re-render**
- When game state changed (card played), React re-rendered
- Flexbox layout algorithm recalculated parent width slightly differently
- Caused cascading shrink effect

## The Fix

**Before (broken):**
```tsx
<div className="relative w-full max-w-[900px] h-[400px] ...">
```

**After (fixed):**
```tsx
<div 
  className="relative h-[400px] mx-auto flex-shrink-0"
  style={{ width: 'min(900px, calc(100vw - 32px))' }}
>
```

## Why It Works

Fixed/viewport-based width is computed **once** and doesn't depend on parent calculations. The browser doesn't need to ask "what's my parent's width?" - it just uses the explicit value.

**Key insight:** Relative widths (`w-full`, percentages) in nested flexbox = layout instability. Fixed/viewport widths = stable.

## Files Modified

- `/src/components/GameTableV2.tsx` - New table component with fixed width
- `/src/components/index.ts` - Updated export
- `/src/app/play/room/page.tsx` - Swapped to GameTableV2

## Lesson Learned

When dealing with complex nested flexbox layouts that re-render frequently:
- Avoid `w-full` or percentage widths on containers that must stay stable
- Use explicit pixel values or viewport units (`vw`, `min()`)
- Test layout stability by adding visible borders during debug
