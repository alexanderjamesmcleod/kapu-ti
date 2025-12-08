# Kapu Ti - Te Reo Māori Card Game

**Project:** Kapu Ti (Cup of Tea)
**Location:** `/home/alex/ai-kitchen/projects/kapu-ti`
**Type:** Next.js 14 + TypeScript + WebSocket multiplayer game
**Purpose:** Learn Te Reo Māori through card-based sentence building

## Architecture Overview

### Frontend (Next.js 14 App Router)
- `src/app/` - App router pages
- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript types
- `src/data/` - Word cards and game data

### Backend (WebSocket Server)
- `server/index.ts` - WebSocket server entry point
- `server/game-manager.ts` - Room and game state management
- `server/game-logic.ts` - Core game rules and state transitions

## Key Components

### GameTable.tsx
The poker-style oval table component:
- Players positioned around oval using trigonometry
- `PlayerSeatCompact` - Individual player seat with avatar, name, cards count
- `getOvalPosition()` - Calculates position on oval arc
- Center content area for sentence builder
- Topic indicator display
- Supports spectator mode

### CardHand.tsx
Player's hand of cards:
- Horizontal scrollable on mobile
- Card selection with visual feedback
- Audio pronunciation button per card
- Multiple card sizes: xs, sm, md, lg

### Card.tsx
Individual card component:
- Displays Māori word with English translation
- Color-coded by word type (verb, noun, particle, etc.)
- Audio playback button
- Flip animation support

### MultiplayerSentenceBuilder.tsx
The sentence construction area:
- Slot-based system - cards played into slots
- Stack cards on existing slots
- Visual feedback for valid/invalid placements
- Displays built sentence with translations

### KoreroButton.tsx
The "Speak!" submission button:
- Modal for entering spoken sentence
- Translation input
- Triggers voting phase

### VotingOverlay.tsx
Voting UI for turn verification:
- Āe (Yes) / Kāo (No) buttons
- Countdown timer
- Vote tallying display

## Game Flow

1. **Lobby** → Create/join room with 4-letter code
2. **Turn Order** → Deal number cards, reveal highest picks topic
3. **Topic Select** → Winner chooses topic (Food, Places, Actions, etc.)
4. **Playing** →
   - Current player plays cards from hand
   - Build sentences in slots
   - Stack cards for complex sentences
   - Click "Kōrero!" when ready
5. **Verification** → Other players vote Āe/Kāo
6. **Turn End** → Points awarded, next player
7. **Game End** → When deck exhausted or target score reached

## Server Architecture

### WebSocket Events (Client → Server)
- `CREATE_ROOM` - Create new game room
- `JOIN_ROOM` - Join existing room by code
- `START_GAME` - Host starts the game
- `PLAY_CARD` - Play card to slot
- `STACK_CARD` - Stack card on existing slot
- `CREATE_SLOT` - Create new slot with card
- `PASS_TURN` - Skip turn
- `SUBMIT_TURN` - Submit sentence for voting
- `VOTE` - Cast Āe/Kāo vote

### WebSocket Events (Server → Client)
- `ROOM_CREATED` - Room created with code
- `PLAYER_JOINED` - New player in room
- `GAME_STATE` - Full game state sync
- `TURN_STARTED` - New turn began
- `VOTE_RESULT` - Voting completed

### Game State Structure
```typescript
interface GameState {
  roomCode: string;
  phase: 'lobby' | 'turnOrder' | 'topicSelect' | 'playing' | 'verification' | 'turnEnd' | 'finished';
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  tableSlots: TableSlot[];
  currentTopic: Topic | null;
  turnState: TurnState;
}

interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  isActive: boolean;
  isBot: boolean;
}
```

## Custom Hooks

### useOnlineGame.ts
Main multiplayer hook:
- WebSocket connection management
- Game state synchronization
- All game actions (playCard, passTurn, etc.)
- Reconnection handling

### useGameSounds.ts
Sound effects:
- Card play sounds
- Card pickup sounds
- Turn notification sounds
- Chill mode toggle

### useVoiceChat.ts
WebRTC voice chat:
- Peer connection management
- Audio stream handling
- Mute toggle

## Data Structure

### Word Cards (src/data/words.ts)
```typescript
interface WordCard {
  id: string;
  maori: string;
  english: string;
  type: 'verb' | 'noun' | 'particle' | 'determiner' | 'adjective' | 'pronoun';
  audio?: string;
  topics?: string[];
}
```

### Topics
- Kai (Food)
- Wāhi (Places)
- Mahi (Actions)
- Tangata (People)
- Taiao (Nature)
- Kararehe (Animals)

## Kitchen Workflow

Recipes are in `kitchen/RECIPE_DEV/`:
- `RECIPE-LEADERBOARD.md` - Scoring and persistence
- `RECIPE-MOBILE-PWA.md` - Mobile improvements

Backup branch `backup-leaderboard-pwa-dec8` contains previous attempt at leaderboard/PWA features.

## Running Locally

```bash
# Frontend (port 3000)
npm run dev

# WebSocket server (port 3002)
npm run server

# For internet play (cloudflared tunnels)
/tmp/cloudflared tunnel --url http://localhost:3000
/tmp/cloudflared tunnel --url http://localhost:3002
```

## Current State (Dec 8, 2025)

Stable at commit `664c16a`:
- Sound system
- Chill mode
- Card stacking
- Full multiplayer flow
- Bot players
- Voice chat

Planned (in kitchen/RECIPE_DEV):
- Leaderboard & scoring
- Mobile/PWA improvements
