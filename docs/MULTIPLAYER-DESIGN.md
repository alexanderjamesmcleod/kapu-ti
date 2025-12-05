# Kapu Ti - Multiplayer Design Doc

## Game Overview

**Kapu Ti** is a Te Reo Maori card game where players compete to empty their hands by building grammatically correct sentences using color-coded cards. Last player holding cards loses and makes tea for everyone!

---

## Core Concept: Color Pattern Learning

Cards are color-coded by grammatical type. Players learn sentence structure through COLOR PATTERNS, not memorization.

| Color | Type | Examples |
|-------|------|----------|
| YELLOW | Tense markers | Kei te, Ka, Kua, I |
| GREEN | Verbs | haere, kai, noho, mahi |
| RED | Pronouns | au, koe, ia, ratou |
| BLUE | Nouns | whare, kura, ngeru |
| PURPLE | Particles | Ko, He |
| BROWN | Locatives | i, ki |
| PINK | Intensifiers | tino, ahua |
| ORANGE | Demonstratives | tenei, tena, tera |
| GRAY | Articles | te, nga |
| LIGHTBLUE | Adjectives | pai, harikoa, ngenge |

---

## Game Rules

### Objective
**Don't be the last player holding cards!**
- First to empty hand = Winner, leaves table
- Last with cards = Loser, makes tea (kapu ti) for everyone

### Setup
- 2-4 players
- Each player dealt 7 cards
- Starting pattern: `[YELLOW] [GREEN] [RED]` (fixed)

### Turn Flow

```
YOUR TURN
=========

OPTION A: PLAY CARDS
--------------------
1. Play cards on matching color slots
   - Multiple DIFFERENT colors OK
   - Only 1 card per color per turn
   - Can stack on existing slots
   - Can create new slots

2. MUST speak the sentence aloud
3. MUST translate to English

   Correct? -> Draw 1 card (or leave if hand empty)
   Wrong?   -> Pick up ALL cards from table!

OPTION B: PASS
--------------
- Draw 1 card
- End turn
```

### Key Rules

1. **One card per color per turn**
   - Can play: YEL + GREEN + RED + BROWN (different colors)
   - Cannot play: YEL + YEL (same color twice)

2. **Stacking**
   - Cards stack on slots (discard pile per slot)
   - Any matching color can replace/stack on a slot
   - Sentence meaning changes with each play!

3. **Verification**
   - Players vote on pronunciation/translation
   - Can use audio playback to verify
   - Honor system option

4. **After pickup**
   - Table resets to starting pattern
   - Play continues

---

## Data Structures

### Types

```typescript
// Player state
interface Player {
  id: string;
  name: string;
  hand: Card[];
  isActive: boolean;  // false = left the game (winner)
  position: number;   // 0-3 for table position
}

// Table slot - a stack of cards
interface TableSlot {
  color: string;
  cards: Card[];      // Stack, top card is current
  position: number;   // Slot position in sentence
}

// Game state
interface MultiplayerGame {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  tableSlots: TableSlot[];
  drawPile: Card[];
  startingPattern: string[];  // ['yellow', 'green', 'red']
  phase: GamePhase;
  turnState: TurnState;
}

type GamePhase =
  | 'setup'           // Entering names
  | 'playing'         // Game in progress
  | 'verification'    // Checking pronunciation/translation
  | 'finished';       // Game over

interface TurnState {
  playedCards: Card[];       // Cards played this turn
  selectedColor: string | null;
  awaitingVerification: boolean;
}

// Verification result
interface VerificationVote {
  playerId: string;
  approved: boolean;
}
```

### Game Flow State Machine

```
[SETUP] -> [PLAYING] -> [VERIFICATION] -> [PLAYING] -> ... -> [FINISHED]
              ^              |
              |              v
              +--- (wrong) --+
```

---

## UI Components

