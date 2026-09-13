# 13 — Build Checklist / Acceptance Criteria

Use this as the final QA pass before presenting.

## Math correctness (test against `12-content-reference.md`'s worked examples)

- [ ] `determinant(2,0,0,3)` returns `6`
- [ ] `determinant` of any rotation matrix (any θ) returns `1` (within floating-point tolerance)
- [ ] `determinant(1,k,0,1)` returns `1` for any `k`
- [ ] `determinant(-1,0,0,1)` returns `-1`
- [ ] `eigenInfo(2,0,0,3)` returns real eigenvalues `[2, 3]` (order may vary — check as a set)
- [ ] `eigenInfo(1,k,0,1)` returns real eigenvalues `[1, 1]` for any `k ≠ 0`
- [ ] `eigenInfo(0,-1,1,0)` (90° rotation) returns `type: 'complex'`, `re ≈ 0`, `im ≈ 1`
- [ ] `applyMatrix(0,-1,1,0, 1,0)` returns `(0, 1)` — the 90° rotation worked example
- [ ] For any matrix, `λ₁ · λ₂ ≈ det(A)` and `λ₁ + λ₂ ≈ trace(A)` (real case) — spot check at least
      3 different matrices

## Visual QA

- [ ] Original = rust, transformed = blue, eigenvectors = green, consistently across every page
- [ ] Negative determinant visually shows an orientation flip (not just a number) on `/determinant`
- [ ] Rotation case on `/eigen` explicitly states "no real eigenvectors" rather than silently
      showing nothing
- [ ] Singular matrix preset on `/playground` renders the fallback background fill, doesn't crash
      or show visual garbage
- [ ] Point-transition animation on `/point` step 6 respects `prefers-reduced-motion`

## Content QA

- [ ] Every `<DualExplain>` instance has both a plain-language and a math side filled in — none
      left as a bare formula with no plain-language pair
- [ ] Every formula shown anywhere has at least one live/worked numeric example attached nearby —
      no abstract symbol-only presentation
- [ ] Tone check: read through as if presenting to someone new to the topic — confirm it reads as
      "beginner-friendly," not childish (no forced enthusiasm, no talking-down)
- [ ] `<ShowMath>` reveals are used only for derivations/proofs, never for facts that should be
      visible by default

## Navigation / state

- [ ] Shared matrix state persists correctly when navigating `/point` → `/transforms` →
      `/determinant` → `/eigen` → `/summary`
- [ ] Loading a preset on `/transforms` updates `/determinant` and `/eigen` correctly if visited
      afterward
- [ ] Stepper nav allows jumping directly to any route, not just linear Next/Back
- [ ] Reset-to-default affordance returns matrix to identity and point to default

## Responsive / accessibility

- [ ] All pages usable down to ~360px viewport width without horizontal scroll or overlapping text
- [ ] All interactive controls (sliders, buttons, file input, matrix inputs) reachable via keyboard
      with visible focus indicators
- [ ] Color is never the sole signal (e.g. negative determinant paired with explanatory text, not
      color alone)
