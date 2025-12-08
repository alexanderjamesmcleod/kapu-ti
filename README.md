# Kapu Tī 🍵

**A Te Reo Māori card game with real-time online multiplayer** — Build sentences, speak them aloud, and race to empty your hand. The last player holding cards makes tea for everyone!

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎮 What is Kapu Tī?

Kapu Tī (Cup of Tea) is a multiplayer card game that makes learning Te Reo Māori fun and social. Players hold color-coded word cards (nouns, verbs, particles, etc.) and take turns building grammatically correct Māori sentences on a shared table. Say your sentence correctly, translate it to English, and shed your cards — first to empty their hand wins!

The twist? **The last player holding cards has to make tea for everyone.** ☕

### Key Features

- 🌐 **Real-time Online Multiplayer** — Auto-matchmaking puts you at a table in seconds
- 🎴 **Color-coded Grammar** — Purple particles, blue nouns, green verbs, and more
- 🔊 **Native Audio** — Pronunciation from kupu.maori.nz with Web Speech API fallback
- ⏱️ **Turn Timer** — 30-second turns with auto-skip for AFK players (visual countdown at ≤10s)
- 🔄 **Reconnection** — 60-second grace period to rejoin if you disconnect
- 🤖 **Bot Players** — Practice solo or fill empty seats
- 💬 **In-game Chat** — Text chat with emoji reactions
- 🎤 **Voice Chat** — WebRTC peer-to-peer voice (experimental)

## 🚀 Quick Start

```bash
# Clone and install
cd kapu-ti
npm install

# Start the WebSocket server (port 3002)
npm run server

# In another terminal, start Next.js (port 3000)
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and click **Play Now → Online**.

## 🎯 How to Play

### Game Flow

1. **Find a Game** — Click "Play Online" and you're auto-matched to a table (2-10 players)
2. **Turn Order** — Each player reveals a Māori number card; highest picks the topic
3. **Build Sentences** — On your turn, play cards from your hand onto the table
4. **Speak & Submit** — Say your sentence aloud in Te Reo, then translate to English
5. **Peer Verification** — Other players vote on whether you got it right
6. **Win Condition** — First to empty their hand wins; last player makes tea!

### Card Colors & Types

| Color | Type | Examples |
|-------|------|----------|
| 🟣 Purple | Particles | Ko, He |
| ⬜ Gray | Articles | te, ngā |
| 🔵 Blue | Nouns | whare, ngeru, kaiako |
| 🔴 Red | Pronouns | au, koe, ia, mātou |
| 🟢 Green | Verbs | haere, kai, mahi |
| 🩵 Sky Blue | Adjectives | pai, harikoa, nui |
| 🟡 Yellow | Tense Markers | Kei te, I, Ka |
| 🟠 Orange | Demonstratives | tēnei, tēnā, tērā |

### Sentence Patterns

- **Ko sentences:** `Ko + te/ngā + noun` → "Ko te whare" (It is the house)
- **He sentences:** `He + noun + pronoun` → "He kaiako ia" (She is a teacher)
- **Kei te sentences:** `Kei te + verb + pronoun` → "Kei te haere au" (I am going)

## 🏗️ Architecture

```
kapu-ti/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── page.tsx            # Landing page
│   │   └── play/
│   │       ├── page.tsx        # Solo practice mode
│   │       └── online/
│   │           └── page.tsx    # Online multiplayer entry
│   ├── components/
│   │   ├── Card.tsx            # Individual word card
│   │   ├── CardHand.tsx        # Player's hand display
│   │   ├── SentenceBuilder.tsx # Table slots for building sentences
│   │   ├── ChatPanel.tsx       # In-game text chat
│   │   ├── VoiceControls.tsx   # WebRTC voice chat UI
│   │   └── multiplayer/
│   │       ├── OnlineLobby.tsx # Connection & room management
│   │       └── OnlineGame.tsx  # Main game view (496 lines)
│   ├── hooks/
│   │   └── useOnlineGame.ts    # WebSocket client hook (599 lines)
│   ├── lib/
│   │   ├── audio.ts            # Pronunciation playback
│   │   └── validators/         # Grammar validation (Ko, He, Kei te)
│   ├── data/                   # Vocabulary & curriculum JSON
│   └── types/
│       └── multiplayer.types.ts # Shared game state types
│
└── server/                     # WebSocket server (standalone)
    ├── index.ts                # Server entry (~180 lines)
    ├── game-manager.ts         # Room/player/timer management (~1000 lines)
    ├── game-logic.ts           # Pure game state functions
    ├── types.ts                # Server message types
    └── handlers/               # Modular message handlers
        ├── lobby.ts            # FIND_GAME, CREATE_ROOM, JOIN_ROOM, etc.
        ├── game.ts             # PLAY_CARD, SUBMIT_TURN, VOTE, etc.
        ├── chat.ts             # CHAT, REACTION
        └── voice.ts            # WebRTC signaling
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | Node.js WebSocket server (`ws` library) |
| Audio | Web Speech API + kupu.maori.nz CDN |
| Voice Chat | WebRTC via simple-peer |
| Tunneling | Cloudflare Tunnel (for public internet play) |

