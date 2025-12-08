# Kapu Ti - Feature Roadmap

**Vision:** A virtual whānau game night - see faces, hear voices, play cards together, have fun and learn Te Reo Māori at the same time!

---

## Core Philosophy

The game should feel like sitting at a real table, face-to-face, playing cards with friends and whānau. Not a solo app experience - a social, connected, learning experience.

---

## Feature Roadmap

### 1. Topic-Based Sentence Generation

**Status:** COMPLETE

**Concept:**
- Player 1 picks a random word or topic at the start of the game
- Sentence patterns are generated based on that word/topic
- Sentences morph into related sentences as the game progresses

**Example Flow:**
```
Player picks: "kai" (food)

Round 1: "He kai" → "A food"
Round 2 (morph): "Kei te kai au" → "I am eating"
Round 3 (morph): "Kei te matekai au" → "I am hungry"
Round 4 (morph): "Kei te tino matekai au" → "I am very hungry"
```

**Implementation:**
- Topic categories: Animals, Food, People, Places, Feelings, Actions
- Word association map: links words to related words
- Morphing rules: how sentences evolve (add intensifiers, change pronouns, add locations)

---

### 2. Turn Order via Māori Number Cards

**Status:** COMPLETE

**Concept:**
- At game start, each player is dealt a numbered card (tahi, rua, toru, whā, rima...)
- Highest number goes first
- Next highest goes second, etc.

**Māori Numbers (1-10):**
| Number | Māori | Pronunciation |
|--------|-------|---------------|
| 1 | tahi | tah-hee |
| 2 | rua | roo-ah |
| 3 | toru | taw-roo |
| 4 | whā | fah |
| 5 | rima | ree-mah |
| 6 | ono | oh-no |
| 7 | whitu | fee-too |
| 8 | waru | wah-roo |
| 9 | iwa | ee-wah |
| 10 | tekau | teh-kah-oo |

**Benefits:**
- Teaches numbers naturally through gameplay
- Fair, random turn order
- Thematic - cards look like real playing cards with Māori numerals

---

### 3. Unlimited Players + Dynamic Card Pool

**Status:** Planned

**Concept:**
- No artificial player limit
- As more players join, spawn more cards in the background
- Maintain healthy card-to-player ratio

**Ratio Rules:**
- Minimum 7 cards per player in deck
- As players join, auto-generate topic-appropriate cards
- Cards regenerate as they're used up

**Why this matters:**
- Big whānau game nights (10+ people)
- Classroom use (20-30 students)
- Community events

---

### 4. Live Video at the Table

**Status:** IN PROGRESS (UI ready, WebRTC pending)

**Concept:**
- See and talk to other players while playing
- Like sitting at a real table together
- Video feeds arranged around the "card table"

**Tech Options:**
- WebRTC (peer-to-peer) via `simple-peer` or `peerjs`
- Managed services: LiveKit, Daily.co, Twilio Video
- Hybrid: WebSocket for game state, WebRTC for video

**Layout Idea:**
```
┌─────────────────────────────────────┐
│  [Video]    [Video]    [Video]      │  ← Other players
│                                     │
│         ┌─────────────┐             │
│         │ CARD TABLE  │             │  ← Shared game area
│         └─────────────┘             │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        Your Hand            │    │  ← Your cards
│  └─────────────────────────────┘    │
│                                     │
│  [Your Video]                       │  ← Your camera
└─────────────────────────────────────┘
```

**Nice-to-haves:**
- Mute/unmute
- Camera on/off
- Virtual backgrounds
- Screen share for teaching

---

## Implementation Priority

1. ~~**Topic-based sentences**~~ DONE - 6 topics, sentence morphing, auto-distractors
2. ~~**Māori number turn order**~~ DONE - Full flow: deal → reveal → crown winner → pick topic
3. **Unlimited players** ← Next: Scale up with dynamic card pools
4. **Live video** ← IN PROGRESS: UI ready, needs WebRTC

## What's Been Built

### Online Multiplayer (COMPLETE!)
- **WebSocket Server:** Real-time game state sync on port 3002
- **Room System:** Create/Join with 4-letter codes (e.g., RALP, KAHU)
- **Auto-Ready:** Players join and are immediately ready (no button clicks)
- **Multi-Player Sync:** Both host and joining players see turn order phase
- **Bot Support:** Host can add AI opponents for testing

### Multiplayer Room System (`/play/room`)
- Create/Join/Browse rooms with 4-letter codes
- Spectate mode with queue to join next game
- Auto-ready lobby (no manual ready-up needed)

### Turn Order Flow
- Māori numbers 1-20 as flip cards
- Tap to reveal animation
- Crown for highest card holder
- Winner picks the topic
- **Fixed:** Joining players now correctly see turn order phase

