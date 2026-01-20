# Prime Playground

A Next.js superapp combining 7 interactive prime number features into one cohesive experience.

## Features

### 1. Prime Spiral Visualizer (`/spiral`)
Explore Ulam and Sacks spirals revealing hidden patterns in prime distribution. Interactive zoom, pan, and special prime highlighting.

### 2. Prime Factorization Tree (`/factorization`)
Visualize prime factorization as animated tree structures. Watch numbers break down into their prime components.

### 3. Prime Hunt (`/hunt`)
Grid puzzle game where you navigate to the goal by stepping only on prime numbers. Stepping on composites costs lives!

### 4. Prime Defense (`/defense`)
Tower defense with a mathematical twist: prime towers only damage enemies whose HP is divisible by the tower's prime number.

### 5. Cryptarithm Puzzles (`/cryptarithm`)
Solve classic word-math puzzles where letters represent digits. Each puzzle has a unique solution.

### 6. Prime Soundscape (`/soundscape`)
Convert prime number sequences into musical compositions using Tone.js. Experiment with scales, tempos, and octaves.

### 7. Prime Art Generator (`/art`)
Generate beautiful art from prime number distributions. Four modes: spiral, particles, waves, and mandala.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **3D Graphics**: Three.js via @react-three/fiber
- **Audio**: Tone.js
- **State**: Zustand
- **Animation**: Framer Motion

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to explore the playground.

## Project Structure

```
prime-playground/
├── app/                  # Next.js App Router pages
├── components/ui/        # shadcn/ui components
├── components/layout/    # Header, Sidebar, Nav
├── lib/prime/            # Core prime math utilities
├── stores/               # Zustand state stores
└── types/                # TypeScript definitions
```

## Core Prime Utilities

The `/lib/prime` module provides:
- `isPrime(n)` - Primality testing
- `sieveOfEratosthenes(n)` - Generate primes up to n
- `factorize(n)` - Prime factorization
- `buildFactorTree(n)` - Factor tree structure
- `generateUlamSpiral(n)` - Ulam spiral coordinates
- `generateSacksSpiral(n)` - Sacks spiral coordinates
- Special prime checks: twin primes, Sophie Germain primes

## License

MIT