## 🌐 Playing Over the Internet

Use **Cloudflare Tunnel** to expose your local server (free, no account needed):

```bash
# Download cloudflared (Linux)
curl -L -o /tmp/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x /tmp/cloudflared

# Terminal 1: WebSocket server
npm run server

# Terminal 2: Next.js app
npm run dev

# Terminal 3: Tunnel WebSocket (port 3002)
/tmp/cloudflared tunnel --url http://localhost:3002
# → https://random-words.trycloudflare.com

# Terminal 4: Tunnel frontend (port 3000)
/tmp/cloudflared tunnel --url http://localhost:3000
# → https://other-words.trycloudflare.com
```

Share both URLs with friends. They'll need to enter the WebSocket URL in "Server Settings" before connecting.

## ⏱️ Recent Features

### Turn Timer System
- **30-second turn limit** with visual countdown (shown at ≤10s)
- **Pulses red** at ≤5s with "Hurry!" warning
- **Auto-skip** for AFK players
- **3 consecutive skips** = marked as "away"

### Reconnection System
- **60-second grace period** to rejoin after disconnect
- Players tracked by name for easy reconnection
- Game seat preserved during disconnect

### Modular Server Architecture
- Handlers extracted from monolithic switch statement
- `server/handlers/` contains lobby, game, chat, and voice handlers
- Clean separation of concerns (~180 line main server file)

## 📋 Roadmap

- [x] Core game mechanics & grammar validation
- [x] Audio pronunciation (kupu.maori.nz)
- [x] Local multiplayer (pass-and-play)
- [x] Online multiplayer (WebSocket)
- [x] Auto-matchmaking
- [x] Turn timers & AFK handling
- [x] Reconnection system
- [x] Bot players
- [x] Text chat & reactions
- [x] Voice chat (experimental)
- [x] Sound effects (synthesized audio)
- [x] Browse games / spectator mode
- [x] Chill mode (disables timers)
- [x] Card stacking (any player can modify sentence)
- [x] Visual indicator for disconnected players
- [ ] Tournament/ranked play
- [ ] Mobile PWA
- [ ] Production deployment

## 🌿 Cultural Values

This project is built with respect for Te Reo Māori and Māori culture:

- **Kaitiakitanga** — Guardianship of te reo Māori
- **Manaakitanga** — Hospitality (the tea-making tradition!)
- **Whanaungatanga** — Building relationships through play
- **Ako** — Learning and teaching together

## 🙏 Attribution

- **Audio pronunciation** from [kupu.maori.nz](https://kupu.maori.nz)
- Created by Kelly Keane & Franz Ombler
- Supported by Mā te Reo
- Built following the [12 Guidelines](https://kupu.maori.nz/about/acknowledgements) for Te Reo learning content

---

*He aha te mea nui o te ao? He tangata, he tangata, he tangata.*

*What is the most important thing in the world? It is people, it is people, it is people.*

---

Built with ❤️ as part of [AI Kitchen](https://github.com/alexanderjamesmcleod/ai-kitchen)
