# Workout Logger PWA — CLAUDE.md

## Project

A no-backend workout logger PWA for iPhone (Safari "Add to Home Screen"). All data in localStorage/IndexedDB. Static hosting on GitHub Pages. Dark mode only, purple accent. Feels like Strong.

Full spec: `workout-logger-spec.md`

## Tech Stack

- **Framework:** React (Vite)
- **Styling:** CSS Modules or plain CSS — no Tailwind
- **Storage:** IndexedDB (via `idb` wrapper) for workouts/templates, localStorage for settings
- **PWA:** Vite PWA plugin (Workbox) for service worker + manifest
- **No backend. No auth. No external APIs.**

## Dev Commands

```bash
npm run dev        # Vite dev server
npm run build      # Production build
npm run preview    # Preview production build locally
```

## Architecture

```
src/
  components/       # UI components (one file per component)
  screens/          # Home, ActiveWorkout, Exercises, Settings, WorkoutSummary
  hooks/            # useWorkout, useTimer, useStorage, useTemplates
  data/             # builtInExercises.js, db.js (IndexedDB layer)
  utils/            # formatRelativeTime, generateId, etc.
  App.jsx
  main.jsx
index.html
manifest.json
```

Keep components focused. If a file exceeds ~200 lines, it probably does too much.

## Data Model

See `workout-logger-spec.md` → "Data Model" section. Use the exact schemas defined there. Store keys: `exercises`, `templates`, `workouts`, `settings`.

## Design Tokens

```css
--bg: #0D0D0F;
--surface: #1A1A1E;
--border: #2A2A2E;
--text: #FFFFFF;
--text-muted: #8A8A8E;
--accent: #7C3AED;
--yellow: #EAB308;
--red: #EF4444;
--green: #22C55E;
--superset: #A855F7;
--note-bg: #423006;
--ghost: rgba(255,255,255,0.25);
```

Font: `-apple-system, BlinkMacSystemFont, "SF Pro", sans-serif`

Tap targets: minimum 44×44px. Bottom nav: 56px + safe area.

## Coding Principles

### 1. Think Before Coding

State assumptions explicitly. If a spec detail is ambiguous, ask — don't silently pick one. If a simpler approach exists, say so.

### 2. Simplicity First

Minimum code that solves the problem. No speculative features. No abstractions for single-use code. No extra configurability. If it could be 50 lines, don't write 200.

### 3. Surgical Changes

Touch only what the task requires. Don't improve adjacent code, refactor unrelated things, or clean up pre-existing style. Match what's already there. If you notice unrelated dead code, mention it — don't delete it.

### 4. Goal-Driven Execution

Before implementing anything non-trivial, state:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```
Transform vague tasks into verifiable goals. "Add the rest timer" → "timer starts on set checkbox, counts down, vibrates on complete, can be skipped."

## Key Behaviors to Get Right

- **Ghost text:** Weight/reps inputs pre-fill from last workout at low opacity. Ghost reappears if user clears the field. This is NOT a placeholder — it's a visual overlay or placeholder attribute that disappears on focus.
- **Rest timer:** Auto-starts on normal/warmup/failure set check. Does NOT start on drop sets or mid-superset sets (only on last exercise's last set in a superset).
- **Template sort order:** Oldest-completed-first. "Never completed" goes to top.
- **Undo toasts:** 5-second linear-depleting progress bar. Appears on: set delete, exercise replace.
- **Notes lifecycle:** Regular notes appear on the *next* workout only, then archive to history. Sticky notes persist forever.
- **PR detection:** Track new max weight or max reps per exercise across all workouts.

## Out of Scope (v1)

No cloud sync, no user accounts, no charts/analytics beyond PR count, no HealthKit, no plate calculator, no scheduling.

If a feature isn't in the spec, don't build it.
