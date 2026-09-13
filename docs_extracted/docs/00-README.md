# Image Transformation Gallery — Documentation Set

This folder is the full spec for the Next.js rebuild of the "Image Transformation Gallery"
mini-project: an app that *teaches* 2×2 matrix image transformations (not just demos them),
paired with an interactive playground.

## How to use these docs (recommended reading order)

1. `01-product-brief.md` — what this app is for, who it's for, the teaching philosophy
2. `02-information-architecture.md` — routes, navigation, page order
3. `03-design-system.md` — colors, type, spacing, component visual rules
4. `04-shared-components-and-state.md` — shared React components, global state, the ported math engine
5. `05-page-point.md` through `11-page-gallery.md` — one spec per route, in the order a user walks through them
6. `12-content-reference.md` — every formula and worked example used anywhere in the app, in one place
7. `13-build-checklist.md` — acceptance criteria / QA checklist

## Source material

Two conversations fed into this spec:
- An explanation of how a 2×2 matrix acts on image *coordinates* vs. pixel *color data*, and why
  inverse mapping + interpolation is needed (referenced in `12-content-reference.md`, appendix section).
- A full worked-math pass covering scaling, rotation, shear, reflection, determinant, eigenvalues,
  and the determinant–trace–eigenvalue relationship (this is the backbone of `06` through `09`).

## Tech stack assumptions

- Next.js (App Router)
- No image-processing library needed — canvas 2D + hand-written inverse-mapping/bilinear-interpolation
  (already prototyped and working; see `04-shared-components-and-state.md` for the ported logic)
- No backend/database — everything is client-side, in-memory state
- Plain CSS (CSS variables) or Tailwind, either is fine — `03-design-system.md` gives tokens, not
  a framework requirement

## Non-negotiable design rule

Every concept in this app is presented as a **plain-language explanation and the real math side by
side**, using a shared `<DualExplain>` component (spec in `04`). Never hide the math behind a
"simple mode" toggle — only *derivations/proofs* go behind the `<ShowMath>` collapsible reveal.
Facts stay visible by default; proofs are opt-in.
