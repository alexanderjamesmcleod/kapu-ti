# Kapu Tī - Product Vision: Marae Edition

**Created:** December 10, 2025  
**Version:** 1.1  
**Status:** Vision Document - Refined  

---

## 🌟 The Vision

**Kapu Tī Marae Edition** - A self-contained Te Reo Māori learning game that any marae, kura, or whānau can run on their own hardware. No cloud dependency, no external exposure, complete data sovereignty.

*"He taonga te reo - Our language is a treasure that stays with us"*

---

## 🎯 Core Value Propositions

### For Marae & Kura
- **Data Sovereignty** - All data stays on your hardware
- **Whānau Safety** - No outside access, moderated chat
- **Offline Capable** - Works without internet (with local LLM)
- **Customizable** - Add your own kupu, your own audio
- **Affordable** - One-time purchase, no subscriptions

### For Whānau
- **Private Learning** - Safe space to make mistakes
- **Intergenerational** - Tamariki to kaumātua playing together
- **Cultural Connection** - Learn your iwi's specific vocabulary
- **Fun First** - Game-based learning that doesn't feel like homework

---

## 📦 Distribution Model

### How They Get It

1. **Purchase** → Receive admin code + GitHub access link
2. **Run install script** → Everything installs automatically
3. **First-run setup** → Configure LLM or use defaults
4. **Play** → Game is ready

### Install Script Does Everything

```bash
# User runs ONE command:
curl -sSL https://github.com/kapu-ti/install.sh | bash

# Script handles:
# ✓ Pulls game containers
# ✓ Installs Ollama (if not present)
# ✓ Downloads default LLM model
# ✓ Sets up RAG database
# ✓ Configures networking
# ✓ Creates data directories
# ✓ Starts all services
```

### First-Run Setup Page

```
┌─────────────────────────────────────────────────────┐
│         🍵 Kapu Tī - Initial Setup                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  LLM Configuration                                  │
│  ┌───────────────────────────────────────────────┐ │
│  │ ○ Use installed Ollama (recommended)          │ │
│  │   Model: [llama3.2:7b        ▼]              │ │
│  │                                               │ │
│  │ ○ Use Ollama Cloud                           │ │
│  │   API Key: [____________________]            │ │
│  │                                               │ │
│  │ ○ Use custom endpoint                        │ │
│  │   URL: [http://________________]             │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Test Connection]                                  │
│                                                     │
│  ✓ Connection successful!                          │
│                                                     │
│            [Save & Start Game →]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Admin Access

### Purpose
- Add/edit kupu (vocabulary)
- Upload audio files
- Manage game content
- NOT for user management (no accounts needed)

### Access Flow

```
Home Page → Click "Admin" link → Enter admin code → Access granted
```

### Admin Code
- Provided at purchase
- Simple passphrase (not complex password)
- Can be changed in config file
- Example: `marae-kapu-2025`

### Admin Panel Features

```
┌─────────────────────────────────────────────────────┐
│         🍵 Kapu Tī - Admin                          │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Kupu    │ │  Audio   │ │ Settings │           │
│  │ Library  │ │  Files   │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  Kupu Library (222 base + 15 custom)               │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🔍 Search kupu...                           │   │
│  ├─────────────────────────────────────────────┤   │
│  │ kai      │ eat/food    │ verb   │ 🔊 │ ✏️ │   │
│  │ whare    │ house       │ noun   │ 🔊 │ ✏️ │   │
│  │ *maunga  │ mountain    │ noun   │ 🔊 │ ✏️ │   │
│  │ *awa     │ river       │ noun   │ ⚠️ │ ✏️ │   │
│  └─────────────────────────────────────────────┘   │
│  * = custom     ⚠️ = missing audio                 │
│                                                     │
│  [+ Add New Kupu]                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Add Kupu Flow (Agent-Assisted)

```
Admin clicks [+ Add New Kupu]
    ↓
Agent: "Kia ora! What kupu would you like to add?"
    ↓
Admin: "maunga"
    ↓
Agent: "Maunga means 'mountain'. I'll set it up as a noun.
        Would you like to add any other meanings?"
    ↓
Admin: "No that's good"
    ↓
Agent: "Great! Would you like to upload an audio file for
        pronunciation, or should I use the default?"
    ↓
Admin: [Uploads audio]
    ↓
Agent: "Audio received! Here's a preview of the card:
        
        ┌─────────────┐
        │   maunga    │
        │  mountain   │
        │    NOUN     │
        └─────────────┘
        
        Add to game?"
    ↓
Admin: "Yes"
    ↓
Agent: "Ka pai! 'Maunga' is now in the game and I've
        updated my knowledge base. Players will see it
        in their next round!"
    ↓
Kupu added to vocabulary + RAG updated
```

---

