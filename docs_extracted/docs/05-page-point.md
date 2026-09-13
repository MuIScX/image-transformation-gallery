# 05 — `/point`: The Single Point Walkthrough

## Purpose

Establish the one rule everything else builds on — `x'=ax+by, y'=cx+dy` — using one concrete point,
before images enter the picture at all. This page is already fully prototyped and working; port it
directly, adding a plain-language line to each step per the dual-track rule.

## Layout

Two columns: point picker + mini coordinate-grid canvas on the left, step panel (with prev/next
nav and a progress-dot indicator) on the right. Collapses to single column on mobile.

## Controls

- Two number inputs for the tracked point (x, y), relative to canvas center.
- Three presets: Default (80, −40), Lower-right (120, 90), Upper-left (−100, −70).
- Uses the shared matrix from context — whatever was last set (default: identity).

## The 7 steps (content spec)

Each step updates the mini-canvas and the step panel. Use `<DualExplain>` inside each step where
applicable.

**Step 1 — Start with a point**
- Plain: "Every pixel in the image is just a coordinate pair. Here's one point."
- Math: `(x, y) = (80, −40)` (actual current values)
- Visual: plot the point in rust (`--origin`).

**Step 2 — The matrix is a rule**
- Plain: "A 2×2 matrix defines a fixed rule for turning any (x, y) into a new (x′, y′). This shape
  never changes, no matter what a, b, c, d are."
- Math:
  ```
  x' = a·x + b·y
  y' = c·x + d·y
  ```
- Also restate the current matrix values in brackets underneath.

**Step 3 — Substitute the numbers**
- Plain: "Swap in the actual matrix values and the actual point. Nothing is computed yet — this is
  just the formula with numbers dropped in."
- Math: `x' = (a)(x) + (b)(y)`, `y' = (c)(x) + (d)(y)` with real numbers substituted.

**Step 4 — Work out x′, term by term**
- Plain: "The new x-coordinate is a weighted mix of the old x and the old y — that's all matrix
  multiplication is doing here."
- Math: three-line reveal — `x' = (a)(x) + (b)(y)` → `x' = term1 + term2` → `x' = result`, with the
  final result visually highlighted.

**Step 5 — Work out y′, term by term**
- Plain: "Same idea, using the matrix's second row instead of its first."
- Math: same three-line pattern for y′.

**Step 6 — See it move**
- Plain: "That's the whole operation, for one point. The full image transform is exactly this,
  repeated for every single pixel."
- Math: `(x, y) → (x′, y′)` with both values shown.
- Visual: plot both points (rust = original, blue = transformed), dashed arrow between them,
  animate the transition (respecting `prefers-reduced-motion`).

**Step 7 — The matrix aspect: what a, b, c, d really are**
- Plain: "Apply the same rule to the two simplest points, (1,0) and (0,1). That's not a
  coincidence — the two columns of the matrix are exactly where it sends those two points. Every
  other point, including the one above, is just a combination of these two mapped directions.
  That's what a 2×2 matrix *is*, geometrically."
- Math:
  ```
  (1, 0) → (a, c)
  (0, 1) → (b, d)
  ```
- Visual: plot (1,0) and (0,1) in rust, their images (a,c) and (b,d) in blue/green respectively,
  with arrows connecting each pair.

## Acceptance criteria

- All 7 steps recompute live if the presenter changes the matrix mid-walkthrough (via nav to
  `/transforms` or `/playground` and back).
- Point picker updates step 1–7 content immediately.
- Progress dots accurately reflect current step out of 7; Back disabled on step 1, Next disabled on
  step 7 (use page-level Next instead, to move to `/transforms`).
