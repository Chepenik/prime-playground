# Runbook

## Prerequisites
- Node.js 18+
- npm 9+

## Setup
```bash
cd prime-playground
npm install
```

## Commands

### Development
```bash
npm run dev
# Opens http://localhost:3000
```

### Production Build
```bash
npm run build
npm run start
# Serves production build at http://localhost:3000
```

### Lint
```bash
npm run lint
```

## Environment Variables
None required for local development.

## Project Structure
```
prime-playground/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Dashboard
│   ├── layout.tsx        # Root layout with header/sidebar
│   ├── providers.tsx     # Theme provider
│   ├── spiral/           # Prime Spiral Visualizer
│   ├── factorization/    # Factor Tree
│   ├── hunt/             # Prime Hunt Game
│   ├── defense/          # Prime Defense
│   ├── cryptarithm/      # Cryptarithm Puzzles
│   ├── soundscape/       # Prime Soundscape
│   └── art/              # Prime Art Generator
├── components/
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Header, Sidebar, etc.
├── lib/
│   └── prime/            # Core prime math utilities
├── stores/               # Zustand state stores
├── types/                # TypeScript types
└── [state files]         # PROGRESS.md, TASKS.md, etc.
```

## Common Failures

### Build fails with Set iteration error
**Symptom**: `Type 'Set<X>' can only be iterated through...`
**Fix**: Use `Array.from(new Set(...))` instead of `[...new Set(...)]`

### Tone.js audio doesn't play
**Symptom**: No sound on first click
**Fix**: Audio requires user interaction first. Click "Play" to start AudioContext.

### 404 on dev server first load
**Symptom**: 404 page on `npm run dev`
**Fix**: Wait for App Router to compile. Refresh after "compiled successfully" message.

### Peer dependency warnings on npm install
**Symptom**: `ERESOLVE unable to resolve dependency tree`
**Fix**: Use `npm install --legacy-peer-deps`

### Hydration mismatch with theme
**Symptom**: Console warning about hydration
**Fix**: `suppressHydrationWarning` is set on `<html>`. This is expected with next-themes.

## Deployment
Not yet configured. Options:
- Vercel (recommended for Next.js)
- Docker + any cloud provider
- Static export (`next export` if no SSR features used)
