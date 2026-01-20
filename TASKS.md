# Tasks

## Priority 1: Immediate
- [x] **Commit changes to git** - All MVP code is uncommitted
  - Acceptance: `git status` shows clean working tree
  - Done: Commit a6dba7e

- [x] **Update README.md** - Replace boilerplate with project description
  - Acceptance: README describes Prime Playground features and how to run
  - Done: README now documents all 7 features

## Priority 2: Testing
- [ ] **Manual smoke test: Spiral** - Verify Ulam/Sacks spirals render, zoom/pan works
  - Acceptance: Can generate spirals up to 10k points, highlights work

- [ ] **Manual smoke test: Factorization** - Verify tree animation works
  - Acceptance: Numbers 60, 360, 2310 factorize correctly with animation

- [ ] **Manual smoke test: Hunt** - Complete 3 levels
  - Acceptance: Can navigate grid, lives system works, level progression works

- [ ] **Manual smoke test: Soundscape** - Verify audio playback
  - Acceptance: Play/pause works, tempo/scale changes affect output

- [ ] **Manual smoke test: Art** - Test all 4 modes and export
  - Acceptance: Spiral, particles, waves, mandala render; PNG export works

- [ ] **Manual smoke test: Cryptarithm** - Solve 2 puzzles
  - Acceptance: Letter mapping works, solution validation correct

- [ ] **Manual smoke test: Defense** - Complete 5 waves
  - Acceptance: Tower placement, enemy movement, divisibility damage works

## Priority 3: Polish
- [ ] **Cross-browser test** - Chrome, Firefox, Safari
  - Acceptance: No visual or functional regressions

- [ ] **Mobile responsiveness check** - Test on mobile viewport
  - Acceptance: All features usable on 375px width

## Priority 4: Future Enhancements
- [ ] Add unit tests for lib/prime utilities
- [ ] Add E2E tests with Playwright
- [ ] Performance profiling for spiral with 50k+ points
- [ ] Add more cryptarithm puzzles
- [ ] Add sound effects to games
