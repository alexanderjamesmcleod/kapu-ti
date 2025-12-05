# Kapu Ti - Continuation Prompt

Copy and paste this prompt to continue development on Kapu Ti:

---

## Project: Kapu Ti (Te Reo Maori Card Game)

**Working Directory:** `/home/alex/ai-kitchen/projects/kapu-ti`
**GitHub:** https://github.com/alexanderjamesmcleod/kapu-ti

### What is Kapu Ti?

Kapu Ti (Cup of Tea) is a multiplayer card game for learning Te Reo Maori. Players build grammatically correct sentences using color-coded word cards. First to empty their hand wins - the last player holding cards makes tea for everyone!

### Tech Stack

- **Next.js 15** (App Router, React 18)
- **TypeScript**
- **Tailwind CSS**
- **WebSocket** (`ws` library) for online multiplayer
- **Web Speech API** (TTS)

### Completed Features

1. **Single Player Mode** - 50 progressive challenges teaching Ko, He, Kei te sentence patterns
2. **Pass-and-Play Multiplayer** - Local 2-4 player mode on one device
3. **Online Multiplayer** - WebSocket-based real-time gameplay with room codes
4. **Audio Pronunciation** - Integration with kupu.maori.nz
5. **Grammar Validation** - Real-time sentence pattern validation

### Key Files

```
src/
├── app/
│   ├── play/page.tsx           # Main play menu
│   ├── play/online/page.tsx    # Online multiplayer entry
│   └── play/challenges/page.tsx # Single player challenges
├── components/
│   ├── Card.tsx                # Word card component
│   └── multiplayer/
│       ├── OnlineLobby.tsx     # Create/join room UI
│       ├── OnlineGame.tsx      # Online game board
│       └── MultiplayerGame.tsx # Pass-and-play game
├── hooks/
│   ├── useOnlineGame.ts        # WebSocket hook
│   └── useMultiplayerGame.ts   # Local game state
├── lib/
│   ├── sentenceValidator.ts    # Grammar validation
│   └── audio.ts                # TTS utilities
├── data/
│   └── wordLibrary.ts          # 100+ vocabulary words
└── types/
    ├── index.ts                # Card types
    └── multiplayer.types.ts    # Game state types

server/
├── index.ts                    # WebSocket server (port 3002)
├── game-manager.ts             # Room management
├── game-logic.ts               # Pure game functions
└── types.ts                    # Message types
```

### Running the Project

```bash
# Install dependencies
npm install

# Start WebSocket server (for online play)
npm run server

# Start Next.js dev server
npm run dev
```

### Remaining Roadmap

- [ ] **Print-ready card PDF export** - Generate printable card sheets
- [ ] **Speech-to-text validation** - Verify pronunciation with Web Speech API
- [ ] **Deploy to Vercel** - With separate WebSocket host (Railway/Render)
- [ ] **NZSL video integration** - Sign language videos for words
- [ ] **PWA/Mobile app** - Offline support, app-like experience

### Choose Next Feature

What would you like to work on?

1. **PDF Export** - Generate printable card PDFs for physical play
2. **Deploy to Vercel** - Get the app live on the internet
3. **Speech Recognition** - Validate Maori pronunciation using mic input
4. **Other** - Describe what you'd like to build

---

### Recent Commits

```
5d5afae feat: Add online multiplayer with WebSocket server
340e452 docs: Update README with completed features
a5afdcc feat: Add multiplayer pass-and-play mode + 50 progressive challenges
f029a58 Initial commit: Kapu Ti MVP
```

### Notes for AI

- Game rules are in `docs/MULTIPLAYER-DESIGN.md`
- Sentence patterns: Ko (topic), He (classification), Kei te (present continuous)
- Card colors map to word types (see README.md)
- Audio fetched from `https://kupu.maori.nz/api/audio/{word}`
- WebSocket server uses port 3002 (configurable via PORT env)
