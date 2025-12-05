# Kapu Tī 🍵

**Te Reo Māori Card Game** - Build sentences, empty your hand, or make the tea!

## What is Kapu Tī?

Kapu Tī (Cup of Tea) is a multiplayer card game designed to make learning Te Reo Māori fun, social, and accessible to all ages. Players race to empty their hand by building grammatically correct sentences. The last player holding cards makes tea for everyone!

## Features

- 🎴 **Color-coded cards** by word type (particles, nouns, verbs, etc.)
- 🔊 **Audio pronunciation** from kupu.maori.nz
- ✅ **Real-time grammar validation** with helpful feedback
- 📚 **100+ vocabulary words** across 3 modules
- 🎯 **Progressive challenges** from simple to complex sentences

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Web Speech API** (TTS fallback)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Game Rules

1. Each player gets 7 color-coded word cards
2. Build grammatically correct Te Reo sentences
3. Say it correctly + translate it to play your cards
4. First to empty their hand wins!
5. ☕ **Last player holding cards makes tea for everyone!**

## Card Colors

| Color | Type | Example |
|-------|------|---------|
| Purple | Particles | Ko, He |
| Gray | Articles | te, ngā |
| Blue | Nouns | whare, ngeru |
| Red | Pronouns | au, koe, ia |
| Green | Verbs | haere, kai |
| Sky Blue | Adjectives | pai, harikoa |
| Yellow | Tense Markers | Kei te |
| Orange | Demonstratives | tēnei, tēnā |

## Sentence Patterns

- **Ko sentences:** `Ko + te/ngā + noun` → "Ko te whare" (The house)
- **He sentences:** `He + noun` → "He kaiako ia" (He is a teacher)
- **Kei te sentences:** `Kei te + adj/verb + pronoun` → "Kei te pai au" (I am good)

## Attribution

- **Audio pronunciation** from [kupu.maori.nz](https://kupu.maori.nz)
- Created by Kelly Keane & Franz Ombler
- Supported by Mā te Reo
- Built following the [12 Guidelines](https://kupu.maori.nz/about/acknowledgements) for Te Reo learning content

## Project Structure

```
src/
├── app/           # Next.js pages
├── components/    # React components (Card, CardHand, SentenceBuilder)
├── lib/           # Validators and audio utilities
├── data/          # Vocabulary and curriculum
└── types/         # TypeScript interfaces
```

## Roadmap

- [x] Core game mechanics
- [x] Audio pronunciation integration
- [x] Grammar validation (Ko, He, Kei te)
- [x] 50 progressive challenges (Module 1 & 2)
- [x] Draw pile mechanic with solvable challenges
- [x] Pass-and-play multiplayer (2-4 players)
- [ ] Online multiplayer (WebSocket - self-hosted)
- [ ] Print-ready card PDF export
- [ ] Speech-to-text validation
- [ ] NZSL video integration
- [ ] Mobile app (PWA)

## Cultural Values

- **Kaitiakitanga** - Guardianship of te reo Māori
- **Manaakitanga** - Hospitality (the tea-making!)
- **Whanaungatanga** - Building relationships through play
- **Ako** - Learning and teaching together

---

*He aha te mea nui o te ao? He tangata, he tangata, he tangata.*
*What is the most important thing in the world? It is people, it is people, it is people.*

---

Built with ❤️ using [AI Kitchen](https://github.com/alexanderjamesmcleod/ai-kitchen)
