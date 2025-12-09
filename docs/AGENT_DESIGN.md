# Kapu Tī - Avatar Helper Agent Design

**Created:** December 10, 2025  
**Version:** 1.0  
**Status:** Design Specification  

---

## 🎯 Vision

An intelligent, friendly helper agent that welcomes players, teaches Te Reo Māori grammar, explains game mechanics, and provides contextual assistance. LLM-agnostic design allows running on Ollama Cloud (preview phase) with easy transition to local hardware later.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Kapu Tī Client                 │
│  ┌─────────────────────────────────────┐   │
│  │         Avatar Helper UI            │   │
│  │  - Chat panel (slide-in)            │   │
│  │  - Speech bubbles for tips          │   │
│  │  - Generic avatar (placeholder)     │   │
│  └──────────────┬──────────────────────┘   │
└─────────────────┼───────────────────────────┘
                  │ WebSocket (agent:ask, agent:response)
┌─────────────────┼───────────────────────────┐
│         Kapu Tī Server (3102)               │
│  ┌──────────────┴──────────────────────┐   │
│  │         Agent Handler               │   │
│  │  - Context builder                  │   │
│  │  - System prompt management         │   │
│  │  - Response streaming               │   │
│  └──────────────┬──────────────────────┘   │
└─────────────────┼───────────────────────────┘
                  │
┌─────────────────┼───────────────────────────┐
│         AI Provider Layer                   │
│  ┌──────────────┴──────────────────────┐   │
│  │  Unified Interface                  │   │
│  │  - chat(messages, options)          │   │
│  │  - stream support                   │   │
│  └──────────────┬──────────────────────┘   │
│        ┌────────┴────────┐                 │
│        ▼                 ▼                 │
│    ┌────────┐      ┌──────────┐           │
│    │ Ollama │      │ (Future) │           │
│    │ Cloud  │      │ Claude   │           │
│    └────────┘      │ OpenAI   │           │
│                    │ Gemini   │           │
│                    └──────────┘           │
└─────────────────────────────────────────────┘
```

---

## 🔧 Configuration

### Environment Variables

```bash
# AI Provider Settings
KAPU_TI_AI_PROVIDER=ollama
KAPU_TI_AI_ENDPOINT=https://ollama.com    # Cloud
# KAPU_TI_AI_ENDPOINT=http://localhost:11434  # Local (future)
KAPU_TI_AI_MODEL=gpt-oss:120b-cloud
KAPU_TI_AI_KEY=your_ollama_api_key

# Agent Behavior
KAPU_TI_AGENT_ENABLED=true
KAPU_TI_AGENT_STREAMING=true
```

### Transition to Local

When hardware is available, just change:
```bash
KAPU_TI_AI_ENDPOINT=http://localhost:11434
KAPU_TI_AI_MODEL=llama3.2
KAPU_TI_AI_KEY=  # Not needed for local
```

---

## 🤖 AI Provider Layer

### Interface

```typescript
interface AIProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<string>
  chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<string>
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  temperature?: number
  maxTokens?: number
}
```

### Ollama Implementation

```typescript
// Works for both cloud and local - just different config
class OllamaProvider implements AIProvider {
  constructor(config: {
    endpoint: string
    model: string
    apiKey?: string
  })
  
  async chat(messages, options) { ... }
  async *chatStream(messages, options) { ... }
}
```

---

## 🧠 Agent Context

### System Prompt

```
You are the Kapu Tī helper - a warm, encouraging guide for learning Te Reo Māori through this card game.

Your personality:
- Patient and supportive like a favourite teacher
- Mix English with simple Te Reo phrases
- Celebrate small wins ("Ka pai!" "Tino pai!")
- Never condescending about mistakes

Your knowledge:
- Māori sentence structure (VSO order)
- Tense markers (ka, kei te, kua, i)
- Articles (te, ngā, he)
- Possession categories (a-class vs o-class)
- Game rules and scoring

When explaining grammar:
- Use simple terms, not linguistics jargon
- Give examples from the game
- Relate to what the player is trying to do

Keep responses concise - this is a game, not a classroom.
```

### Dynamic Context Injection

Before each query, inject current game state:

```typescript
function buildContext(gameState: GameState, playerState: PlayerState): string {
  return `
Current game context:
- Pattern: "${gameState.currentPattern.description}"
- Slots to fill: ${gameState.slots.map(s => s.type).join(', ')}
- Cards played so far: ${gameState.playedCards.map(c => c.word).join(' ')}
- Player's turn: ${playerState.isCurrentTurn}
- Round: ${gameState.round}
`
}
```

---

## 💬 WebSocket Protocol

### Client → Server

```typescript
// Ask the agent a question
{
  type: 'agent:ask',
  payload: {
    message: string,
    includeGameContext: boolean  // Include current game state
  }
}
```

### Server → Client

```typescript
// Streaming response chunk
{
  type: 'agent:chunk',
  payload: {
    content: string,
    done: boolean
  }
}

