# 11 — `/gallery`

## Purpose

Static, presentable reference grid — doubles as the "set of original & transformed images with
analysis" the assignment explicitly asks for. This is the page to screenshot or export for the
written report.

## Layout

Grid of cards (`auto-fit`, `minmax(150px, 1fr)`), one per entry: Original, Scale, Rotate 45°, Shear,
Reflect (y-axis) — matching the prototype's `GALLERY_PRESETS`.

## Card content

- Thumbnail canvas (transformed sample image, with eigenvector overlay if real).
- Transform name.
- Matrix in bracket notation: `[a b; c d]`.
- `det = value`.
- `λ = value1, value2` (or complex form).
- **New for this rebuild — not in the original prototype:** a one-line "what to notice" caption per
  card, written once and reused whenever presenting. Suggested captions:
  - Original: "Our reference point — everything else is measured against this."
  - Scale: "Area grows to match det(A) = 2.8. Both eigenvalues are real and axis-aligned."
  - Rotate 45°: "Area unchanged (det = 1), but eigenvalues are complex — no direction survives
    unrotated."
  - Shear: "Area unchanged (det = 1), shape skewed. Eigenvalue 1 (doubled) — one direction is
    completely unstretched."
  - Reflect (y-axis): "Area unchanged, but det = −1 — orientation is flipped. Watch the mirrored F."

## Acceptance criteria

- Every numeric value on every card must be computed live from that card's matrix via the shared
  `lib/matrix.ts` functions, not hardcoded — so if the sample image or canvas size changes, the
  numbers stay correct automatically.
- Grid remains legible (no overlap, readable captions) down to a single column on narrow
  viewports.
