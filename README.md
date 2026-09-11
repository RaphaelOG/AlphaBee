# AlphaBee

A playful, honeycomb-themed spelling game for kids — built with **React Native**, **Expo**, and **TypeScript**.

Children practice spelling through a two-round flow: first **look** at the word, then **listen** and spell it from memory. Parents and teachers can also add custom vocabulary lists.

## Features

- **Landing experience** — warm cream/honey palette, animated bee circle, honeycomb CTA
- **Grade Level Quest** — sequenced K–5 phonics path (CVC, digraphs, blends, silent e, vowel teams, and more) plus sight-word units
- **Practice Hive** — parents/teachers enter custom weekly spelling lists
- **Look → Listen rounds** — spell once with the word visible, then again using text-to-speech (`expo-speech`)
- **Hexagonal UI** — honeycomb letter slots, keyboard keys, and buttons (SVG)
- **Feedback & rewards** — gold flash / gentle shake, haptics, honey drops, stars, and a collectible hive

## Tech Stack

| Area | Tools |
|------|--------|
| Framework | React Native, Expo SDK 57 |
| Language | TypeScript |
| Navigation | React Navigation (native stack) |
| UI | `react-native-svg`, `expo-linear-gradient`, custom theme tokens |
| Motion | React Native `Animated` API |
| Audio / feedback | `expo-speech`, `expo-haptics` |
| Fonts | Nunito, Baloo 2 via Expo Google Fonts |

## Getting Started

### Prerequisites

- Node.js 22+ (recommended for Expo 57)
- npm
- Expo Go on a phone, or an iOS Simulator / Android Emulator

### Install & run

```bash
npm install
npx expo start
or npm start
```

Then press:

- `i` — iOS simulator  
- `a` — Android emulator  
- `w` — web  
- Or scan the QR code with **Expo Go**

## Project Structure

```
AlphaBee/
├── App.tsx                 # Root: fonts + navigation
├── app.json                # Expo config
├── src/
│   ├── components/         # Reusable UI (Hexagon, AlphaBee, keyboard, etc.)
│   ├── screens/            # Landing, ModeSelect, Game, HiveRewards
│   ├── navigation/         # Typed stack param list
│   ├── data/               # Grade-level word banks
│   └── theme/              # Colors & typography
└── assets/                 # App icons & splash
```

### Screens

| Screen | Route | Purpose |
|--------|--------|---------|
| `LandingScreen` | `Landing` | Splash / main menu |
| `ModeSelectScreen` | `ModeSelect` | Choose Grade Quest or Practice Hive |
| `GameScreen` | `Game` | Spelling gameplay |
| `HiveRewardsScreen` | `HiveRewards` | Progress & collectibles |

## How Gameplay Works

1. Pick **Grade Quest** (K–5) or open **Practice Hive** and add custom words.
2. **Round 1 — Look & Spell:** the word is shown; fill the honeycomb slots.
3. **Round 2 — Listen & Spell:** the same word is hidden and spoken aloud (tap to hear again).
4. Correct answers earn honey (and stars after the listen round). Visit **My Hive** to see rewards.

## Scripts

```bash
npm start          # same as npx expo start
npm run ios        # start and open iOS
npm run android    # start and open Android
npm run web        # start web
```

## Design Notes

- **Palette:** honey gold (`#F1C40F`, `#FFD700`), cream (`#FFFDD0`), dark brown text
- **Theme:** modern cartoon / friendly honeycomb motifs throughout layout and controls
- Components are modular so cards, modals, and hex controls can be reused across screens


