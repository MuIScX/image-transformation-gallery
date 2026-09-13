# 03 — Design System

Ported from the working HTML prototype — reuse these tokens exactly for visual continuity between
the prototype and the Next.js rebuild.

## Color tokens

```css
--paper:       #F6F5F0;  /* page background */
--paper-dim:   #EDEBE3;  /* card/section background, slightly darker */
--ink:         #1D2430;  /* primary text */
--ink-soft:    #5B6472;  /* secondary text, labels */
--rule:        #D8D5C8;  /* borders, dividers */
--accent:      #33509E;  /* transformed state / interactive elements / "math" highlight */
--accent-soft: #E4E9F5;  /* accent background tint */
--origin:      #A6553B;  /* original state / "before" */
--origin-soft: #F3E5DF;  /* origin background tint */
--eigen:       #2F7D5C;  /* eigenvectors / special-direction highlights */
--warn:        #B33B3B;  /* negative determinant / flip warnings */
```

Usage convention: **original = rust (`--origin`), transformed = blue (`--accent`), eigenvectors /
invariant directions = green (`--eigen`)**. Keep this mapping consistent on every page — a
presenter relies on color meaning the same thing throughout.

## Typography

- Headings: serif (`Georgia, "Iowan Old Style", "Palatino Linotype", serif`) — gives the math
  content a textbook/editorial feel rather than a SaaS-dashboard feel.
- Body: system sans (`-apple-system, "Segoe UI", Helvetica, Arial, sans-serif`).
- Math/numbers/matrix values: monospace (`"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace`)
  — always use monospace for actual numbers and matrix entries so they read as *data*, distinct
  from prose.
- Avoid the generic AI-page tells: no tracked-out all-caps eyebrows, no em-dash-joined labels, no
  single-word bold/italic accents inside headlines.

## Layout

- Max content width ~1080px, centered, generous side padding (28px mobile, more on desktop).
- Two-column layouts (matrix controls | canvas, or visual | explanation) collapse to single column
  under ~760px.
- Line length for body text: under ~70 characters.

## Component visual rules

**Matrix input ("bracket" UI)** — a 2×2 grid of number+slider pairs, framed with CSS bracket
shapes (`border-left`/`border-right` only, no closing top/bottom) so it visually reads as a math
matrix, not a form.

**Canvas cards** — original and transformed images shown side by side, each with a small pill-style
tag above it (`--origin-soft` background + `--origin` text for original, `--accent-soft` +
`--accent` for transformed), connected by a plain arrow between them.

**`<DualExplain>`** — plain-language paragraph directly above a monospace math block on
`--paper-dim` background with rounded corners (~4px radius). Keep the math block visually distinct
(background shift) but not boxed in a heavy border — it should read as "the same idea, precisely
stated," not a separate callout.

**`<ShowMath>`** — collapsed by default, a text link/button ("Show the math" / "Hide the math"),
expands inline (no modal). When expanded, content uses the same monospace math-block styling as
`<DualExplain>`'s math side.

**Info/stat boxes** (det, trace, eigenvalues readouts) — monospace label/value rows, white
background, `--rule` border, 4px radius. Negative determinant value gets `--warn` color.

## Motion

Minimal. The one place motion earns its keep: the point moving from its original to transformed
position on `/point` step 6 — animate that specific transition (e.g. 300–400ms ease) since it's the
literal payoff of the whole walkthrough. Elsewhere, prefer instant updates (this is a math tool;
snappy feedback while dragging sliders matters more than decorative motion).

## Accessibility

- All interactive controls (sliders, buttons, file input) keyboard-reachable with visible focus
  rings.
- Color is never the only signal — e.g. negative determinant is flagged with both `--warn` color
  AND explanatory text ("mirrored"), not color alone.
- Respect `prefers-reduced-motion` for the point-transition animation.
