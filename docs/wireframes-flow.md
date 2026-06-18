# Wireframes & App Flow

Reference for all screen layouts and navigation paths.
Each wireframe maps to a source file with `@` markers for quick lookup.

---

## App Flow

```
┌─────────────────────────────────────────────────────┐
│                    APP LAUNCH                        │
│                       │                              │
│              ┌────────┴────────┐                     │
│              │  Active workout  │                    │
│              │  in localStorage?│                    │
│              └───┬─────────┬───┘                     │
│                 YES        NO                        │
│                  │          │                         │
│         @ActiveWorkout   @HomeScreen                 │
│                  │          │                         │
│                  │    ┌─────┴──────────┐              │
│                  │    │  Bottom Nav    │              │
│                  │    │  ┌──┬──┬──┐   │              │
│                  │    │  │H │Ex│Se│   │              │
│                  │    │  └──┴──┴──┘   │              │
│                  │    └───┬──┬──┬─────┘              │
│                  │        │  │  │                     │
│                  │  @HomeScreen │ @SettingsScreen     │
│                  │        │  @ExercisesScreen         │
│                  │        │                           │
│                  │   Tap template card                │
│                  │        │                           │
│                  ├────────┘                           │
│                  │                                    │
│          @ActiveWorkout                              │
│                  │                                    │
│          ┌──────┴──────┐                             │
│       Finish        Cancel                           │
│          │             │                              │
│  @WorkoutSummary   @HomeScreen                       │
│          │                                            │
│       Done                                           │
│          │                                            │
│     @HomeScreen                                      │
│     (history updated)                                │
└─────────────────────────────────────────────────────┘
```

---

## Screen Wireframes

### @HomeScreen — `src/screens/HomeScreen.jsx`

```
┌─────────────────────────────────┐
│                                 │
│  Workout                    [+] │  ← h1, + creates template
│                                 │
│  TEMPLATES                      │  ← section header
│  ┌─────────────────────────┐    │
│  │ Push Day           Edit │    │  ← card, tap → @ActiveWorkout
│  │ 3 days ago · 4 exercises│    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ Pull Day           Edit │    │  ← sorted oldest-completed first
│  │ 1 week ago · 5 exercises│    │
│  └─────────────────────────┘    │
│                                 │
│  HISTORY                        │  ← section header
│  ┌─────────────────────────┐    │
│  │ Push Day                │    │  ← tap → @WorkoutDetail
│  │ Mon, Jun 14 · 4 exercises│   │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ Pull Day                │    │
│  │ Sun, Jun 13 · 5 exercises│   │
│  └─────────────────────────┘    │
│                                 │
│  ┌──────┬──────────┬────────┐   │
│  │ Home │ Exercises│Settings│   │  ← @BottomNav
│  └──────┴──────────┴────────┘   │
└─────────────────────────────────┘
```

**Empty state:** When no templates exist, show centered icon + "Create your first template to get started".

---

### @TemplateEditor — `src/screens/TemplateEditor.jsx`

```
┌─────────────────────────────────┐
│  ←    [Template Name]     Save  │  ← sticky header: back arrow,
│  ───────────────────────────────│     centered name input, purple
│                                 │     Save button
│  ┌─────────────────────────┐    │
│  │ Flat Barbell Bench Press  ⋮ │  ← card, purple name, ⋮ menu
│  │                              │
│  │  SET                         │  ← column header, centered
│  │  [1]  Normal                 │  ← tappable set#, type label
│  │  [2]  Normal                 │     swipe-left to delete set
│  │  [3]  Normal                 │     (min 1 set enforced)
│  │       + Add Set              │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Incline Dumbbell Press    ⋮ │
│  │                              │
│  │  SET                         │
│  │  [1]  Normal                 │
│  │  [2]  Normal                 │
│  │  [3]  Normal                 │
│  │       + Add Set              │
│  └─────────────────────────┘    │
│                                 │
│  [      + Add Exercise      ]   │  ← opens @ExercisePicker
│                                 │
│  [      Delete Template     ]   │  ← red, only on existing
└─────────────────────────────────┘
```

**Set type popover:** Tap the set number to open a `position:fixed`
popover with Normal (white), Warm-up (yellow), Failure (red),
Drop Set (green). Same popover UI as @ActiveWorkout.

**⋮ exercise menu:** Slide-up modal with Move Up, Move Down,
Replace Exercise, Remove Exercise (red). Move options are
conditional on position in the list.

**Swipe-to-delete:** Set rows support swipe-left gesture to reveal
red delete action. Minimum 1 set per exercise is enforced.

