# 08 — `/eigen`

## Purpose

The hardest concept in the project — lean hardest on analogy here before any formula appears.

## Layout

Same two-column skeleton. Visual panel shows several arrows radiating from the canvas center; under
the current matrix, most arrows rotate to a new direction, while the eigenvector arrow(s) — if
real — only change length, staying on the same line. This side-by-side contrast (rotating vs.
staying put) is the core teaching visual for this page and should be the first thing shown, before
any formula.

## Content sequence

**1. Analogy, before any math**
- Plain: "Most directions in the image spin and stretch when you apply the matrix. But sometimes
  there's a direction — maybe two — that only stretches. It never turns. That direction is called
  an eigenvector, and the amount it stretches by is its eigenvalue."

**2. The defining equation, worked numerically**
- Math: `Av = λv`
- Worked example (from source material, always show this exact one first since it's maximally
  concrete): `v = (1,0)`, and suppose `Av = (3,0)`. Then `Av = 3v`, so `λ = 3` — the x-axis is an
  eigenvector direction here, stretched by 3.
- `<DualExplain>` plain: "Normally, applying A changes both the length and direction of a vector.
  An eigenvector is the special case where only the length changes."

**3. `<ShowMath>` reveal: "How do we actually find them?"**
- Content: the characteristic equation derivation.
  ```
  det(A − λI) = 0

  det [ a−λ   b  ]  = 0
      [  c   d−λ ]

  (a−λ)(d−λ) − bc = 0
  ```
  This is the characteristic equation. Solving it (a quadratic in λ) gives the eigenvalue(s).

**4. Worked examples per transform (static reference block, all four shown)**

```
Scale [2 0; 0 3]:
  det(A−λI) = (2−λ)(3−λ) = 0  →  λ₁ = 2, λ₂ = 3
  (matches intuition: x stretched ×2, y stretched ×3)

Shear [1 k; 0 1]:
  det(A−λI) = (1−λ)² = 0  →  λ = 1 (double root)
  → there's a direction that isn't stretched at all (the x-axis, for horizontal shear)

Rotation (angle θ):
  λ = cosθ ± i·sinθ   (complex, except θ = 0° or 180°)

  90° case, A = [0 -1; 1 0]:
  λ = ±i  —  no real eigenvectors.
  Why: there is no real direction that points the same way after a 90° turn. Every real
  vector rotates, so the "special direction that doesn't turn" simply doesn't exist here —
  and the math reflects that by giving imaginary eigenvalues instead of real ones.
```

**5. Live current-matrix readout**
- Show the current shared matrix's actual eigenvalues (real pair, or complex pair) computed live,
  using the same `eigenInfo()` function as `/playground`. If complex, explicitly state "no real
  eigenvectors — every direction rotates under this matrix" rather than just omitting the
  eigenvector visual silently.

## Acceptance criteria

- The analogy visual (arrows rotating vs. staying put) must render correctly for at least: identity
  (all arrows unchanged), scale (axis-aligned arrows stay, others rotate+stretch), shear (only one
  arrow direction stays), rotation (zero arrows stay — call this out in text explicitly).
- All four worked examples' numeric claims must match `eigenInfo()`'s live output when that matrix
  is loaded — use as a QA/regression check.
