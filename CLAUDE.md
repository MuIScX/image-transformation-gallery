# Image Transformation Gallery

Next.js (App Router) app that *teaches* 2×2 matrix image transformations — scaling, rotation,
shear, reflection, determinant, eigenvalues — through a guided walkthrough, then a free-form
playground and an exportable gallery. Full spec lives in `docs_extracted/docs/` (14 files,
`00-README.md` is the index) — read the relevant page spec before touching that route.

## Non-negotiable teaching rule

Every concept is a plain-language explanation and the real math **shown together, always**, via
`<DualExplain>`. This is never a simple/advanced toggle. The only thing that hides by default is a
*derivation/proof*, behind `<ShowMath>` (collapsed, opt-in). Facts stay visible; proofs are
opt-in. Every formula shown anywhere must have a live/worked numeric example attached — never an
abstract symbol with no number.

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS. No backend — everything is client-side,
  in-memory state via `MatrixContext`.
- Node 18 is pinned in this environment (`create-next-app@latest` requires Node ≥20, hence the
  `next@14.2.35` / Node 18 pairing — don't upgrade Next without checking Node compatibility first).
- Canvas 2D for all rendering — no image-processing library. `lib/transformImage.ts` implements
  inverse-mapping + bilinear interpolation by hand (already written, ported from the validated
  prototype logic in the spec — don't rewrite the algorithm, only extend around it).

## Design system — merged (user decision)

Two design sources exist and were deliberately merged:
- `docs_extracted/docs/03-design-system.md` — the spec's own tokens and component rules.
- `DESIGN.md` (repo root) — a generic Vercel-style guide.

**Resolution: Vercel's structural/mechanical conventions win; the spec's semantic colors win.**
Concretely:
- Base palette is Vercel-style: white background (`--background`), near-black text
  (`--foreground`), muted secondary text (`--foreground-soft`), light gray surface for math blocks
  (`--surface`).
- Borders use Vercel's **shadow-as-border** technique, not literal CSS borders — use the
  `.shadow-border` / `.shadow-border-sm` utility classes in `app/globals.css`, not `border`.
- Typography is Geist Sans (`--font-sans`) / Geist Mono (`--font-mono`) via the `geist` npm
  package (`geist/font/sans`, `geist/font/mono` — NOT `next/font/google`, which doesn't ship Geist
  on Next 14). Tight tracking on headings, `tabular-nums` (`.font-mono-nums`) for numeric columns.
- **Semantic colors are load-bearing and must not be reinterpreted**: `--origin` (rust) = original
  image / "before" state, always. `--accent` (blue) = transformed image / interactive / "the math
  result", always. `--eigen` (green) = eigenvectors / invariant directions, always. `--warn` (red)
  = negative determinant / orientation flip, always paired with explanatory text (never color
  alone). This mapping must stay consistent on every single page — see `03-design-system.md`.
- Max content width ~1080px (`max-w-content` in Tailwind config), body copy stays under ~70
  characters per line.
- Motion: minimal everywhere. The one animated moment is the point moving from original →
  transformed position on `/point` step 6 (~300–400ms ease) — already implemented in
  `PointCanvas`'s `animate` arrow prop, respects `prefers-reduced-motion`. Don't add motion
  elsewhere.

## File structure

```
app/
  layout.tsx           # MatrixProvider + StepperNav + main wrapper — already built
  page.tsx             # redirect → /point — already built
  point/page.tsx        ─┐
  transforms/page.tsx    │
  determinant/page.tsx   │  one route each, spec in docs_extracted/docs/05..11
  eigen/page.tsx         │
  summary/page.tsx       │
  playground/page.tsx    │
  gallery/page.tsx      ─┘
components/            # all shared, already built — see "Shared components" below
lib/
  matrix.ts             # applyMatrix, determinant, trace, eigenInfo, PRESETS — already built
  transformImage.ts     # transformImageData (inverse-map + bilinear) — already built
  sampleImage.ts         # paintSampleImage, createSampleImageData (procedural test image) — already built
context/
  MatrixContext.tsx      # shared { a,b,c,d, point, setMatrix, setPoint, reset, uploadedImage, setUploadedImage } — already built
docs_extracted/docs/     # the full spec — READ THE RELEVANT PAGE FILE BEFORE BUILDING THAT ROUTE
```

## Shared components (already built — reuse, don't reimplement)

- `<StepperNav>` — top nav, already wired into `app/layout.tsx`. Don't add a second one per page.
- `<PageNav>` — bottom Prev/Next, reads current route from `ROUTES` in `StepperNav.tsx`. Drop one
  `<PageNav />` at the end of every route page's content.
- `<DualExplain plain="..." math="...">` — math accepts a `\n`-joined multi-line string.
- `<ShowMath label="...">` — collapsed derivation reveal.
- `<MatrixInput value={m} onChange={fn} showPresets min max step>` — bracket-frame 2×2 control +
  preset buttons (uses `PRESETS` from `lib/matrix.ts`).
- `<InfoBox rows={[{label,value,warn?}]} note?>` — det/trace/eigenvalue readouts.
- `<PointCanvas size range points arrows>` — mini coordinate-grid canvas (used by `/point`).
  `arrows` support `dashed` and `animate` (the step-6 payoff animation).
- `<ImageCompareCanvas matrix size image showEigenOverlay originalLabel transformedLabel>` —
  original|transformed side-by-side with pill tags, used by `/transforms` and `/playground`.
  Pass `image` (an `HTMLImageElement`) to use an uploaded photo instead of the procedural sample.
- `<EigenOverlay matrix size>` — green eigenvector lines, absolutely positioned; renders nothing
  when eigenvalues are complex (intentional — the *absence* is part of the lesson, pair with text).
- `<RecapTable>` — static table (`/summary`), already responsive (stacks under `sm`).

## Global state (`useMatrix()` from `context/MatrixContext`)

`{ a, b, c, d, point, setMatrix(partial), setPoint(p), reset(), uploadedImage, setUploadedImage }`.
Default matrix is identity, default point is `(80, -40)`. Every route reads/writes this same
context so the matrix persists across page navigation during a live walkthrough — **don't add
route-local matrix state that shadows it** except where a page spec explicitly calls for a
page-local worked example that shouldn't perturb shared state (e.g. `/determinant` and `/eigen`'s
*static* four-transform reference blocks use hardcoded example matrices, not `useMatrix()` — only
their "current matrix" live section uses context).

## Image upload scope

Per `docs_extracted/docs/10-page-playground.md`, the default assumption is that an uploaded image
is **local to `/playground` only** (keeps the other pages' worked examples visually consistent).
`MatrixContext` exposes `uploadedImage`/`setUploadedImage` for convenience, but `/playground` may
also just hold this as local component state if that's simpler — either way, `/transforms`,
`/determinant`, `/eigen`, `/gallery` should NOT read an uploaded image; they always use the
procedural sample image (`createSampleImageData/paintSampleImage`).

## Content accuracy

`docs_extracted/docs/12-content-reference.md` is the single source of truth for every formula and
worked numeric example — use its exact numbers as defaults (e.g. rotation 90° example, eigenvector
demo `v=(1,0), Av=(3,0) → λ=3`). Don't invent alternate worked examples.

## Build checklist

`docs_extracted/docs/13-build-checklist.md` is the acceptance criteria / QA pass. Run through it
(math correctness, visual QA, content QA, nav/state, responsive/a11y) before considering any page
done — several items are cross-page regression checks (e.g. "loading a preset on `/transforms`
updates `/determinant` and `/eigen` correctly").

## Conventions

- Server components by default; add `"use client"` only where state/effects/canvas are needed
  (most page-level components will need it since they read `useMatrix()`).
- Keep body copy tone: clear and patient, not childish — no forced enthusiasm, no talking-down.
- Verify with `npx tsc --noEmit` and `npm run build` after implementing a route.
