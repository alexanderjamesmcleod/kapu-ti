# TASK-KT-042: Rebuild GameTable Component

**Priority:** High  
**Estimate:** 2-3 hours  
**Type:** Bug Fix / Refactor  

---

## Problem

The current GameTable component shrinks when cards are played. Multiple CSS fixes have been attempted and all failed. Root cause is nested flexbox with percentage-based sizing causing layout recalculation on every state change.

## Solution

Rebuild GameTable using a simpler architecture with fixed dimensions and layered absolute positioning.

## Design Specification

### Architecture: 3 Absolute Layers

```
GameTableV2 (relative container, fixed height)
├── Layer 1: Oval Background (z-0) - decoration only
├── Layer 2: Content Grid (z-10) - topic, builder, turn indicator  
└── Layer 3: Players (z-20) - avatars positioned around edges
```

### Container

```tsx
<div className="relative w-full max-w-[900px] h-[400px] mx-auto">
  {/* layers inside */}
</div>
```

- Fixed height: 400px (never changes)
- Max width: 900px
- No flexbox on container

### Layer 1: Oval Background (z-0)

```tsx
<div 
  className="absolute inset-[5%] rounded-[50%] pointer-events-none"
  style={{
    background: 'linear-gradient(to bottom right, #0f766e, #134e4a)',
    border: '8px solid #78350f',
    boxShadow: `
      inset 0 0 60px rgba(0,0,0,0.3),
      0 8px 32px rgba(0,0,0,0.4),
      0 0 0 4px #5c3d2e,
      0 0 0 8px #3d2517
    `
  }}
>
  {/* Inner felt + texture - same as current */}
</div>
```

- `pointer-events-none` - doesn't interfere with clicks
- Pure decoration, no content

### Layer 2: Content Grid (z-10)

```tsx
<div className="absolute inset-0 z-10 grid grid-rows-[40px_1fr_40px] p-8">
  {/* Row 1: Topic indicator */}
  <div className="flex items-center justify-center">
    {currentTopic && (
      <div className="px-3 py-1.5 bg-white/95 rounded-full shadow-lg text-sm">
        <span>{currentTopic.icon}</span>
        <span className="ml-2 font-bold text-teal-800">{currentTopic.name}</span>
      </div>
    )}
  </div>
  
  {/* Row 2: Sentence builder (centerContent) */}
  <div className="flex items-center justify-center overflow-hidden">
    <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-sm w-full max-w-[95%]">
      {centerContent}
    </div>
  </div>
  
  {/* Row 3: Reserved for turn indicator or empty */}
  <div className="flex items-center justify-center">
    {/* Optional turn indicator text */}
  </div>
</div>
```

- CSS Grid with fixed row heights
- `grid-rows-[40px_1fr_40px]` - top and bottom fixed, middle takes rest
- Content changes don't affect grid track sizes

### Layer 3: Players (z-20)

```tsx
<div className="absolute inset-0 z-20 pointer-events-none">
  {otherPlayers.map((player, index) => {
    const pos = getOvalPosition(index, otherPlayers.length);
    return (
      <div
        key={player.id}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      >
        <PlayerSeatCompact player={player} />
      </div>
    );
  })}
</div>
```

- Same positioning logic as current (getOvalPosition works fine)
- Players are outside the content flow

### Self Player (below table)

Keep the current approach - self player rendered below the table container:

```tsx
{selfPlayer && (
  <div className="flex justify-center mt-2 relative z-20">
    <div className="bg-teal-900/80 px-4 py-2 rounded-xl border-2 border-teal-600">
      <PlayerSeatCompact player={selfPlayer} />
    </div>
  </div>
)}
```

## Implementation Steps

1. Create `/src/components/GameTableV2.tsx`
2. Copy the interfaces and helper functions from GameTable.tsx:
   - `TablePlayer` interface
   - `getOvalPosition()` function  
   - `PlayerSeatCompact` component
3. Build the new component with 3-layer architecture
4. Test in isolation first (render with mock data)
5. Replace GameTable import in `/src/app/play/room/page.tsx`
6. Test gameplay - verify table doesn't shrink when cards played
7. If working, delete old GameTable.tsx and rename V2

## Files to Modify

- CREATE: `/src/components/GameTableV2.tsx`
- MODIFY: `/src/components/index.ts` (add export)
- MODIFY: `/src/app/play/room/page.tsx` (swap import)
- DELETE (after testing): `/src/components/GameTable.tsx`

## Testing Checklist

- [ ] Table renders at correct size (400px height)
- [ ] Players positioned correctly around oval
- [ ] Topic indicator displays
- [ ] Sentence builder (centerContent) renders
- [ ] Play a card - table does NOT shrink
- [ ] Play multiple cards - table remains stable
- [ ] Works on different screen widths
- [ ] Self player displays below table

## Notes

- Keep same props interface for drop-in replacement
- The `bottomContent` prop is not used in current implementation - can omit
- Mobile view uses MobileGameView.tsx - not affected by this change

---

**Created:** 2025-12-09  
**Assigned:** cc  
**Status:** PENDING
✅ Completed - Commit: 105200b
