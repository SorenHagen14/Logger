# Workout Logger PWA — Build Spec

## Overview

A progressive web app (PWA) workout logger built for iPhone (Safari "Add to Home Screen"). No backend, no hosting cost beyond free static hosting (GitHub Pages). All data stored locally via localStorage/IndexedDB. Dark mode only, purple accent color. Design goal: feels like a professional developer and designer built it, simple enough that no tutorial is needed.

Inspired by the Strong app for layout and interaction patterns.

---

## Tech Stack

- **Frontend:** Single-page React app (or vanilla HTML/JS/CSS — builder's choice for simplicity)
- **Storage:** localStorage or IndexedDB for all persistent data (workout logs, templates, exercises, settings)
- **Hosting:** Static files on GitHub Pages (free, HTTPS included)
- **PWA:** Service worker for offline support, manifest.json for "Add to Home Screen"

---

## Navigation

Bottom nav bar with 3 tabs:

1. **Home** — Templates (top) + Workout History (bottom), combined on one scrollable screen
2. **Exercises** — Manage the exercise library (built-in + custom)
3. **Settings** — App preferences

---

## Home Screen

### Templates Section (top)

- Template cards sorted by **oldest completed first** (template you haven't done in the longest time appears at top)
- Each card shows:
  - Template name (bold)
  - "Last completed: X days/weeks/months ago" in muted text
- Relative time formatting rules:
  - "1 day ago", "3 days ago", "1 week ago", "2 weeks ago", "1 month ago", "3 months ago", etc.
  - If never completed: "Never completed"
- Tapping a template card **starts a new workout** from that template
- A "+" button to create a new template

### Workout History Section (bottom)

- Reverse-chronological list of completed workouts
- Each entry shows: template name, date, number of exercises
- Tapping an entry shows a read-only view of the logged workout (exercises, sets, weights, reps, notes)
- Regular notes (non-sticky) are viewable here in history even after they've been dismissed from active display

### Template Creation/Editing

- Name the template
- Add exercises from the exercise library (search bar + muscle group filter chips)
- Set default number of sets per exercise
- Reorder exercises via long-press drag
- Templates are editable at any time from the home screen (outside of an active workout)

---

## Active Workout Screen

Entered by tapping a template card on the home screen. Continuous scrollable list of all exercises. Copy Strong's layout: each exercise lives inside a visual card.

### Exercise Card Layout

```
┌─────────────────────────────────────────────┐
│ [Exercise Name]                    [⋮ menu] │
│ [Yellow note box if note exists, 1-2 lines] │
│                                             │
│  Set   Previous   lbs    Reps    ✓          │
│  1     135x10     [135]  [10]    [ ]        │
│  2     135x8      [135]  [8]     [ ]        │
│  3     140x6      [   ]  [  ]    [ ]        │
│                              + Set          │
└─────────────────────────────────────────────┘
```

### Row Details

- **Set number column:** Tap the set number to open a dropdown with set-type options:
  - Normal (white) — default
  - Warm-up (yellow)
  - Failure (red)
  - Drop set (green)
- **Previous column:** Shows last workout's data as "135x10" format. Shows "—" if no previous data exists for that exercise.
- **Weight column:** Inline input field. Ghost text (low opacity) pre-fills last workout's weight. Ghost text reappears if user clears the field. Respects per-exercise unit preference (lbs/kg) and global default.
- **Reps column:** Same behavior as weight — ghost text from last workout, reappears on clear.
- **Checkbox column:** Tap to mark set complete. Turns green when checked. Tap again to uncheck (timer resets to original state). Checking triggers the rest timer for normal sets, warm-up sets, and failure sets. Does NOT trigger rest timer for drop sets or sets inside a superset (until the master/final set of the superset group is completed).
- **"+ Set" link:** Appears below the last set row of each exercise. Compact, not a full button. Adds a new blank set row.

### Swipe to Delete Set

- Swipe left on any set row to reveal a red delete button with a trash can icon
- Completing the swipe deletes the set
- A 5-second undo toast appears at the bottom with a linear progress bar animation that depletes smoothly over the 5 seconds
- If the user deletes the **last remaining set**, show a prompt: "That's the last set. Remove this exercise from the workout?" Yes/No. Do not auto-remove.

### RPE Input

- RPE is **not visible** on the set row by default
- Accessible per set: tap on a completed set row to expand a detail area, or access via a subtle expandable section
- Dropdown selector, 1 through 10
- Stored per set, visible in workout history

### Three-Dot Menu (per exercise)

Grouped with subtle dividers:

**Notes**
- Add note (regular — shows next workout only, then moves to history-only)
- Add sticky note (persists on all future workouts)

**Actions**
- Replace exercise (see replacement behavior below)
- Create superset (see superset behavior below)
- Remove exercise (confirmation prompt)

**Preferences**
- Weight unit (lbs / kg) — overrides global default for this exercise in this template
- Bar type (informational label, does not affect weight calculation):
  - Olympic bar (45 lb)
  - Short bar (45 lb)
  - EZ curl bar (33 lb)
  - Hex bar (20 lb)
  - Heavy bar (75 lb)
  - None (0 lb)
- Rest timer override (per exercise, overrides global default)

### Notes Display

- If a note exists (regular or sticky), a yellow box appears directly below the exercise name inside the card
- Capped at 1-2 lines with "show more" tap to expand
- If both a regular note and sticky note exist, stack them both (each capped)
- Use a small pin icon for sticky notes and a single-use icon for regular notes to differentiate
- Regular note lifecycle: appears on the next completed workout for that template, then stops being surfaced (still viewable in workout history)

### Rest Timer

- Inline between sets, matching Strong's layout
- Default rest time: 2 minutes (configurable in Settings)
- Per-exercise override available in three-dot menu
- Auto-starts when a normal/warm-up/failure set checkbox is checked
- Does NOT auto-start for drop sets
- Does NOT auto-start for individual sets within a superset (only when the final set of the superset group is completed)
- Skip button available on the timer
- Vibration/sound alert when timer completes
- If user unchecks the set, timer resets to its original state

### Supersets

- Created via three-dot menu > "Create superset"
- Opens a modal showing all exercises in the current workout
- User taps all exercises to include in the superset, then taps "Save"
- Superset exercises are visually grouped (indented, bracketed, or connected with a purple accent line/border)
- "Superset" is an exercise-level grouping, not a set-type tag. The set-type dropdown (warm-up/failure/drop) remains separate and applies within individual exercises
- Rest timer only triggers when the **last set of the last exercise** in the superset group is checked off
- Each exercise in the superset still has its own card, but they are visually connected

### Replace Exercise

- Accessed via three-dot menu
- Opens the exercise library picker (search + muscle group filters)
- If any sets have been logged on the current exercise, show confirmation: "You've logged X sets for [Exercise Name]. This will be deleted. Continue?"
- On confirm: old exercise data is deleted, new exercise appears with blank sets matching the old set count
- 5-second undo toast with linear-depleting progress bar (same as set delete)

### Reordering Exercises Mid-Workout

- Long-press on an exercise card to initiate drag
- Drag to reorder within the workout
- No conflict with other gestures (superset creation is menu-based, not drag-based)

### Finishing a Workout

- **"Finish Workout" button** in the **top right** of the screen (like Strong)
- Tapping shows a confirmation dialog
- On confirm, shows the **Workout Summary Screen**

### Cancel Workout

- "Cancel Workout" button at the bottom of the exercise list, styled in red
- Tapping shows a confirmation dialog: "Are you sure? All logged data for this session will be lost."
- On confirm, returns to home screen with no data saved

### Workout Summary Screen

Shown after finishing a workout:

- Workout/template name
- Date
- Total duration
- List of exercises completed with weight and reps per set
- Number of PRs hit (personal records — new max weight or max reps for any exercise)
- If exercise order was changed during the workout: "Exercise order was changed. Save new order to template?" — toggle or button, **defaults to NO**
- "Done" button returns to home screen

---

## Exercises Tab

### Exercise Library

- Search bar at top
- Muscle group filter chips below search bar:
  - Chest
  - Back
  - Shoulders
  - Biceps
  - Triceps
  - Quads
  - Hamstrings
  - Calves
  - Core
- Each exercise has a primary muscle group tag
- List view of exercises, filterable and searchable
- "+" button to create a custom exercise (name + muscle group tag required)
- Custom exercises appear alongside built-in exercises
- Ability to edit or delete custom exercises (built-in exercises cannot be deleted)

### Built-In Exercise List

Organized by muscle group. This is the baseline library — kept focused, not exhaustive:

**Chest**
- Flat Barbell Bench Press
- Flat Dumbbell Bench Press
- Flat Smith Machine Bench Press
- Incline Barbell Bench Press
- Incline Dumbbell Bench Press
- Incline Smith Machine Bench Press
- Decline Barbell Bench Press
- Decline Dumbbell Bench Press
- Cable Chest Fly (High to Low)
- Cable Chest Fly (Low to High)
- Cable Chest Fly (Mid)
- Machine Chest Fly
- Dumbbell Chest Fly
- Chest Dip
- Machine Chest Press

**Back**
- Barbell Bent-Over Row
- Dumbbell Row
- Cable Lat Pulldown
- Cable Lat Pullover
- Dumbbell Lat Pullover
- Seated Cable Row
- T-Bar Row
- Pull-Up
- Chin-Up
- Machine Row
- Straight-Arm Pulldown
- Barbell Deadlift
- Dumbbell Deadlift

**Shoulders**
- Dumbbell Shoulder Press
- Barbell Overhead Press
- Smith Machine Shoulder Press
- Dumbbell Lateral Raise
- Machine Lateral Raise
- Cable Lateral Raise
- Dumbbell Front Raise
- Cable Front Raise
- Dumbbell Rear Delt Fly
- Cable Face Pull
- Machine Reverse Fly
- Barbell Upright Row

**Biceps**
- Barbell Curl
- Dumbbell Curl
- EZ Bar Curl
- Hammer Curl
- Cable Curl
- Preacher Curl
- Incline Dumbbell Curl
- Concentration Curl
- Machine Curl

**Triceps**
- Overhead Tricep Extension (Dumbbell)
- Overhead Tricep Extension (Cable)
- Cable Tricep Pushdown (Rope)
- Cable Tricep Pushdown (Bar)
- Skull Crushers (EZ Bar)
- Skull Crushers (Dumbbell)
- Tricep Dip
- Close-Grip Bench Press
- Machine Tricep Extension

**Quads**
- Barbell Back Squat
- Smith Machine Back Squat
- Front Squat
- Leg Press
- Leg Extension
- Hack Squat
- Goblet Squat
- Bulgarian Split Squat
- Walking Lunge
- Dumbbell Lunge

**Hamstrings**
- Romanian Deadlift (Barbell)
- Romanian Deadlift (Dumbbell)
- Lying Leg Curl
- Seated Leg Curl
- Nordic Hamstring Curl
- Stiff-Leg Deadlift
- Cable Pull-Through
- Glute-Ham Raise

**Calves**
- Standing Calf Raise (Machine)
- Seated Calf Raise
- Smith Machine Calf Raise
- Leg Press Calf Raise
- Dumbbell Calf Raise

**Core**
- Cable Crunch
- Hanging Leg Raise
- Ab Wheel Rollout
- Plank
- Russian Twist
- Decline Sit-Up
- Machine Crunch
- Woodchop (Cable)

---

## Settings Tab

- **Default rest timer:** Adjustable duration (default: 2 minutes)
- **Default weight unit:** lbs or kg (applies globally, can be overridden per exercise via three-dot menu)

---

## Data Model (localStorage/IndexedDB)

### Exercise
```json
{
  "id": "uuid",
  "name": "Incline Dumbbell Bench Press",
  "muscleGroup": "Chest",
  "isBuiltIn": true
}
```

### Template
```json
{
  "id": "uuid",
  "name": "Push Day",
  "lastCompletedAt": "2025-01-15T10:30:00Z",
  "exercises": [
    {
      "exerciseId": "uuid",
      "defaultSets": 3,
      "restTimerSeconds": 120,
      "weightUnit": "lbs",
      "barType": "olympic_45"
    }
  ],
  "supersets": [
    {
      "exerciseIds": ["uuid1", "uuid2"]
    }
  ]
}
```

### Workout (completed)
```json
{
  "id": "uuid",
  "templateId": "uuid",
  "startedAt": "2025-01-15T10:30:00Z",
  "completedAt": "2025-01-15T11:45:00Z",
  "exercises": [
    {
      "exerciseId": "uuid",
      "exerciseName": "Incline Dumbbell Bench Press",
      "sets": [
        {
          "setNumber": 1,
          "setType": "normal",
          "weight": 135,
          "reps": 10,
          "rpe": 7,
          "weightUnit": "lbs"
        }
      ],
      "notes": [
        {
          "type": "regular",
          "text": "Felt weak. Didn't eat enough.",
          "shownOnNextWorkout": false
        }
      ]
    }
  ]
}
```

### Settings
```json
{
  "defaultRestTimerSeconds": 120,
  "defaultWeightUnit": "lbs"
}
```

---

## Design System

### Colors

- **Background:** #0D0D0F (near black)
- **Card/surface:** #1A1A1E
- **Border/divider:** #2A2A2E
- **Primary text:** #FFFFFF
- **Secondary text:** #8A8A8E (muted)
- **Accent (purple):** #7C3AED
- **Set type — warm-up:** #EAB308 (yellow)
- **Set type — failure:** #EF4444 (red)
- **Set type — drop set:** #22C55E (green)
- **Set type — superset:** #A855F7 (purple, lighter than accent)
- **Checkbox complete:** #22C55E (green)
- **Cancel/destructive:** #EF4444 (red)
- **Note box background:** #423006 (dark yellow/amber tint)
- **Ghost text (previous data):** rgba(255, 255, 255, 0.25)

### Typography

- System font stack (-apple-system, BlinkMacSystemFont, SF Pro) for native iOS feel
- Exercise names: 16px semibold
- Set row data: 14px regular
- Section headers: 13px uppercase, muted color, letterspaced
- Card subtitles (last completed): 13px regular, muted

### Spacing

- Card padding: 16px
- Card gap: 12px
- Set row height: ~44px (iOS minimum tap target)
- Bottom nav height: 56px + safe area

### Interactions

- All tap targets minimum 44x44px
- Undo toasts: bottom of screen, 5-second linear progress bar, smooth animation
- Long-press to drag: 300ms hold to initiate
- Swipe-to-delete: reveals red zone with trash icon, full swipe completes deletion

---

## PWA Requirements

- `manifest.json` with app name, icons, theme color (#0D0D0F), background color (#0D0D0F), display: standalone
- Service worker for offline caching of all static assets
- App icons at 192x192 and 512x512
- Status bar: black-translucent

---

## Out of Scope for v1

- Cloud sync / backend
- User accounts / auth
- Template sharing / export
- Progress charts / analytics (beyond PR count on summary)
- Apple HealthKit integration
- Plate calculator
- Workout scheduling / calendar