## 🤖 Agent Architecture (Speed-Optimized)

### Critical Insight
**Speed is king in multiplayer games.** Every millisecond of latency frustrates players.

### Agent Implementation Strategy

| Agent | Implementation | Latency | Why |
|-------|---------------|---------|-----|
| **Kaitiaki** (Guardian) | Rule-based CODE | <1ms | Chat filter runs on EVERY message |
| **Kaiwhakahaere** (Manager) | CODE | <1ms | Score/connection tracking must be instant |
| **Kaiāwhina** (Helper) | LLM | 500-2000ms | User-initiated, delay is acceptable |
| **Kaiako** (Teacher) | LLM | Async | Non-blocking, runs in background |

**Only 2 agents need LLM. The others are fast code.**

---

### Kaitiaki (Guardian) - RULE-BASED

```typescript
// Fast, synchronous filter
function moderateMessage(message: string): ModerationResult {
  // Check profanity list (hash lookup = O(1))
  if (profanitySet.has(normalize(message))) {
    return { allowed: false, reason: 'profanity' }
  }
  
  // Check patterns (regex, pre-compiled)
  if (profanityPatterns.some(p => p.test(message))) {
    return { allowed: false, reason: 'pattern' }
  }
  
  // Rate limiting (in-memory counter)
  if (isRateLimited(playerId)) {
    return { allowed: false, reason: 'rate_limit' }
  }
  
  return { allowed: true }
}
```

**Performance:** <1ms per message
**No LLM needed**

---

### Kaiwhakahaere (Manager) - CODE

```typescript
// Pure code, no AI
class GameManager {
  trackConnection(playerId: string, roomId: string) { ... }
  updateScore(playerId: string, points: number) { ... }
  checkHighScore(playerId: string, score: number) { ... }
  backupLeaderboard() { ... }
  restoreLeaderboard(data: BackupData) { ... }
}
```

**Performance:** <1ms per operation
**No LLM needed**

---

### Kaiāwhina (Helper) - LLM

```typescript
// User-initiated, async, streaming
async function askHelper(question: string, gameContext: GameState) {
  const systemPrompt = buildHelperPrompt(gameContext)
  const response = await llm.chatStream(systemPrompt, question)
  return response  // Streamed to user
}
```

**Performance:** 500-2000ms (acceptable for user-initiated)
**Uses LLM** - Only when player asks

---

### Kaiako (Teacher) - LLM (Async)

```typescript
// Non-blocking, background execution
async function teachingMoment(event: GameEvent) {
  // Don't block game flow
  setImmediate(async () => {
    const insight = await llm.generate(buildTeacherPrompt(event))
    broadcastToRoom(event.roomId, { type: 'teaching_moment', content: insight })
  })
}
```

**Performance:** Async, doesn't block gameplay
**Uses LLM** - But never delays the game

---

## 💾 Leaderboard Backup

### Storage Location

```
data/
├── leaderboard.json          # Live data (always current)
├── backups/
│   ├── leaderboard-2025-12-10.json  # Daily auto-backup
│   ├── leaderboard-2025-12-09.json
│   └── ...
└── exports/
    └── (manual exports go here)
```

### Auto-Backup Strategy

| Trigger | Action |
|---------|--------|
| Game ends | Append score to leaderboard.json |
| Daily (midnight) | Copy to backups/ with date |
| Keep last 7 days | Auto-delete older backups |

### Manual Export

```
Admin Panel → Settings → [Export Leaderboard]
    ↓
Downloads: kapu-ti-leaderboard-2025-12-10.json
```

### Restore on Reinstall

```
Fresh install
    ↓
First-run setup page
    ↓
[Import Previous Data] button
    ↓
Select backup file
    ↓
Leaderboard restored
```

### Backup Format

```json
{
  "version": "1.0",
  "exported": "2025-12-10T12:00:00Z",
  "leaderboard": [
    {
      "rank": 1,
      "name": "Tama",
      "score": 15000,
      "date": "2025-12-09T14:30:00Z"
    },
    {
      "rank": 2,
      "name": "Hine",
      "score": 14500,
      "date": "2025-12-08T10:15:00Z"
    }
  ]
}
```

---

## 📦 What's In The Box (Revised)

```
kapu-ti-marae/
├── 🎮 Game Server
│   ├── Multiplayer engine (WebSocket)
│   ├── Room management
│   ├── Scoring & leaderboards
│   └── Game state persistence
│
├── 🤖 Agent Layer
│   ├── Kaitiaki (Guardian) - CODE, rule-based filter
│   ├── Kaiwhakahaere (Manager) - CODE, game tracking
│   ├── Kaiāwhina (Helper) - LLM, player assistance
│   └── Kaiako (Teacher) - LLM, async learning moments
│
├── 📚 RAG Knowledge Base
│   ├── Grammar rules
│   ├── Vocabulary database
│   ├── Sentence patterns
│   ├── Game rules
│   └── Custom kupu (admin-added)
│
├── 🔊 Audio Library
│   ├── Default pronunciation files
│   └── Custom audio (admin-added)
│
├── 🔐 Admin Panel
│   ├── Kupu management
│   ├── Audio upload
│   ├── LLM settings
│   └── Backup/restore
│
└── 🖥️ Web Interface
    ├── Game client (browser-based)
    ├── Setup wizard (first-run)
    └── Admin access
```

