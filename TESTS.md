# Tests

## Test Framework Status
No automated test framework configured yet. Using manual smoke tests for MVP.

## Manual Smoke Test Checklist

### Build & Lint
- [ ] `npm run build` passes
- [ ] `npm run lint` passes (or no critical errors)

### Dashboard (`/`)
- [ ] Page loads without errors
- [ ] All 7 feature cards visible
- [ ] Each card links to correct route
- [ ] Theme toggle works (dark/light)
- [ ] Sidebar navigation works (desktop)
- [ ] Mobile nav works (< 1024px)

### Prime Spiral (`/spiral`)
- [ ] Ulam spiral renders
- [ ] Sacks spiral renders (toggle)
- [ ] Zoom slider works
- [ ] Size slider works (up to 50k)
- [ ] Pan by dragging works
- [ ] Hover shows number info
- [ ] Twin prime highlight works
- [ ] Sophie Germain highlight works

### Factorization (`/factorization`)
- [ ] Input accepts numbers 2-1000000
- [ ] "Build Tree" animates tree construction
- [ ] Quick examples (60, 120, 360...) work
- [ ] Prime numbers show as single node
- [ ] Factorization summary is correct
- [ ] Reset clears the tree

### Prime Hunt (`/hunt`)
- [ ] "Start Game" initializes grid
- [ ] Arrow keys move player
- [ ] WASD keys move player
- [ ] Mobile controls work
- [ ] Stepping on prime scores points
- [ ] Stepping on composite loses life
- [ ] Reaching goal wins level
- [ ] 0 lives = game over
- [ ] Next level increases difficulty

### Prime Soundscape (`/soundscape`)
- [ ] "Play" starts audio (after user interaction)
- [ ] "Pause" stops playback
- [ ] "Stop" resets position
- [ ] Tempo slider changes speed
- [ ] Volume slider works
- [ ] Scale selection changes notes
- [ ] Visual sequence updates with playback

### Prime Art (`/art`)
- [ ] Spiral mode renders
- [ ] Particles mode renders
- [ ] Waves mode renders
- [ ] Mandala mode renders
- [ ] Color scheme changes colors
- [ ] Density slider affects output
- [ ] Animation toggle works
- [ ] "Randomize" changes settings
- [ ] "Export PNG" downloads image

### Cryptarithm (`/cryptarithm`)
- [ ] Puzzle loads on page visit
- [ ] Clicking letter selects it
- [ ] Clicking digit assigns to selected letter
- [ ] "Check" validates solution
- [ ] Wrong solution shows error
- [ ] Correct solution shows success
- [ ] "Next Puzzle" loads new puzzle
- [ ] "Show Hint" displays hint
- [ ] "Reset" clears all assignments
- [ ] Jump to puzzle buttons work

### Prime Defense (`/defense`)
- [ ] "Start Game" initializes board
- [ ] Tower selection buttons work
- [ ] Clicking grid places tower
- [ ] Cannot place on path
- [ ] "Start Wave" spawns enemies
- [ ] Enemies follow path
- [ ] Towers attack divisible enemies
- [ ] Money increases when enemies die
- [ ] Lives decrease when enemies reach end
- [ ] Wave 10 completion = victory
- [ ] 0 lives = defeat

## Future: Automated Tests
- Unit tests for `lib/prime` functions (Jest/Vitest)
- Component tests for UI (React Testing Library)
- E2E tests for user flows (Playwright)
