# 07 — `/determinant`

## Purpose

Make the determinant concrete: it's the factor by which area changes, and its sign tells you
whether orientation flipped. Uses the current shared matrix (whatever was last active from
`/transforms` or `/point`) as the live example throughout.

## Layout

Visual panel (unit-square before/after) on one side, `<DualExplain>` + worked examples + `<ShowMath>`
reveal on the other. Same two-column skeleton as `/point`.

## Visual: unit square area

- Draw the unit square (0,0)-(1,0)-(1,1)-(0,1) in rust on the "before" canvas.
- Draw its image under the current matrix in blue on the "after" canvas — this will generally be a
  parallelogram, not a square.
- Shade both shapes with translucent fill; display the shaded area's numeric value under each
  (before = 1, after = `|det(A)|`).
- If `det(A) < 0`: visually flip a small asymmetric marker (e.g. a tiny "F" or arrow) inside the
  parallelogram so the orientation reversal is visible, not just numeric.

## Content

- Plain: "The determinant tells you how the transformation changes area. If |det(A)| = 2, every
  shape doubles in area. If |det(A)| = 0.5, areas shrink by half. If |det(A)| = 1, area is exactly
  preserved."
- Math: `det(A) = ad − bc`, shown with the current matrix's actual a, b, c, d substituted and
  computed.
- Sign callout (separate, clearly flagged with `--warn` color if negative): "A positive determinant
  preserves orientation. A negative determinant reverses it — the image comes out mirrored, even if
  the area is unchanged."

## Worked examples (static reference block, not dependent on current matrix — show all four)

```
Scale [2 0; 0 3]:        det = 2(3) − 0 = 6        → area × 6
Rotation (any θ):        det = cos²θ + sin²θ = 1    → area preserved
Shear [1 k; 0 1]:        det = 1(1) − k(0) = 1      → area preserved, shape changes
Reflect y-axis [-1 0;0 1]: det = -1(1) − 0 = -1      → area preserved, orientation flipped
```

## `<ShowMath>` reveal: "Show the derivation"

Include the full expansion for each of the four cases above (e.g. rotation:
`det = cosθ·cosθ − (−sinθ)·sinθ = cos²θ + sin²θ = 1`), plus a short note connecting back to the
unit-square visual: "This is exactly why the shaded parallelogram's area equals |det(A)| times the
original square's area — the determinant *is* the area-scaling factor, this is just the algebra
that proves it."

## Acceptance criteria

- The "current matrix" worked example (top of page) always matches whatever matrix is active in
  shared state — verify by loading each `/transforms` preset and confirming this page's numbers
  update correctly.
- Sign flip demo (negative determinant) must be visually unambiguous even to someone not reading
  the numbers — the orientation marker flip is required, not optional polish.