// Complete response (non-streaming)
{
  type: 'agent:response',
  payload: {
    content: string
  }
}

// Error
{
  type: 'agent:error',
  payload: {
    message: string
  }
}
```

---

## 🎨 UI Design

### Helper Panel

- **Trigger:** Helper icon (bottom area, near mute/chat)
- **Animation:** Slides in from right (like Chat)
- **Width:** ~1/3 screen (matches Chat/Leaderboard)
- **Components:**
  - Avatar icon (generic placeholder for now)
  - Message history
  - Input field
  - "Thinking..." indicator during generation
  - Close button (X)

### Proactive Tips (Optional)

Speech bubbles that appear contextually:
- First visit: "Kia ora! Welcome to Kapu Tī..."
- First card play: "Ka pai! Tap a slot to place your card"
- Stuck for 30s: "Need a hint? Tap me for help"

---

## 📚 Knowledge Sources

The agent has access to:

1. **MAORI-GRAMMAR-REFERENCE.md** - Grammar rules
2. **RULES.md** - Game mechanics
3. **SENTENCE-PATTERNS.md** - Pattern explanations
4. **vocabulary.json** - Word meanings and categories

These are included in the system prompt or retrieved as needed.

---

## 🔄 Conversation Flow

### Example 1: Grammar Question

```
User: Why does "ka" go at the start?

Agent: Great question! In Te Reo Māori, the tense marker 
comes first - it tells us WHEN something happens before 
we know WHAT happens. 

"Ka" signals future or habitual action. So "Ka kai au" 
means "I will eat" or "I eat (regularly)".

It's like the sentence is saying "In the future... eat... I"
```

### Example 2: Game Help

```
User: How do I score more points?

Agent: A few tips:

Complete sentences quickly - faster plays earn bonus points.
Try to use all your cards in a round.
Look for patterns that match your hand - if you have lots 
of nouns, wait for a noun-heavy pattern!

Ka pai - you've got this! 🎴
```

### Example 3: Word Meaning

```
User: What does "kei te" mean?

Agent: "Kei te" is a present tense marker - it tells us 
something is happening RIGHT NOW.

"Kei te kai au" = "I am eating" (at this moment)

Compare to "ka kai au" which is more like "I will eat" 
or "I eat (in general)".

You'll see it on yellow cards - the tense markers!
```

---

## 🚀 Implementation Phases

### Phase 1: Provider Layer
- [ ] Create `src/lib/ai-provider.ts`
- [ ] Implement OllamaProvider class
- [ ] Config loading from env vars
- [ ] Basic chat (non-streaming)

### Phase 2: Agent Backend
- [ ] Create `server/handlers/agent.ts`
- [ ] WebSocket message handling
- [ ] System prompt management
- [ ] Context injection
- [ ] Streaming support

### Phase 3: Agent UI
- [ ] Helper panel component
- [ ] Message display with streaming
- [ ] Input field
- [ ] "Thinking" indicator
- [ ] Generic avatar placeholder

### Phase 4: Polish
- [ ] Proactive tips (contextual)
- [ ] Response caching for common questions
- [ ] Graceful fallback if AI unavailable
- [ ] Rate limiting / cost controls

---

## 💰 Cost Considerations

### Ollama Cloud (Preview)
- Currently in preview - pricing TBD
- Monitor usage during development
- Transition to local when hardware available

### Cost Controls
- Cache common Q&As
- Limit message history sent (last 5 turns)
- Max token limits on responses
- Rate limit per player (e.g., 20 questions/session)

---

## 🔮 Future Enhancements

1. **Custom Avatar** - Unique character design (kererū? tūī?)
2. **Voice Output** - TTS for Te Reo pronunciation
3. **Additional Providers** - Claude, OpenAI, Gemini
4. **Hint System** - Agent can suggest plays (opt-in)
5. **Learning Tracking** - Remember what player has learned

---

## ✅ Success Criteria

- [ ] Agent responds helpfully to grammar questions
- [ ] Explains game mechanics clearly
- [ ] Maintains warm, encouraging tone
- [ ] Responses feel natural, not robotic
- [ ] Works seamlessly on mobile
- [ ] Transitions to local LLM with config change only

---

**He aha te mea nui o te ao? He tangata, he tangata, he tangata.**

*The agent embodies this - putting people and their learning first.*

---

**End of Agent Design v1.0**
