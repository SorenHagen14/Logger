# UI/UX Design Specification: Premium Workout & Recovery Tracker

## 1. Design Concept & Vibe
The application will employ a premium, minimalist, and highly analytical aesthetic. Drawing inspiration from modern Web3/Fintech platforms, the design uses a deep dark mode with striking high-contrast accents. It feels less like a traditional brightly-colored fitness app and more like an elite performance dashboard. 

The aesthetic focuses on clean typography, subtle borders, and a stark contrast between the deep background and vibrant accent colors, ideal for tracking both intense lifting sessions and wellness routines.

## 2. Color Palette
* **Primary Background:** `#0F0F0F` (Deep Charcoal / Almost Black)
* **Secondary Background (Cards/Surfaces):** `#1A1A1A`
* **Borders & Dividers:** `#2D2D2D` (Subtle structural lines)
* **Primary Text:** `#FFFFFF` (High contrast white for data and main headings)
* **Secondary Text:** `#8B8B8B` (Muted gray for labels and descriptions)
* **Accent Color:** `#FF574D` (Vibrant Coral/Orange - used sparingly for primary actions, active states, and emphasis)
* **Success/Metric Positive:** `#00E676` (Bright green for PRs or positive trends)

## 3. Typography
The typography mixes clean, modern sans-serif fonts for data readability with elegant, italicized serif fonts for specific artistic emphasis, directly mimicking the sophisticated contrast seen in the reference.
* **Primary UI Font (Sans-serif):** `Inter` or `SF Pro Display`. Used for all buttons, metrics, body copy, and standard navigation.
* **Accent/Display Font (Serif):** `Playfair Display` or `Garret`. Used **only** in hero headers and specifically italicized (e.g., "Log a *session*") to provide a high-end editorial feel.

## 4. Core UI Components

### Navigation Bar (Top)
* **Logo:** Left-aligned, minimalist icon (perhaps a geometric barbell or flame) in the accent color.
* **Links:** Center-aligned, muted text (Dashboard, Workouts, Recovery, Analytics). Hover states turn white with a subtle downward chevron.
* **Status Pill:** Right-aligned, mimicking a crypto wallet connection. e.g., a dark pill with a subtle border showing the user's current streak: `[ 🔥 5 Day Streak ]`.

### Hero Section
* **Main Headline:** Large serif/sans-serif mix. Example: `Log an` \n `<span style="font-family: serif; font-style: italic; color: #FF574D">elite session</span>`.
* **Subheadline:** Muted gray, explaining the value proposition. "Track volume, optimize recovery, and push your limits."
* **Global Search Bar (Omnibox):** * Dark pill-shaped input field (`#1F1F1F` background, `#333` border).
    * Placeholder: "Search exercises, past routines, or PRs..."
    * Right-aligned shortcut hint key: a small dark gray box with `⌘K`.
* **Key Metric Display (Right side of Hero):** Large, highly legible numbers showing a cumulative stat. 
    * Label: `CUMULATIVE VOLUME` (small, tracked-out caps).
    * Value: `39,924 lbs` (Massive font size, pure white).

### Grid/Card System (The "Features" Section)
A horizontal or 3-column grid separated by subtle 1px `#2D2D2D` borders, sitting on the dark background. 

**Card Structure:**
* **Title:** Large white sans-serif (e.g., "Strength & Volume", "Sauna & Cold Plunge").
* **Subtitle/Body:** Muted gray text explaining the module. 
* **Action Button:** A circular button (dark gray background, lighter gray border) with a simple white `>` arrow, positioned at the bottom right of the card, acting as the entry point to that specific tracker.

## 5. Screen Layouts

### A. The Dashboard (Home)
Follows the reference structure exactly: Top Nav -> Hero with Search & Cumulative Stats -> 3-Column Grid below for quick actions.
* **Column 1: Lift** (Starts a new resistance training session)
* **Column 2: Recover** (Dedicated module for logging sauna duration, cold plunge temperatures, and active recovery metrics)
* **Column 3: Analyze** (Deep dive into load progression and biometric trends)

### B. Active Workout View
* Distraction-free deep dark mode.
* Current exercise highlighted with the Coral/Orange accent.
* High-contrast numerical inputs for sets, reps, and weight.
* A sleek bottom-sheet or modal for resting timers.

## 6. Developer Implementation Notes (For Claude)
* **Framework:** Recommend React/Next.js with Tailwind CSS.
* **Styling:** heavily rely on `border-white/10` for the structural lines seen in the reference. 
* **Search Box:** Implement a global command palette (e.g., `cmdk` library) bound to the `⌘K` interaction.
* **Grid:** Use CSS Grid for the bottom section to ensure the borders align perfectly and create that structured, architectural feel.
