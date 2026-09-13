# 12 — Content Reference (Appendix)

Every formula and worked example used anywhere in the app, consolidated in one place for quick
lookup while implementing. Nothing here is new content — it's pulled from the page specs above so
Claude Code (or anyone building this) doesn't have to hunt across files for exact numbers.

## Core rule

```
x' = a·x + b·y
y' = c·x + d·y
```
Matrix form: `x' = Ax`, where `A = [a b; c d]`, `x = [x; y]`.

## Matrix columns = images of basis vectors

```
(1, 0) → (a, c)
(0, 1) → (b, d)
```

## The four transforms

```
Scale:       A = [sx 0; 0 sy]         x' = sx·x,  y' = sy·y
Rotation:    A = [cosθ -sinθ; sinθ cosθ]
Shear (h):   A = [1 k; 0 1]            x' = x + k·y, y' = y
Shear (v):   A = [1 0; k 1]
Reflect x:   A = [1 0; 0 -1]            (x,y) → (x,-y)
Reflect y:   A = [-1 0; 0 1]            (x,y) → (-x,y)
Reflect y=x: A = [0 1; 1 0]             (x,y) → (y,x)
```

## Worked numeric examples (use these exact numbers as defaults throughout the app)

```
Rotation 90°:     A = [0 -1; 1 0]      (1,0) → (0,1)
Scale example:    A = [2 0; 0 3]       det = 6, λ = 2, 3
Shear example:    A = [1 k; 0 1]       det = 1, λ = 1 (double root)
Reflect y-axis:   A = [-1 0; 0 1]      det = -1, λ = 1, -1
Eigenvector demo: v = (1,0), Av = (3,0)  →  λ = 3
```

## Determinant

```
det(A) = ad - bc
|det(A)| = area scale factor
sign(det(A)) < 0  →  orientation reversed (mirrored)
```

Worked cases:
```
Scale [2 0; 0 3]:          det = 2(3) - 0 = 6
Rotation (any θ):           det = cos²θ + sin²θ = 1
Shear [1 k; 0 1]:            det = 1(1) - k(0) = 1
Reflect y-axis [-1 0; 0 1]:  det = -1(1) - 0 = -1
```

## Eigenvalues / eigenvectors

```
Defining equation:        Av = λv
Characteristic equation:  det(A - λI) = 0
                           (a-λ)(d-λ) - bc = 0
```

Worked cases:
```
Scale [2 0; 0 3]:      (2-λ)(3-λ) = 0        → λ₁=2, λ₂=3
Shear [1 k; 0 1]:      (1-λ)² = 0             → λ=1 (double)
Rotation R(θ):         λ = cosθ ± i·sinθ      (complex, except θ=0° or 180°)
Rotation 90°:          A = [0 -1; 1 0]        → λ = ±i, no real eigenvectors
```

## Determinant ↔ eigenvalue relationship

```
det(A)   = λ₁ · λ₂
trace(A) = λ₁ + λ₂ = a + d
```

## Recap table

| Transformation | Matrix | Determinant | Eigenvalues |
|---|---|---|---|
| Scale | `[sx 0; 0 sy]` | `sx·sy` | `sx, sy` |
| Rotation | `R(θ)` | `1` | `cosθ ± i·sinθ` |
| Horizontal shear | `[1 k; 0 1]` | `1` | `1, 1` |
| Reflection (x-axis) | `[1 0; 0 -1]` | `-1` | `1, -1` |
| Reflection (y-axis) | `[-1 0; 0 1]` | `-1` | `1, -1` |

## Appendix: pixels vs. points (why images need interpolation)

Not part of the main walkthrough, but useful background if a question comes up, and a candidate for
a future `/playground` aside or footnote.

- A pixel has **two separate pieces of data**: its location `(x, y)` and its color `(R, G, B)`. The
  matrix only ever transforms the location. The color travels with the pixel unchanged.
- In tensor form, an RGB image is `X ∈ ℝ^(C×H×W)` (e.g. `3×512×512`). The 2×2 matrix acts on the
  spatial `(H, W)` coordinates only — the channel dimension `C` is untouched by the transform.
- Transformed coordinates are frequently **not integers** (obvious for rotation — e.g.
  `(10,10) → (0, 14.142...)` under a 45° rotation). An image tensor only has discrete pixel
  positions, so something has to decide what color goes at the nearest integer position.
- **Forward mapping** (push every source pixel to its new location) can leave gaps — some output
  pixels end up with no assigned color at all.
- **Inverse mapping** (for every output pixel, ask "where did this come from?" via `A⁻¹`, then
  bilinearly blend the source pixels around that point) avoids gaps entirely and is what this app's
  `transformImage.ts` implements.

## Appendix: center-of-image transform

```
x' = T_c⁻¹ · A · T_c · x
```
Where `T_c` shifts the image center to the origin. Conceptually: move center to origin → apply A →
move back. This is why "rotate around the image's center" still counts as "just a 2×2 matrix" — the
translation is bookkeeping around it, not part of A itself.