---

## 🖥️ Deployment: Podman

### Container Structure (Revised)

```yaml
# podman-compose.yml
version: "3"
services:
  kapu-ti:
    image: kapu-ti/game:latest
    ports:
      - "3100:3100"   # Web UI + Admin
      - "3102:3102"   # WebSocket
    volumes:
      - ./data:/app/data            # Leaderboard, backups
      - ./custom:/app/custom        # Custom kupu + audio
      - ./config:/app/config        # LLM settings
    environment:
      - ADMIN_CODE=${ADMIN_CODE}
    depends_on:
      - ollama
      - rag

  rag:
    image: kapu-ti/rag:latest
    volumes:
      - ./knowledge:/app/knowledge
      - ./custom:/app/custom

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ./ollama:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]  # If available
```

### Install Script

```bash
#!/bin/bash
# install.sh - One command to rule them all

echo "🍵 Installing Kapu Tī Marae Edition..."

# Check for Podman
if ! command -v podman &> /dev/null; then
    echo "Installing Podman..."
    # OS-specific install
fi

# Pull containers
echo "Downloading game components..."
podman pull kapu-ti/game:latest
podman pull kapu-ti/rag:latest
podman pull ollama/ollama:latest

# Create directories
mkdir -p kapu-ti/{data,custom,config,knowledge,ollama,backups}

# Download compose file
curl -o kapu-ti/podman-compose.yml https://...

# Pull default LLM model
echo "Downloading AI model (this may take a while)..."
podman run --rm -v ./ollama:/root/.ollama ollama/ollama pull llama3.2:7b

# Generate admin code
ADMIN_CODE=$(openssl rand -hex 4)
echo "ADMIN_CODE=$ADMIN_CODE" > kapu-ti/.env
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔐 Your Admin Code: $ADMIN_CODE"
echo "  📝 Save this! You'll need it to add kupu."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start it up
cd kapu-ti
podman-compose up -d

echo ""
echo "✅ Kapu Tī is ready!"
echo "🌐 Open http://localhost:3100 in your browser"
echo ""
```

---

## 💰 Product Tiers (Revised)

| Edition | Target | Price | Includes |
|---------|--------|-------|----------|
| **Hapori** | Open Source | FREE | Core game, no support, bring own LLM |
| **Whānau** | Families | $79 | + Install script, email support |
| **Kura** | Schools | $299 | + Custom kupu, 1yr updates, Zoom support |
| **Marae** | Marae | $499 | + Audio upload, priority support |
| **Iwi** | Multi-site | Custom | + Volume licensing, on-site setup |

---

## 🚀 Roadmap (Revised)

### Phase 1: Core Game (Current)
- [x] Multiplayer gameplay
- [x] Sentence patterns
- [x] Basic scoring
- [ ] Table UI redesign
- [ ] Card flip feature

### Phase 2: Speed-Critical Code
- [ ] Kaitiaki (rule-based moderation)
- [ ] Kaiwhakahaere (game manager)
- [ ] Leaderboard auto-backup
- [ ] High score auto-add

### Phase 3: AI Provider Layer
- [ ] Ollama integration
- [ ] Setup wizard (first-run)
- [ ] LLM configuration UI

### Phase 4: LLM Agents
- [ ] Kaiāwhina (helper)
- [ ] RAG knowledge base
- [ ] Kaiako (teacher, async)

### Phase 5: Admin Panel
- [ ] Admin login
- [ ] Kupu management
- [ ] Audio upload
- [ ] Agent-assisted kupu creation

### Phase 6: Packaging
- [ ] Podman containers
- [ ] Install script
- [ ] Documentation
- [ ] First marae pilot

---

## ✅ Key Decisions (Updated)

1. **Podman** for containerization
2. **Ollama** as primary LLM (auto-installed)
3. **Admin panel** with code-based access (provided at purchase)
4. **GitHub distribution** with install script
5. **First-run setup page** for LLM configuration
6. **Agent-assisted kupu creation** in admin panel
7. **2 LLM agents, 2 code agents** (speed optimization)
8. **Auto-backup** daily + manual export for leaderboard
9. **Custom kupu + audio** managed through admin panel

---

**He waka eke noa - We're all in this together**

---

**End of Product Vision v1.1**
