# 10 — `/playground`

## Purpose

Free-form exploration, positioned after `/summary` so it reads as "now try it yourself" rather than
the entry point. Already fully prototyped and working in the HTML demo — port directly.

## Layout

Matrix input panel (bracket UI + presets + upload) on one side; original/transformed canvas
comparison + info box (det, trace, eigenvalues, contextual note) on the other. Matches the
prototype's `.explorer` layout.

## Controls

- `<MatrixInput>` — four number+slider pairs for a, b, c, d, range roughly −3 to 3, step 0.1.
- Presets: Identity, Scale, Rotate 45°, Shear, Reflect (y-axis), Reflect (x-axis), Singular (a
  deliberately degenerate matrix, e.g. `[1,0,0,0]`, to show what happens when det ≈ 0 — the image
  collapses toward a line).
- Image upload (`<input type="file" accept="image/*">`) — cover-fit crop into the working canvas
  size, replaces the procedural sample image as the source for this page (and optionally for
  `/transforms` and `/gallery`, if the presenter wants their own photo throughout — confirm this
  behavior when implementing; default assumption is the upload is local to `/playground` only, to
  keep the other pages' worked examples visually consistent).

## Info box content

- `det(A)`, `trace(A)`, `λ₁`/`λ₂` (or `λ₁,₂ = re ± im·i` for complex) — all monospace label/value
  rows.
- Contextual note, one of: singular-matrix warning, orientation-flip note (negative det), "no real
  eigenvectors — pure rotation" note, "this is the identity" note, or a generic "real eigenvalues —
  the green lines mark directions that only get stretched" note. Port the exact branching logic
  from the prototype's `updateInfoBox()`.

## Technical aside: center-of-image caveat

Include as a small collapsible note near the bottom of this page (use `<ShowMath>` or a similarly
de-emphasized disclosure — this is implementation detail, not core conceptual content):

- Plain: "A 2×2 matrix technically transforms coordinates around the origin (0,0). But an image's
  natural origin is usually a corner, not the center. To make rotation/scaling happen around the
  image's center — which is what looks natural — the app shifts the image so its center is at the
  origin, applies the matrix, then shifts it back."
- Math: `x' = T_c⁻¹ · A · T_c · x`, where `T_c` translates the center to the origin.
- Note: this is exactly what `transformImage.ts` already does via the `cx, cy` offset in its inner
  loop — no additional implementation needed, this note is purely explanatory.

## Acceptance criteria

- Slider drag should feel responsive; debounce/throttle re-render with `requestAnimationFrame` if
  needed at the canvas sizes used (the prototype ran acceptably at 300×300 per canvas without
  debouncing, but test on the actual target canvas size).
- Singular preset must not crash — verify the `singular` branch in `transformImageData` renders the
  background-fill fallback correctly rather than throwing on division by zero.
- Uploaded image must be re-usable across all matrix changes without needing to re-upload.
