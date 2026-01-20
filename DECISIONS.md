# Decisions Log

## 2026-01-20: Use Array.from() for Set iteration
**Decision**: Use `Array.from(new Set(...))` instead of spread operator `[...new Set(...)]`

**Rationale**: TypeScript strict mode with default target doesn't support Set iteration via spread without `downlevelIteration` flag.

**Alternatives**:
- Enable `downlevelIteration` in tsconfig (adds runtime overhead)
- Use Array.from() (zero overhead, explicit)

**Consequence**: Slightly more verbose code but zero runtime cost.

---

## 2026-01-20: Client-side only for games/visualizations
**Decision**: All interactive features are client components (`"use client"`)

**Rationale**:
- Games require client-side state (Zustand)
- Canvas/WebGL requires browser APIs
- Audio (Tone.js) requires client-side
- SSR would add complexity with no benefit

**Alternatives**:
- Hybrid SSR for static content (unnecessary complexity)

**Consequence**: All feature pages are client components. Dashboard is server component.

---

## 2026-01-20: Zustand for state management
**Decision**: Use Zustand instead of React Context or Redux

**Rationale**:
- Minimal boilerplate
- No provider wrapping needed
- Works well with TypeScript
- Sufficient for local UI state

**Alternatives**:
- React Context (more boilerplate, prop drilling issues)
- Redux (overkill for this scope)
- Jotai (similar to Zustand, less familiar)

**Consequence**: Each feature has its own store in `/stores`.

---

## 2026-01-20: shadcn/ui manual setup
**Decision**: Manually create shadcn/ui components instead of using CLI

**Rationale**: CLI had peer dependency conflicts with React 18 + newer packages

**Alternatives**:
- Use `--legacy-peer-deps` with CLI (tried, still had issues)
- Use different component library (would change design)

**Consequence**: Components in `/components/ui` are hand-written versions of shadcn patterns.
