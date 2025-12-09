# Kapu Tī - Table & UI Definition

**Created:** December 10, 2025  
**Version:** 1.0  
**Status:** Design Specification  

---

## 🎯 Vision

A beautiful, plush poker-table aesthetic that feels premium and inviting. Players sit around an oval table, cards are bright and readable, and the experience works seamlessly on both desktop and mobile.

---

## 🎨 Design Principles

1. **Plush & Premium** - Felt table texture, polished elements
2. **Bright & Readable** - No dark overlays obscuring card text
3. **Mobile-First** - Design for touch, scale up for desktop
4. **Consistent Cards** - Same card design everywhere (sized appropriately)
5. **Clean Table** - Modals for secondary features, keep play area focused

---

## 🖼️ Layout Structure

### Overall Composition
```
┌─────────────────────────────────────────────────────┐
│ [Leaderboard]              [Timer] [Exit]           │
│                                                     │
│         👤          👤          👤                   │
│                                                     │
│     👤      ┌─────────────────┐      👤             │
│             │  Sentence Slots │                     │
│             │   (up to 7)     │                     │
│     👤      │                 │      👤             │
│             │ [Korero] [Pass] │                     │
│             └─────────────────┘                     │
│                     👤                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           Your Hand (on the table)          │   │
│  └─────────────────────────────────────────────┘   │
│                                     [Mute] [Chat]  │
└─────────────────────────────────────────────────────┘
```

---

## 🪑 Table Design

### Surface
- **Shape:** Oval/rounded rectangle
- **Texture:** Plush felt (subtle texture/gradient)
- **Color:** Deep purple/magenta tones (from sketch)
- **Border:** Polished rim/rail effect

### Player Positions
- **Count:** 8 seats maximum
- **Arrangement:** Evenly distributed around table perimeter
- **Your seat:** Bottom center (always)

---

## 👤 Player Display

### Active Player
- **Avatar:** Circular frame with initials (placeholder)
- **Username:** Below avatar
- **Score:** Points display
- **Cards:** Face-down card backs visible behind them (Kapu Tī logo)
- **Turn Indicator:** Glow effect around avatar border

### Vacant Seat
- **Display:** "E noho" (invitation to sit)
- **Interaction:** Clickable to join game (if observer)

### Observer Mode
- Players can watch without a seat
- Can click vacant seat to join

---

## 🃏 Card Design

### Core Principle
Cards must be **bright, easy to read, no dark overlays**.

### Card Elements
- **Background:** Solid color by type (current color scheme)
- **Kupu (word):** Large, clear text
- **English:** Smaller subtitle
- **Type badge:** Category indicator (NOUN, VERB, etc.)

### Sizing
- **In Hand:** Full size, easy to tap on mobile
- **On Table:** Slightly smaller to fit 7 slots max
- **Card Backs:** Kapu Tī logo (for other players' hands)

### Hand Area
- **Position:** On the table (you're seated at it)
- **Style:** Part of the plush felt aesthetic
- **No overlay:** Cards sit directly on felt

---

## 🎮 Central Play Area

### Sentence Slots
- **Maximum:** 7 slots
- **Display:** "Actions (Mahi)" header
- **Slots:** Dashed outline when empty, filled when card placed
- **Labels:** Slot type hints (tense, verb, article, noun, etc.)

### Action Buttons
- **Korero:** Primary action (orange/gold)
- **Pass:** Secondary action (green)
- **Position:** Centered below sentence area

---

## 📊 Leaderboard Modal

### Trigger
- Button: Top-left corner "Leaderboard"

### Behavior
- **Animation:** Slides in from left
- **Width:** ~1/3 of screen
- **Close:** X button in top-right of modal

### Content
- **Title:** "Top 10" or "Ngā Toa"
- **List:** Rank, Initials/Name, Score
- **Style:** Matches table aesthetic

---

## 💬 Chat Modal

### Trigger
- Button: Bottom-right corner "Chat"

### Behavior
- **Animation:** Slides in from right
- **Width:** ~1/3 of screen (mirror of leaderboard)
- **Close:** X button or tap outside

### Content
- Message history
- Input field
- Send button

---

## 🔊 Sound Controls

### Mute Button
- **Position:** Below/near Chat button (bottom-right area)
- **States:** Muted / Unmuted icons
- **Scope:** All game sounds

---

## ⏱️ Timer

### Position
- Top-right area, left of Exit button

### Display
- Turn countdown
- Visual urgency as time runs low

---

## 🚪 Exit Button

### Position
- Top-right corner

### Action
- Returns to Lobby
- Confirm if game in progress?

---

## 🏠 Lobby Requirements

### Display
- List of active game rooms
- **Per room:** Room name/number, player count, status

### Interactions
- Click room → Enter as observer
- See vacant seats → Option to join
- Create new room

### Room Info
- Players seated (X/8)
- Game status (waiting, in progress, etc.)

---

## 📱 Mobile Considerations

### Touch Targets
- Minimum 44x44px tap areas
- Cards easily selectable
- Buttons thumb-friendly

### Responsive Behavior
- Table scales to viewport
- Hand cards may stack/scroll horizontally
- Modals full-width on small screens

### Orientation
- Primary: Landscape (best table view)
- Portrait: Supported with adjusted layout

---

## 🎨 Color Palette

### Table
- **Felt:** Deep purple (#4A154B or similar)
- **Border/Rail:** Magenta/pink accent (#E91E8C)

### Cards (existing scheme)
- Yellow: Tense markers
- Green: Verbs
- Blue: Nouns
- Teal: Articles/Particles
- (Maintain current bright, readable colors)

### UI Elements
- **Buttons:** Orange (Korero), Green (Pass)
- **Text:** White/light on dark backgrounds
- **Accents:** Gold for highlights

---

## 🔄 State Indicators

### Turn State
- **Current player:** Glowing avatar border
- **Waiting:** Subtle pulse or indicator

### Game State
- Round number
- Current pattern/topic
- Scores visible per player

### Connection State
- Reconnection handling
- Offline indicator if needed

---

## 📋 Implementation Priority

### Phase 1: Core Table
1. Oval table with plush felt texture
2. 8 player positions around table
3. Your hand area on the table
4. Central sentence slots

### Phase 2: Player Elements
5. Avatar frames with initials
6. Score displays
7. Turn glow indicator
8. Vacant seat display ("E noho")

### Phase 3: Cards
9. Bright card redesign (no overlays)
10. Consistent sizing (hand vs table)
11. Card backs with Kapu Tī logo

### Phase 4: Navigation
12. Leaderboard slide-in modal
13. Chat slide-in modal
14. Timer display
15. Exit button
16. Mute button

### Phase 5: Lobby
17. Room list display
18. Observer mode
19. Join game flow

---

## ✅ Success Criteria

- [ ] Table feels premium and plush
- [ ] Cards readable at a glance
- [ ] Turn indicator clear
- [ ] Works smoothly on mobile
- [ ] Modals don't obstruct gameplay
- [ ] Vacant seats inviting
- [ ] Lobby shows room activity

---

## 📝 Notes

- **Avatars:** Using initials as placeholder (custom avatars future feature)
- **Card backs:** Kapu Tī logo (from homepage) - temporary/MVP
- **Arcade feel:** Leaderboard initials inspired by classic arcade high scores
- **Te Reo touches:** "E noho" for vacant, "Mahi" for actions

---

**He aha te mea nui o te ao? He tāngata, he tāngata, he tāngata.**  
*What is the most important thing in the world? It is people, it is people, it is people.*

---

**End of Table Definition v1.0**