**Flow:** On new template (+), the @ExercisePicker auto-opens after
300ms. Back arrow (not "Cancel" text).

---

### @ActiveWorkout — `src/screens/ActiveWorkout.jsx`

```
┌─────────────────────────────────┐
│  Push Day              [Finish] │  ← sticky header, no timer
│  ───────────────────────────────│
│                                 │
│  ┌─────────────────────────┐    │
│  │ Flat Barbell Bench Press  ⋮ │  ← exercise name (purple), menu
│  │                              │
│  │  SET  PREV   LBS   REPS     │  ← column headers, centered
│  │   1    —    [   ] [   ]     │  ← no checkbox (no data yet)
│  │   2    —    [   ] [   ]     │
│  │   3    —    [   ] [   ]     │
│  │         + Add Set            │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Incline Dumbbell Press   ⋮ │
│  │                              │
│  │  SET  PREV   LBS   REPS     │
│  │   1    —    [135] [ 10] [✓] │  ← checkbox appears WITH data
│  │   2    —    [   ] [   ]     │
│  │   3    —    [   ] [   ]     │
│  │         + Add Set            │
│  └─────────────────────────┘    │
│                                 │
│      [+ Add Exercise]           │
│                                 │
│      [Cancel Workout]           │  ← red border
└─────────────────────────────────┘
```

**Center alignment:** Every column (set number, previous, inputs, checkbox) is center-aligned. Inputs have centered placeholder dashes `—`.

**Checkbox rule:** Only renders when `weight !== ''` OR `reps !== ''` OR `set.completed`. Otherwise the space is blank.

---

### Set Type Popover (within @ActiveWorkout)

```
Tap set number "1" →

     ┌──────────────┐
  1  │ Normal       │  ← white text, bold
     │ Warm-up      │  ← yellow text, bold
     │ Failure      │  ← red text, bold
     │ Drop Set     │  ← green text, bold
     └──────────────┘

Popover uses position:fixed, anchored to the
right of the tapped set number. Dark background
(#252528), rounded corners, drop shadow.
Tap outside dismisses.
```

When a type is selected, the set number changes:
- Normal → shows digit (1, 2, 3)
- Warm-up → "W" (yellow)
- Failure → "F" (red)
- Drop Set → "D" (green)

---

### Set Completion + Rest Timer (within @ActiveWorkout)

```
After checking set ✓:

│  SET  PREV   LBS   REPS       │
│   1   —    [135] [ 10]  [✓]  │  ← green bg tint on row
│                                │
│         ┌──────────┐           │
│         │  ╭────╮  │           │  ← circular progress ring
│         │  │1:59│  │           │     purple ring, countdown
│         │  ╰────╯  │           │
│         │  [Skip]  │           │  ← skip/dismiss button
│         └──────────┘           │
│                                │
│   2   —    [   ] [   ]        │
```

Timer auto-starts on normal/warmup/failure check.
Does NOT start on drop sets or mid-superset sets.

---

### @ExerciseMenu — `src/components/ExerciseMenu.jsx`

```
┌─────────────────────────────────┐
│  Flat Barbell Bench Press    ×  │  ← slide-up modal
│                                 │
│  NOTES                          │
│  📝 Add Note                    │
│  📌 Add Sticky Note             │
│  ─────────────────────────────  │
│  ACTIONS                        │
│  🔄 Replace Exercise            │
│  🔗 Create Superset             │
│  🗑️ Remove Exercise     (red)   │
│  ─────────────────────────────  │
│  PREFERENCES                    │
│  ⚖️ Weight Unit: lbs            │
│  🏋️ Bar Type                    │
│  ⏱️ Rest Timer                  │
└─────────────────────────────────┘
```

---

### @ExercisePicker — `src/components/ExercisePicker.jsx`

```
┌─────────────────────────────────┐
│  Select Exercise             ×  │  ← slide-up modal
│                                 │
│  ┌─────────────────────────┐    │
│  │ Search exercises...     │    │  ← auto-focus
│  └─────────────────────────┘    │
│                                 │
│  [All] [Chest] [Back] [Shld...] │  ← horizontal scroll chips
│                                 │
│  CHEST                          │  ← sticky group header
│  Flat Barbell Bench Press       │
│  Flat Dumbbell Bench Press      │
│  ────────────────────────────   │
│  Incline Barbell Bench Press    │
│  ────────────────────────────   │
│  ...                            │
│                                 │
│  BACK                           │
│  Barbell Bent-Over Row          │
│  ...                            │
└─────────────────────────────────┘
```