### Poker Table UI (`GameTable` component)
- Oval felt table with players positioned around
- Current turn glow effect (amber highlight)
- Video feed placeholders with toggle button
- Topic indicator below sentence builder
- Hand panel positioned below table (not overlapping)
- Spectator view
- **Responsive scrolling:** Playing view scrolls when content exceeds viewport

### Bold Card Color System (NEW!)
Colors are critical for pattern recognition - players learn word types by color association.

| Word Type | Color | Tailwind | Visual |
|-----------|-------|----------|--------|
| Particles | purple | `bg-purple-400` | Vibrant purple |
| Articles | gray | `bg-slate-400` | Cool gray |
| Nouns | blue | `bg-blue-500` | Strong blue |
| Pronouns | red | `bg-red-500` | Bold red |
| Verbs | green | `bg-emerald-500` | Rich emerald |
| Adjectives | lightblue | `bg-cyan-400` | Bright cyan |
| Tense markers | yellow | `bg-yellow-400` | Bright yellow |
| Demonstratives | orange | `bg-orange-500` | Vivid orange |
| Intensifiers | pink | `bg-pink-400` | Bright pink |
| Locatives | brown | `bg-amber-700` | Deep amber |
| Time words | indigo | `bg-indigo-400` | Distinct indigo |

- **56 words** across 11 word types
- **Cards in slots** display as full Card components (not white placeholders)
- **Audit script:** `scripts/audit-card-colors.ts` validates color assignments

### Multiplayer Sentence Builder
- Real-time slot-based sentence construction
- Color-coded word types (nouns, verbs, particles, etc.)
- Play cards into existing slots or create new ones
- Undo support for last played card
- Pass turn and Kōrero (submit) actions

### Kōrero Button & Voting System (NEW!)
- **Kōrero Button:** Opens modal for player to submit their turn
  - Shows current sentence in Māori
  - Text input for English translation
  - Submit sends to verification phase
- **VotingOverlay:** Other players vote Āe (approve) or Kāo (decline)
  - Big, dramatic voting buttons
  - 15-second countdown timer
  - Live vote tally display
  - Progress bar showing votes received
- **VoteResultModal:** Dramatic result reveal
  - Green/red background based on result
  - Vote breakdown by player
  - Consequence display (winner picks topic, loser picks up cards)
- **Bot Auto-Voting:** Bots automatically vote (80% approval rate)
- **Bot Topic Selection:** Bots auto-select random topic when they win

### Topic System (`/play/topic`)
- 6 topics: Food, Feelings, Actions, Animals, People, Places
- Sentence morphing (he_simple → keite_state → keite_intensified)
- Distractor cards for challenge
- Auto-validation when slots filled

---

## Technical Notes

### Topic-Based Sentence Generator

```typescript
interface Topic {
  id: string;
  name: string;
  maori: string;
  words: string[];           // Word IDs in this topic
  morphTargets: string[];    // Topics sentences can morph into
}

interface SentenceMorph {
  from: string;              // Pattern type
  to: string;                // Target pattern type
  trigger: 'round' | 'score' | 'player_choice';
  probability: number;       // 0-1 chance of morph
}

// Example topics
const TOPICS = {
  kai: {
    id: 'kai',
    name: 'Food',
    maori: 'Kai',
    words: ['n_kai', 'v_kai', 'adj_matekai', 'adj_makona'],
    morphTargets: ['feelings', 'actions']
  },
  whaanau: {
    id: 'whanau',
    name: 'Family',
    maori: 'Whānau',
    words: ['n_matua', 'n_tamaiti', 'n_tuahine', 'n_tungane'],
    morphTargets: ['people', 'feelings']
  }
};
```

### Dynamic Card Spawning

```typescript
interface CardPool {
  base: Card[];              // Starting cards
  spawned: Card[];           // Dynamically generated
  used: Card[];              // In discard/players' hands

  spawnForPlayer(): Card[];  // Generate cards for new player
  recycle(): void;           // Move used cards back to deck
  getAvailable(): Card[];    // Cards that can be drawn
}

// Spawn logic
function spawnCardsForTopic(topic: Topic, count: number): Card[] {
  // Generate cards from topic's word list
  // Ensure variety (nouns, verbs, adjectives)
  // Return balanced hand
}
```

---

## Success Metrics

- **Engagement:** Average session length > 15 minutes
- **Learning:** Players can build sentences without hints after 10 games
- **Social:** 50% of sessions are multiplayer
- **Scale:** Successfully handle 10+ player games

---

## Open Questions

1. **Video privacy:** How to handle player consent for video?
2. **Moderation:** How to handle inappropriate behavior in video?
3. **Accessibility:** How to make video optional without disadvantaging those who can't use it?
4. **Bandwidth:** How to handle low-bandwidth connections?

---

*He aha te mea nui o te ao? He tangata, he tangata, he tangata!*
*What is the greatest thing in the world? It is people, it is people, it is people!*

---

Last updated: December 2025
