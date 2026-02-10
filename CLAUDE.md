# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

This is a Next.js 14 App Router application featuring 7 interactive prime number experiences.

### Key Technologies
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives)
- **3D/Graphics**: Three.js via @react-three/fiber and @react-three/drei
- **Audio**: Tone.js for sound synthesis
- **State**: Zustand stores (one per feature)
- **Animation**: Framer Motion

### Core Structure

**`lib/prime/index.ts`** - All prime number math utilities. Contains `isPrime`, `sieveOfEratosthenes`, `factorize`, `buildFactorTree`, spiral generators (Ulam/Sacks), and special prime checks (twin, Sophie Germain, Mersenne).

**`stores/`** - Zustand stores for each feature's state:
- `spiral-store.ts`, `factorization-store.ts`, `hunt-store.ts`, `defense-store.ts`, `cryptarithm-store.ts`, `soundscape-store.ts`, `art-store.ts`

**`types/index.ts`** - TypeScript interfaces for game states, grid cells, towers, enemies, puzzles, and art settings.

**`app/`** - Each feature has its own route: `/spiral`, `/factorization`, `/hunt`, `/defense`, `/cryptarithm`, `/soundscape`, `/art`

**`components/ui/`** - shadcn/ui components (button, card, slider, tabs, etc.)

**`components/layout/`** - App shell: Header, Sidebar, MobileNav, ThemeToggle

### Path Alias
`@/*` maps to repository root (configured in tsconfig.json)

### Providers
`app/providers.tsx` wraps the app with ThemeProvider (next-themes) and TooltipProvider.
