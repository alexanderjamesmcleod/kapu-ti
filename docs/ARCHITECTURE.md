# Kapu Tī - Architecture

**Simple. Fast. Kitchen-Powered.**

---

## Philosophy

> No Supabase. No monorepo. No premature optimization.
> Get the game working first. Make tea later.

---

## Project Structure

```
projects/kapu-ti/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # Landing page
│   ├── play/
│   │   ├── page.tsx       # Game lobby
│   │   └── [gameId]/
│   │       └── page.tsx   # Active game
│   ├── learn/
│   │   └── page.tsx       # Practice mode
│   ├── cards/
│   │   └── page.tsx       # Card reference/browser
│   └── print/
│       └── page.tsx       # Printable card sheets
│
├── components/
│   ├── Card.tsx           # Single card display
│   ├── CardHand.tsx       # Player's hand
│   ├── SentenceBuilder.tsx # Drop zone for building
│   ├── ValidationFeedback.tsx
│   ├── PronunciationButton.tsx
│   ├── ScoreBoard.tsx
│   └── Timer.tsx
│
├── lib/
│   ├── game-engine.ts     # Core game logic
│   ├── validators/        # Sentence validation (salvaged)
│   ├── speech.ts          # Web Speech API wrapper
│   └── storage.ts         # Local storage helpers
│
├── data/                  # Salvaged from te-reo-academy
│   ├── wordLibrary.ts     # All vocabulary
│   ├── curriculum.ts      # Learning progression
│   └── patterns.ts        # Sentence patterns
│
├── types/                 # TypeScript interfaces (salvaged)
│
└── public/
    ├── audio/             # Pronunciation clips (future)
    └── cards/             # Card images for print
```

---

## Core Components

### 1. Game Engine (`lib/game-engine.ts`)

```typescript
interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  direction: 'clockwise' | 'counterclockwise';
  phase: 'dealing' | 'playing' | 'validating' | 'finished';
  winner: Player | null;
  teaMaker: Player | null; // Loser!
}

interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  isLocal: boolean; // For pass-and-play
}

// Actions
type GameAction =
  | { type: 'DEAL_CARDS' }
  | { type: 'PLAY_CARDS'; cards: Card[] }
  | { type: 'VALIDATE_SENTENCE'; result: ValidationResult }
  | { type: 'DRAW_PENALTY' }
  | { type: 'NEXT_TURN' }
  | { type: 'END_GAME' };
```

### 2. Card Component

```tsx
// Simple, accessible, color-coded
<Card
  word={card}
  size="md"           // sm | md | lg
  interactive={true}  // Clickable in hand
  selected={false}    // Visual selection state
  onSelect={handleSelect}
/>

// Color comes from word type
const typeColors = {
  particle: 'purple',
  article: 'gray',
  noun: 'blue',
  pronoun: 'red',
  verb: 'green',
  adjective: 'sky',
  tense_marker: 'yellow',
  demonstrative: 'orange',
  intensifier: 'pink',
  locative: 'amber',
};
```

### 3. Sentence Builder

```tsx
<SentenceBuilder
  slots={pattern}           // Color pattern to fill
  placedCards={sentence}    // Cards placed so far
  validation={result}       // Real-time feedback
  onPlaceCard={handlePlace}
  onRemoveCard={handleRemove}
/>
```

### 4. Pronunciation Helper

```typescript
// Using Web Speech API
const speech = {
  // Text-to-speech for learning
  speak: (text: string, lang: 'mi' | 'en') => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'mi' ? 'mi-NZ' : 'en-NZ';
    speechSynthesis.speak(utterance);
  },

  // Speech-to-text for validation (future)
  listen: () => {
    // Returns Promise<string>
  }
};
```

---

## Data Flow