### 1. Setup Screen
```
/play/multiplayer/setup

+----------------------------------+
|         KAPU TI                  |
|    Multiplayer Setup             |
|                                  |
|  How many players? [2] [3] [4]   |
|                                  |
|  Player 1: [Hine_______]         |
|  Player 2: [Tama_______]         |
|                                  |
|  [START GAME]                    |
+----------------------------------+
```

### 2. Table View (Main Game)
```
/play/multiplayer/game

            Tama (5 cards)
               [cards]

  Mere                      Koro
  (3 cards)                (4 cards)
  [cards]                  [cards]

            +------------------+
            | Sentence Builder |
            | [Kei te][haere]  |
            +------------------+

            YOUR TURN: Hine
            [Your hand of cards]

            [SPEAK] [PASS]
```

### 3. Turn Privacy Screen
```
+----------------------------------+
|                                  |
|     Pass to TAMA                 |
|                                  |
|     [TAP TO START TURN]          |
|                                  |
+----------------------------------+
```

### 4. Verification Screen
```
+----------------------------------+
|  Hine says:                      |
|  "Kei te haere au"               |
|  "I am going"                    |
|                                  |
|  [PLAY AUDIO]                    |
|                                  |
|  Is this correct?                |
|  [YES - Correct]  [NO - Wrong]   |
+----------------------------------+
```

### 5. Game Over Screen
```
+----------------------------------+
|         GAME OVER!               |
|                                  |
|  Winners: Hine, Tama, Mere       |
|                                  |
|  LOSER: Koro                     |
|  Time to make the tea! :tea:     |
|                                  |
|  [PLAY AGAIN]                    |
+----------------------------------+
```

---

## Component Structure

```
src/
  app/
    play/
      page.tsx              # Single player (existing)
      multiplayer/
        page.tsx            # Redirect to setup
        setup/
          page.tsx          # Player setup
        game/
          page.tsx          # Main game

  components/
    multiplayer/
      TableView.tsx         # Poker table layout
      PlayerPosition.tsx    # Player avatar + card count
      SentenceSlots.tsx     # Shared sentence builder
      TurnIndicator.tsx     # Whose turn
      PrivacyScreen.tsx     # "Pass to X" screen
      VerificationModal.tsx # Pronunciation check
      GameOverScreen.tsx    # Winners/loser display

  hooks/
    useMultiplayerGame.ts   # Game state management

  lib/
    multiplayer/
      gameLogic.ts          # Turn validation, scoring
      audioVerify.ts        # Pronunciation checking
```

---

## Implementation Phases

### Phase 1: Core Game State
- [ ] MultiplayerGame types
- [ ] useMultiplayerGame hook
- [ ] Basic turn logic

### Phase 2: Setup Flow
- [ ] Setup page (player count, names)
- [ ] Initial card dealing
- [ ] Starting pattern

### Phase 3: Table UI
- [ ] TableView component
- [ ] PlayerPosition display
- [ ] SentenceSlots (shared builder)
- [ ] Turn indicator

### Phase 4: Turn Flow
- [ ] Privacy screen between turns
- [ ] Card selection (one per color)
- [ ] Slot placement
- [ ] Pass option

### Phase 5: Verification
- [ ] Verification modal
- [ ] Player voting
- [ ] Audio playback option
- [ ] Penalty (pickup all cards)

### Phase 6: End Game
- [ ] Player elimination (empty hand)
- [ ] Winner tracking
- [ ] Game over screen

---

## Strategic Considerations

### For Players
- **Risk vs Reward**: Play many cards = speak longer sentence
- **Slot creation**: Adding slots helps opponents too
- **Timing**: Know when to pass vs play
- **Vocabulary**: Only play words you can pronounce!

### For Implementation
- **Sentence validation**: Use existing validators for grammar
- **Audio**: Leverage kupu.maori.nz audio for verification
- **Fairness**: Random deal, clockwise turns

---

## Future Enhancements
- Online multiplayer (WebSocket)
- AI opponent
- Difficulty levels (restrict patterns)
- Tournament mode
- Leaderboards

---

*Kapu Ti - Learn Te Reo through play!*
