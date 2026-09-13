# 02 — Information Architecture

## Structure: step-through with routes

Chosen over a single scrolling page because the content has a strict dependency order — you need
"a matrix moves points" before "determinant scales area" before "eigenvalues are special
directions." A stepper enforces that order. Routes also let the presenter deep-link to one section
mid-presentation, and let each page breathe with its own visual instead of competing for space on
one long scroll.

## Route list, in walkthrough order

| Route | Purpose | Depends on |
|---|---|---|
| `/point` | Single point transform, step by step (7 steps). Establishes the core rule `x'=ax+by, y'=cx+dy` before images enter. | — |
| `/transforms` | Four cards: Scale, Rotation, Shear, Reflection. Matrix, plain-language line, live before/after image, one worked example each. | `/point` |
| `/determinant` | Unit-square area visual, plain rule, `det(A)=ad-bc`, worked examples per transform, sign = orientation. | `/transforms` |
| `/eigen` | Analogy → `Av=λv` worked numerically → characteristic equation (collapsed) → worked examples per transform, rotation's complex case called out specifically. | `/determinant` |
| `/summary` | `det(A)=λ₁λ₂`, `trace(A)=λ₁+λ₂`, recap table of all four transforms. | `/eigen` |
| `/playground` | Free-form matrix input + presets, live image transform, det/eigenvalue readout, image upload. | Can be visited any time after `/point`, but is positioned after `/summary` in the nav so it reads as "now try it yourself." |
| `/gallery` | Static grid: all four transforms + original, with one-line "what to notice" captions. Doubles as the exportable "set of images" deliverable. | `/playground` |

## Navigation

- Persistent stepper/progress bar at the top of every page (7 dots/segments, current one highlighted),
  clicking a segment jumps directly to that route — don't force strictly linear-only navigation,
  since the presenter will want to jump around live.
- Prev/Next buttons at the bottom of every page, matching the table order above.
- The current matrix and current tracked point are **shared global state** (see `04`) — so if the
  presenter sets a custom matrix on `/transforms` and continues to `/determinant`, the same matrix
  is still active. `/playground` is the one route that's expected to freely overwrite this shared
  state, so consider a subtle "reset to default" affordance somewhere (e.g. in the nav bar) in case
  a presenter wants to jump back to a clean starting matrix before a specific section.

## Page layout skeleton (applies to `/point` through `/eigen`)

```
┌─────────────────────────────────────────────┐
│  Stepper / progress nav                      │
├─────────────────────────────────────────────┤
│  Page title (plain-language framing)          │
│  One-sentence intro                          │
├───────────────┬───────────────────────────────┤
│  Visual panel  │  <DualExplain> content        │
│  (canvas/image)│  (+ <ShowMath> reveals where   │
│                │   derivations apply)           │
├───────────────┴───────────────────────────────┤
│  ← Back                              Next →   │
└─────────────────────────────────────────────┘
```

`/summary`, `/playground`, and `/gallery` deviate from this (table, full playground layout, and
grid respectively) — see their individual specs.