```
┌─────────────────────────────────────────────────┐
│                   Game State                     │
│  (useReducer + Context, persisted to localStorage)│
└─────────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │  Player  │   │ Sentence │   │  Score   │
   │   Hand   │   │ Builder  │   │  Board   │
   └──────────┘   └──────────┘   └──────────┘
         │              │
         │         ┌────┴────┐
         │         ▼         ▼
         │    ┌────────┐ ┌────────┐
         │    │Validator│ │ Speech │
         │    └────────┘ └────────┘
         │         │
         └────►────┴────►─── Game Actions
```

---

## State Management

**Keep it simple: useReducer + Context**

```typescript
// No Redux. No Zustand. Just React.
const GameContext = createContext<GameContextType>(null);

function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('kapu-ti-game', JSON.stringify(state));
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
```

---

## Multiplayer Strategy

### Phase 1: Pass-and-Play (Local)
- Single device, multiple players
- "Pass the phone/tablet" between turns
- Screen hides hand between players
- No networking needed

### Phase 2: Online (Future)
- PartyKit or Liveblocks for real-time sync
- Room codes for private games
- No accounts required initially

---

## Deployment

**Vercel - zero config**

```bash
npx create-next-app@latest kapu-ti --typescript --tailwind --app
cd kapu-ti
# Copy salvaged data/validators/types
vercel deploy
```

**Environment:**
- No database needed for MVP
- No auth needed for MVP
- Just static hosting + client-side state

---

## Kitchen Integration

### How CC Builds This

1. **PREP_COOK tasks** for each component:
   - `TASK-XXX: Create Card component`
   - `TASK-XXX: Implement game reducer`
   - `TASK-XXX: Build SentenceBuilder`
   - `TASK-XXX: Integrate validators`

2. **Parallel execution** possible:
   - UI components (independent)
   - Game logic (independent)
   - Data migration (independent)

3. **Feature branches** for isolation:
   - `feature/card-component`
   - `feature/game-engine`
   - `feature/pronunciation`

---

## Print-Ready Cards

### Generate PDFs

```typescript
// Using @react-pdf/renderer
function CardSheet({ cards }: { cards: Card[] }) {
  return (
    <Document>
      <Page size="A4">
        {/* 9 cards per page, 3x3 grid */}
        {chunk(cards, 9).map((pageCards, i) => (
          <View key={i} style={styles.grid}>
            {pageCards.map(card => (
              <PrintableCard key={card.id} card={card} />
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
```

### Card Design

```
┌─────────────────────┐
│  ┌───────────────┐  │
│  │     whare     │  │  ← Māori word (large)
│  └───────────────┘  │
│                     │
│       house         │  ← English (smaller)
│                     │
│    "fah-reh"        │  ← Pronunciation guide
│                     │
│  ┌───┐              │
│  │ N │  noun        │  ← Type indicator
│  └───┘              │
│  ─────────────────  │
│  Also means meeting │  ← Cultural note (if any)
│  house on marae     │
└─────────────────────┘
     (Blue border)
```

---

## Progressive Enhancement

| Feature | MVP | v1.1 | v1.2 | v2.0 |
|---------|-----|------|------|------|
| Card display | ✓ | | | |
| Sentence building | ✓ | | | |
| Validation | ✓ | | | |
| Pass-and-play | ✓ | | | |
| TTS pronunciation | ✓ | | | |
| Printable cards | | ✓ | | |
| STT validation | | ✓ | | |
| Progress tracking | | ✓ | | |
| Online multiplayer | | | ✓ | |
| NZSL videos | | | | ✓ |
| Mobile app | | | | ✓ |

---

## Why This Works

1. **No backend** - Deploy in minutes, not days
2. **No auth** - Play immediately, no friction
3. **No database** - localStorage is enough for MVP
4. **Salvaged validators** - Grammar logic already works
5. **Salvaged data** - Vocabulary is complete
6. **Kitchen-powered** - CC can build this in parallel tasks

---

## Next Actions

```bash
# 1. Initialize project
cd /home/alex/ai-kitchen/projects/kapu-ti
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# 2. Move salvaged files
mv data/ src/
mv validators/ src/lib/
mv types/ src/

# 3. Create first component
# → TASK in PREP_COOK
```

---

*Kia kaha! Let's cook!*