Tap an exercise → adds it, closes picker. Muscle group chips filter the list. Search is case-insensitive substring match.

---

### @WorkoutSummary — `src/screens/WorkoutSummary.jsx`

```
┌─────────────────────────────────┐
│              💪                  │
│     Push Day Complete!          │
│     Tue, Jun 16, 2026           │
│                                 │
│  ┌────────┬────────┬────────┐   │
│  │  3m    │   3    │   9    │   │
│  │Duration│Exercises│ Sets  │   │
│  └────────┴────────┴────────┘   │
│                                 │
│  PERSONAL RECORDS 🏆            │
│  ┌─────────────────────────┐    │
│  │ Bench Press    135 lbs  │    │
│  └─────────────────────────┘    │
│                                 │
│  EXERCISES                      │
│  ┌─────────────────────────┐    │
│  │ Flat Barbell Bench Press│    │
│  │ 1. 135 lbs × 10        │    │
│  │ 2. 135 lbs × 8         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │  ← only if order changed
│  │ Save new order?  [═══] │    │
│  └─────────────────────────┘    │
│                                 │
│  [          Done          ]     │  ← purple CTA
└─────────────────────────────────┘
```

---

### @WorkoutDetail — `src/screens/WorkoutDetail.jsx`

```
┌─────────────────────────────────┐
│  ← Back                        │
│                                 │
│  Push Day                       │
│  Mon, Jun 14, 2026              │
│  Duration: 52m                  │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Flat Barbell Bench Press│    │  ← purple name
│  │ SET  WEIGHT  REPS  RPE │    │
│  │  1   135 lbs  10    —  │    │
│  │  2   135 lbs   8    7  │    │
│  │  3   140 lbs   6    8  │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ Incline Dumbbell Press  │    │
│  │ ...                     │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

Read-only. Notes (regular + sticky) shown in yellow boxes if present.

---

### @ExercisesScreen — `src/screens/ExercisesScreen.jsx`

```
┌─────────────────────────────────┐
│  Exercises                  [+] │  ← + creates custom exercise
│                                 │
│  ┌─────────────────────────┐    │
│  │ Search exercises...     │    │
│  └─────────────────────────┘    │
│                                 │
│  [All] [Chest] [Back] [Shld...] │  ← filter chips
│                                 │
│  CHEST (15)                     │
│  Flat Barbell Bench Press       │
│  ────────────────────────────   │
│  Flat Dumbbell Bench Press      │
│  ────────────────────────────   │
│  ...                            │
│                                 │
│  BACK (13)                      │
│  Barbell Bent-Over Row          │
│  ────────────────────────────   │
│  Custom exercises show          │
│  Edit / Delete buttons          │
└─────────────────────────────────┘
```

---

### @SettingsScreen — `src/screens/SettingsScreen.jsx`

```
┌─────────────────────────────────┐
│  Settings                       │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Default Rest Timer      │    │
│  │ Min [2] : Sec [0]      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Default Weight Unit     │    │
│  │ [  LBS  ] [  KG  ]     │    │  ← toggle, selected = purple
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Data                    │    │
│  │ [Export Backup]         │    │
│  │ [Import Backup]         │    │
│  └─────────────────────────┘    │
│                                 │
│     Workout Logger v1.0         │
└─────────────────────────────────┘
```

---

### Shared Components

#### @BottomNav — `src/components/BottomNav.jsx`
```
┌──────────┬──────────┬──────────┐
│  🏠 Home │ 🏋 Exer. │ ⚙ Sett. │  ← 56px + safe area
└──────────┴──────────┴──────────┘
Active tab = purple. Hidden during @ActiveWorkout.
```

#### @RestTimer — `src/components/RestTimer.jsx`
Circular progress ring (96×96), purple stroke, countdown center text, "Skip" below.

#### @UndoToast — `src/components/UndoToast.jsx`
```
┌────────────────────────────────┐
│ Set deleted              Undo  │
│ ████████████░░░░░░░░░░░░░░░░░ │  ← 5s linear depletion
└────────────────────────────────┘
Fixed bottom, above nav. Auto-dismisses after 5s.
```

#### @ConfirmDialog — `src/components/ConfirmDialog.jsx`
```
┌─────────────────────────────────┐
│  Title                          │
│  Message text here              │
│                                 │
│  [  Cancel  ] [  Confirm  ]     │
└─────────────────────────────────┘
Slide-up modal with dark overlay.
```
