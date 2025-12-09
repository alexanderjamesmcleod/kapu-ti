# Session Summary - Kapu Tī Marae Edition Vision

**Date:** December 10, 2025  
**Type:** Strategic Planning / Product Vision  
**Status:** ✅ Complete - Major Milestone  

---

## 🎯 What Happened

Started with UI refinements, ended with a complete product vision for a self-contained Te Reo Māori learning platform.

---

## 📄 Documents Created

### 1. TABLE_DEFINITION.md
- Plush poker table UI aesthetic
- 8 player seats, "E noho" for vacant
- Bright readable cards (no overlays)
- Slide-in modals (Leaderboard, Chat, Helper)
- Mobile-first design
- Card flip feature (shows existing data)

### 2. AGENT_DESIGN.md
- AI helper architecture
- Ollama Cloud → Local transition path
- LLM-agnostic provider layer
- Context-aware game assistance

### 3. PRODUCT_VISION.md (v1.1)
- Complete Marae Edition specification
- 4 Agent roles (2 LLM, 2 code-based)
- Podman deployment
- GitHub distribution with install script
- Admin panel for kupu management
- Mic recording for pronunciation (GOLD feature!)
- Leaderboard + custom kupu backup/restore

---

## 🔑 Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Repo structure | New separate repo | Clean separation, killer product focus |
| Containerization | Podman | Rootless, Docker-compatible, simpler |
| LLM provider | Ollama (cloud → local) | Single API, easy transition |
| Kaitiaki (moderation) | Rule-based CODE | Speed critical (<1ms) |
| Kaiwhakahaere (manager) | CODE | Speed critical (<1ms) |
| Kaiāwhina (helper) | LLM | User-initiated, delay OK |
| Kaiako (teacher) | LLM (async) | Non-blocking |
| Audio input | Mic recording | Gold feature for marae! |
| Distribution | GitHub + install script | One command installs everything |
| Admin access | Code-based (provided at purchase) | Simple, no complex auth |
| Backup | Auto daily + manual export | Leaderboard + custom kupu |

---

## 🤖 Agent Architecture

```
┌─────────────────────────────────────────────────┐
│                 SPEED CRITICAL                  │
│  ┌───────────────┐  ┌────────────────────────┐ │
│  │   Kaitiaki    │  │   Kaiwhakahaere        │ │
│  │  (Guardian)   │  │     (Manager)          │ │
│  │  Rule-based   │  │   Score tracking       │ │
│  │   <1ms        │  │   Connections          │ │
│  └───────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│               LLM-POWERED (OK to wait)          │
│  ┌───────────────┐  ┌────────────────────────┐ │
│  │  Kaiāwhina    │  │      Kaiako            │ │
│  │   (Helper)    │  │    (Teacher)           │ │
│  │ User-initiated│  │  Async, background     │ │
│  │  500-2000ms   │  │   Non-blocking         │ │
│  └───────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 💡 Gold Features Identified

1. **Mic Recording** - Record pronunciation directly in browser
2. **Agent-Assisted Kupu Creation** - Conversational flow for adding words
3. **One-Command Install** - curl | bash, everything works
4. **Offline Capable** - Full game with local LLM, no internet needed
5. **Data Sovereignty** - Everything stays on marae hardware

---

## 💰 Product Tiers

| Edition | Price | Target |
|---------|-------|--------|
| Hapori (Community) | FREE | Open source, bring own LLM |
| Whānau | $79 | Families |
| Kura | $299 | Schools |
| Marae | $499 | Marae |
| Iwi | Custom | Multi-site |

---

## 🚀 Next Steps

1. **Create new repo:** `github.com/ai-kitchen/kapu-ti-marae`
2. **Copy core game logic** from current kapu-ti
3. **Build agent provider layer** (Ollama first)
4. **Implement Kaitiaki** (rule-based moderation)
5. **Build admin panel** with mic recording
6. **Package with Podman**

---

## 📊 Why This Matters

This is AI Kitchen's first "complete product" that embodies:
- ✅ Local-first (runs on their hardware)
- ✅ LLM-agnostic (Ollama, or bring your own)
- ✅ One-time purchase (no subscriptions)
- ✅ Data sovereignty (taonga stays with tangata whenua)
- ✅ Real cultural value (Te Reo revitalization)

**He waka eke noa** - We're all in this waka together.

---

## 📁 Files Changed

```
docs/TABLE_DEFINITION.md    [CREATED]
docs/AGENT_DESIGN.md        [CREATED]
docs/PRODUCT_VISION.md      [CREATED]
docs/SESSION-SUMMARIES/     [THIS FILE]
```

---

**Committed:** Pending  
**Pushed:** Pending  

---

**Ko te reo te mauri o te mana Māori**  
*The language is the life force of Māori identity*
