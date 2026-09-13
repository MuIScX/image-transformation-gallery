# 04 — Shared Components, Global State & Math Engine

## Suggested file structure

```
app/
  layout.tsx                 # global layout, stepper nav
  page.tsx                   # redirect to /point
  point/page.tsx
  transforms/page.tsx
  determinant/page.tsx
  eigen/page.tsx
  summary/page.tsx
  playground/page.tsx
  gallery/page.tsx
components/
  StepperNav.tsx
  DualExplain.tsx
  ShowMath.tsx
  MatrixInput.tsx            # the "bracket" 2x2 matrix control
  InfoBox.tsx                 # det/trace/eigenvalue readout
  PointCanvas.tsx              # mini coordinate-grid canvas for /point
  ImageCompareCanvas.tsx       # original | transformed side-by-side, for /transforms, /playground
  EigenOverlay.tsx             # draws eigenvector arrows on a canvas
  RecapTable.tsx                # /summary table
lib/
  matrix.ts                   # pure math functions (see below)
  transformImage.ts            # inverse-mapping + bilinear interpolation
  sampleImage.ts                # procedural test image generator
context/
  MatrixContext.tsx            # shared { a, b, c, d, point, setMatrix, setPoint }
```

## Global state (`MatrixContext`)

```ts
type MatrixState = {
  a: number; b: number; c: number; d: number;
  point: { x: number; y: number };   // tracked point for /point, relative to image center
  setMatrix: (m: Partial<{a:number;b:number;c:number;d:number}>) => void;
  setPoint: (p: {x:number;y:number}) => void;
  reset: () => void;                  // back to identity matrix + default point
};
```

Default matrix: identity `{a:1,b:0,c:0,d:1}`. Default point: `{x:80,y:-40}` (matches the working
prototype). Every route reads from and writes to this single context so state carries across pages
during a live walkthrough.

## `<DualExplain>`

```tsx
<DualExplain
  plain="This matrix stretches everything sideways, like pulling taffy."
  math={`x' = 2x\ny' = y`}
/>
```
Renders plain-language paragraph, then the math block (monospace, `--paper-dim` background). Math
prop accepts multi-line strings; render each line as its own row.

## `<ShowMath>`

```tsx
<ShowMath label="Show the derivation">
  {/* full characteristic-equation expansion, or any other derivation */}
</ShowMath>
```
Collapsed by default; toggling reveals children inline, styled like the math half of
`<DualExplain>`. Use for: characteristic equation expansion, rotation's complex-eigenvalue
derivation, the center-of-image conjugation `T⁻¹AT` derivation, and the cos²+sin²=1 determinant
proof for rotation.

## Math engine (`lib/matrix.ts`) — port directly from the working prototype, logic is validated

```ts
export function applyMatrix(a:number,b:number,c:number,d:number,x:number,y:number){
  return { x: a*x + b*y, y: c*x + d*y };
}

export function determinant(a:number,b:number,c:number,d:number){
  return a*d - b*c;
}

export function trace(a:number,b:number,c:number,d:number){
  return a + d;
}

// Returns real eigenpair(s) or a complex pair, mirroring the prototype's eigenInfo()
export function eigenInfo(a:number,b:number,c:number,d:number){
  const tr = a+d, det = a*d-b*c;
  if (Math.abs(b) < 1e-9 && Math.abs(c) < 1e-9) {
    return { type: 'real' as const, values: [a,d], vectors: [[1,0],[0,1]], det, trace: tr };
  }
  const disc = tr*tr - 4*det;
  if (disc >= 0) {
    const sq = Math.sqrt(disc);
    const l1 = (tr+sq)/2, l2 = (tr-sq)/2;
    const vecFor = (l:number) => normalize(Math.abs(b) > 1e-9 ? [b, l-a] : [l-d, c]);
    return { type: 'real' as const, values: [l1,l2], vectors: [vecFor(l1), vecFor(l2)], det, trace: tr };
  }
  const sq = Math.sqrt(-disc);
  return { type: 'complex' as const, re: tr/2, im: sq/2, det, trace: tr };
}

function normalize(v:[number,number]): [number,number] {
  const len = Math.hypot(v[0], v[1]) || 1;
  return [v[0]/len, v[1]/len];
}
```

## Image transform (`lib/transformImage.ts`) — inverse mapping + bilinear interpolation

Port directly; this is the algorithm already validated in the HTML prototype. Core idea: for every
output pixel, compute where it came from via `A⁻¹`, then bilinearly blend the four nearest source
pixels. Never forward-map (source → output), which leaves gaps.

```ts
export function transformImageData(
  src: ImageData, w: number, h: number,
  a:number, b:number, c:number, d:number
): ImageData {
  const dst = new ImageData(w, h);
  const det = a*d - b*c;
  const cx = w/2, cy = h/2;
  const singular = Math.abs(det) < 1e-6;
  const ia = singular?0: d/det, ib = singular?0: -b/det;
  const ic = singular?0: -c/det, id = singular?0: a/det;
  const bg = [246,245,240,255];

  for (let py=0; py<h; py++) {
    const oy = py - cy;
    for (let px=0; px<w; px++) {
      const ox = px - cx;
      let sx = -9999, sy = -9999;
      if (!singular) {
        sx = ia*ox + ib*oy + cx;
        sy = ic*ox + id*oy + cy;
      }
      const idx = (py*w+px)*4;
      if (sx>=0 && sx<w-1 && sy>=0 && sy<h-1) {
        const x0 = Math.floor(sx), y0 = Math.floor(sy);
        const fx = sx-x0, fy = sy-y0;
        for (let ch=0; ch<4; ch++) {
          const c00 = src.data[(y0*w+x0)*4+ch];
          const c10 = src.data[(y0*w+x0+1)*4+ch];
          const c01 = src.data[((y0+1)*w+x0)*4+ch];
          const c11 = src.data[((y0+1)*w+x0+1)*4+ch];
          const top = c00*(1-fx)+c10*fx;
          const bot = c01*(1-fx)+c11*fx;
          dst.data[idx+ch] = top*(1-fy)+bot*fy;
        }
      } else {
        dst.data[idx]=bg[0]; dst.data[idx+1]=bg[1]; dst.data[idx+2]=bg[2]; dst.data[idx+3]=bg[3];
      }
    }
  }
  return dst;
}
```

## Sample image (`lib/sampleImage.ts`)

Procedurally generate (no external assets): paper-color background, faint reference grid, four
colored quadrants (so flips/rotations are unambiguous), a bold asymmetric letter "F" centered
(classic choice — asymmetric on both axes, so mirroring is always visually obvious), and a small
corner marker circle as a single trackable reference point. Port the drawing logic from the
prototype's `paintSampleImage()`.

## `<MatrixInput>`

Four number+range input pairs laid out in a 2×2 grid inside the bracket frame (see
`03-design-system.md`). On change, calls `setMatrix` on context. Also renders the preset buttons
(Identity, Scale, Rotate 45°, Shear, Reflect-Y, Reflect-X, Singular) — clicking one sets all four
matrix values at once.

## `<EigenOverlay>`

Draws green line(s) through the canvas center along eigenvector direction(s), length scaled by
`|λ|` (clamped to a sane max), only when `eigenInfo().type === 'real'`. When complex, render no
lines — the *absence* of green lines on a rotation is itself part of the lesson (pair with a text
note, not a silent omission).
