# Workout Logger PWA — CLAUDE.md

## Project

A no-backend workout logger PWA for iPhone (Safari "Add to Home Screen"). All data in localStorage/IndexedDB. Static hosting on GitHub Pages. Dark mode only, monochromatic white accent. Swiss-inspired editorial brutalist aesthetic.

Full spec: `workout-logger-spec.md`
Design system: `docs/design.md` — art direction, color palette, typography rules, component guidelines

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

## Wireframes & Flow

See `docs/wireframes-flow.md` for ASCII wireframes of every screen and the full navigation flow.
Use `@` markers to find screens/components quickly:

### Screens
- **@HomeScreen** → `src/screens/HomeScreen.jsx` — Templates (sorted oldest-completed-first) + workout history
- **@TemplateEditor** → `src/screens/TemplateEditor.jsx` — Create/edit templates, auto-opens picker on new
- **@ActiveWorkout** → `src/screens/ActiveWorkout.jsx` — Set logging, center-aligned grid, popover set types
- **@WorkoutSummary** → `src/screens/WorkoutSummary.jsx` — Post-workout stats, PR detection
- **@WorkoutDetail** → `src/screens/WorkoutDetail.jsx` — Read-only history view
- **@ExercisesScreen** → `src/screens/ExercisesScreen.jsx` — Exercise library with search + filter chips
- **@SettingsScreen** → `src/screens/SettingsScreen.jsx` — Rest timer, weight unit, data export/import

### Components
- **@BottomNav** → `src/components/BottomNav.jsx` — 3-tab nav, hidden during active workout
- **@ExercisePicker** → `src/components/ExercisePicker.jsx` — Slide-up modal, search + muscle group chips
- **@ExerciseMenu** → `src/components/ExerciseMenu.jsx` — Three-dot menu (notes, replace, superset, prefs)
- **@RestTimer** → `src/components/RestTimer.jsx` — Circular countdown, skip button
- **@UndoToast** → `src/components/UndoToast.jsx` — 5s linear-depleting progress bar
- **@ConfirmDialog** → `src/components/ConfirmDialog.jsx` — Slide-up confirmation modal

### Data & Utils
- `src/data/exercises.js` — 90+ built-in exercises with muscle groups
- `src/data/db.js` — localStorage wrapper (templates, workouts, settings, active workout)
- `src/utils/helpers.js` — formatRelativeTime, formatDate, formatDuration, generateId

## Architecture

```
src/
  components/       # Shared UI (BottomNav, ExercisePicker, RestTimer, etc.)
  screens/          # Full-page views (HomeScreen, ActiveWorkout, etc.)
  data/             # exercises.js (built-in library), db.js (localStorage layer)
  utils/            # helpers.js (formatting, ID generation)
  App.jsx           # Root — screen routing, workout lifecycle, AppContext
  main.jsx          # Entry point
docs/
  wireframes-flow.md  # ASCII wireframes for every screen + nav flow
```

Keep components focused. If a file exceeds ~200 lines, it probably does too much.

## Data Model

See `workout-logger-spec.md` → "Data Model" section. Use the exact schemas defined there. Store keys: `exercises`, `templates`, `workouts`, `settings`.

## Design Tokens

```css
--bg: #0F0F0F;
--surface: #1A1A1A;
--surface-hover: #222222;
--border: #2D2D2D;
--text: #FFFFFF;
--text-secondary: #8B8B8B;
--text-muted: #555555;
--accent: #FF574D;
--accent-text: #FFFFFF;
--accent-dim: rgba(255, 87, 77, 0.12);
--yellow: #EAB308;
--red: #EF4444;
--green: #00E676;
--note-bg: #1A1A0A;
--ghost: rgba(255, 255, 255, 0.08);
--highlight: rgba(255, 255, 255, 0.04);
--green-dim: rgba(0, 230, 118, 0.04);
--shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
--font-serif: "Playfair Display", Georgia, serif;
```

Fonts: `"Inter"` for UI (400–900), `"Playfair Display"` for hero/display serif-italic accents. Both via Google Fonts.

Design language: Zero border radius. ALL CAPS for nav/labels. Massive display type for stats/numbers. 1px structural lines as dividers. `✦` for PRs. Coral (`--accent`) for primary actions, active nav states, and hero display text. White text on accent backgrounds via `--accent-text`. Functional colors (yellow/red/green) for set types and status. All colors referenced via CSS variables — no hardcoded hex values in components.

Tap targets: minimum 44×44px. Bottom nav: 56px + safe area.

## Model Routing
- **Gemini**: reading any file over 400 lines. Do not store context from these reads — extract what you need and move on.
- **Haiku 4.5**: file reads under 400 lines, surgical one-liner edits, doc updates (PROGRESS.md, CHANGELOG.md, wireframes, SCHEMA_REFERENCE.md, etc.).
- **Sonnet / Opus 4.6**: reasoning, coding, architecture decisions, multi-file changes, anything that requires understanding tradeoffs or writing non-trivial logic.

## Wireframe Maintenance

When modifying any screen or component, update the corresponding wireframe in `docs/wireframes-flow.md` to reflect the change. Wireframes are the source of truth for what the UI *currently* looks like — they must stay in sync with the code. If a layout, interaction, or flow changes, update the ASCII wireframe and its annotations before considering the task complete.

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

- **Center alignment:** All @ActiveWorkout set columns (SET, PREV, LBS, REPS, checkbox) are center-aligned. Inputs show centered `—` as placeholder.
- **Checkbox visibility:** Only render the checkbox when `weight !== ''` OR `reps !== ''` OR `set.completed`. Empty rows show no checkbox.
- **Set type popover:** Tap the set number to open a `position:fixed` popover anchored next to it (not inline buttons). All labels bold. Normal=white, Warm-up=yellow, Failure=red, Drop Set=green.
- **No elapsed timer:** @ActiveWorkout header shows only template name + Finish button.
- **Ghost text:** Weight/reps inputs pre-fill from last workout via placeholder. Placeholder is `—` when no previous data.
- **Rest timer:** @RestTimer auto-starts on normal/warmup/failure set check. Does NOT start on drop sets or mid-superset sets.
- **Template sort order:** Oldest-completed-first. "Never completed" goes to top.
- **Template creation flow:** @TemplateEditor auto-opens @ExercisePicker on new template. Back arrow (not "Cancel" text). No card borders on exercise rows.
- **Undo toasts:** @UndoToast — 5-second linear-depleting progress bar. Appears on: set delete, exercise replace.
- **Notes lifecycle:** Regular notes appear on the *next* workout only, then archive to history. Sticky notes persist forever.
- **PR detection:** @WorkoutSummary tracks new max weight or max reps per exercise across all workouts.

## Out of Scope (v1)

No cloud sync, no user accounts, no charts/analytics beyond PR count, no HealthKit, no plate calculator, no scheduling.

If a feature isn't in the spec, don't build it.
