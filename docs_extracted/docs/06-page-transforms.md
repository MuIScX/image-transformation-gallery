# 06 — `/transforms`: The Four Classic Transforms

## Purpose

Introduce Scale, Rotation, Shear, Reflection as named, recognizable matrices — each with a plain
description, the matrix, a live before/after image, and one concrete worked example. This is where
"a matrix moves points" turns into "and here are the four moves you'll actually use."

## Layout

Four `<TransformCard>` sections, one per transform, each full-width, stacked vertically (not a
grid — each needs room for its own worked example). Each card: matrix (bracket UI, editable —
clicking loads that transform's matrix into shared state), `<DualExplain>`, live image compare
canvas, and a short "property" callout.

## Content per card

### Scale
- Plain: "Stretches or squashes the image along each axis independently."
- Math:
  ```
  A = [ sx  0 ]
      [ 0  sy ]
  x' = sx·x
  y' = sy·y
  ```
- Worked example: `A = [2 0; 0 1]` → x-coordinates double, y unchanged → image becomes twice as
  wide. If `sx = sy = 2`, the whole image scales uniformly.
- Default card matrix: `[2, 0, 0, 1.5]`.
- Property callout: "Only uniform scaling (sx = sy) keeps the image's proportions — otherwise
  circles become ellipses, squares become rectangles."

### Rotation
- Plain: "Spins the image around its center by an angle θ, without stretching or squashing
  anything."
- Math:
  ```
  A = [ cosθ  -sinθ ]
      [ sinθ   cosθ ]
  ```
- Worked example: 90° rotation → `A = [0 -1; 1 0]`. Apply to (1,0): `A·(1,0) = (0,1)`, so
  `(1,0) → (0,1)` — a quarter turn.
- Default card matrix: 45° rotation, `[0.707, -0.707, 0.707, 0.707]`.
- Property callout: "Rotation preserves distance — a point at distance r from the center stays at
  distance r. That's why nothing stretches or squashes, only turns."

### Shear
- Plain: "Slides points sideways by an amount proportional to their height — turns a rectangle into
  a parallelogram."
- Math (horizontal shear):
  ```
  A = [ 1  k ]
      [ 0  1 ]
  x' = x + k·y
  y' = y
  ```
- Worked example: `k = 0.5` → `A = [1 0.5; 0 1]` → `x' = x + 0.5y, y' = y` → the classic
  slanted/parallelogram look. Mention vertical shear exists too: `A = [1 0; k 1]`.
- Default card matrix: `[1, 0.6, 0, 1]`.
- Property callout: "Shear changes the shape but — perhaps surprisingly — preserves area. More on
  why in the Determinant section."

### Reflection
- Plain: "Flips the image across a line, like a mirror."
- Math (three worked cases):
  ```
  Across y-axis:  A = [-1  0]     (x,y) → (-x, y)
                       [ 0  1]
  Across x-axis:  A = [ 1  0]     (x,y) → (x, -y)
                       [ 0 -1]
  Across y = x:   A = [ 0  1]     (x,y) → (y, x)
                       [ 1  0]
  ```
- Default card matrix: reflection across y-axis, `[-1, 0, 0, 1]`.
- Property callout: "Reflection preserves shape and area, but reverses orientation — the image
  looks 'mirror-written.' That flip shows up as a negative determinant. More on why in the
  Determinant section."

## Interaction

- Clicking a card's matrix (or a "Load this matrix" button) sets shared context state, so `/point`,
  `/determinant`, `/eigen` all reflect it if the presenter navigates onward from that card.
- Each card's canvas re-renders using `transformImage.ts` against the current sample image (or
  uploaded image if one was set on `/playground`).

## Acceptance criteria

- All four worked examples' numeric claims must match live computed output exactly (e.g. rotation
  card must visibly show (1,0) landing at (0,1) when 90° is loaded) — use this as a QA check.
- Cards remain legible and don't require horizontal scrolling down to ~360px viewport width.
