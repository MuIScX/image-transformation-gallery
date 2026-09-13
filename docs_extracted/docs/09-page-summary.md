# 09 — `/summary`

## Purpose

A "check your work" recap page connecting determinant and eigenvalues, plus a single reference
table covering all four transforms — this is the page a presenter can leave on screen while taking
questions.

## Content

**The relationship**
- Math:
  ```
  det(A)   = λ₁ · λ₂
  trace(A) = λ₁ + λ₂   (where trace(A) = a + d)
  ```
- Plain: "These aren't coincidences — for any 2×2 matrix, the determinant is always the product of
  its eigenvalues, and the trace is always their sum. It's a quick way to sanity-check an
  eigenvalue calculation: multiply them together, and it should equal what you already know the
  determinant to be."
- Live check: show this computed against whatever matrix is currently active in shared state,
  confirming `λ₁·λ₂ == det(A)` numerically (round for display, e.g. 2 decimal places).

**Recap table** (`<RecapTable>`, static reference — always shows all four, independent of current
matrix)

| Transformation | Matrix | Determinant | Eigenvalues |
|---|---|---|---|
| Scale | `[sx 0; 0 sy]` | `sx·sy` | `sx, sy` |
| Rotation | `R(θ)` | `1` | `cosθ ± i·sinθ` |
| Horizontal shear | `[1 k; 0 1]` | `1` | `1, 1` |
| Reflection (x-axis) | `[1 0; 0 -1]` | `-1` | `1, -1` |
| Reflection (y-axis) | `[-1 0; 0 1]` | `-1` | `1, -1` |

**Closing statement** (render prominently, e.g. larger serif text, as the page's final element):

"Matrices control how image coordinates move. Determinants tell us how area and orientation
change. Eigenvalues reveal special directions that remain structurally unchanged by the
transformation."

## Acceptance criteria

- The live det/eigenvalue check must actually recompute (not be hardcoded) against shared state —
  verify by changing the matrix on `/playground` and returning to `/summary`.
- Table is legible without horizontal scroll down to ~360px; consider a stacked card layout on
  narrow viewports instead of a literal `<table>`.
