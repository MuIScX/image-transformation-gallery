"use client";

import { useState } from "react";
import { useMatrix } from "@/context/MatrixContext";
import { applyMatrix } from "@/lib/matrix";
import PointCanvas, { type PlottedArrow, type PlottedPoint } from "@/components/PointCanvas";
import DualExplain from "@/components/DualExplain";
import PageNav from "@/components/PageNav";
import MatrixInput, { NumberText } from "@/components/MatrixInput";

// Labels describe where the point actually renders on the canvas below, which plots with
// standard math convention (positive y = up) — so y=90 is "upper," not "lower," etc.
const POINT_PRESETS: { name: string; x: number; y: number }[] = [
  { name: "Default", x: 80, y: -40 },
  { name: "Upper-right", x: 120, y: 90 },
  { name: "Lower-left", x: -100, y: -70 },
];

const STEP_COUNT = 7;

// Format a number for display: round to 2 decimals, drop trailing zeros.
function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : r.toString();
}

// The term-by-term reveal used in steps 4 and 5: same visual language as <DualExplain>'s math
// block, but broken into one line per term (what got multiplied, and what it came to) before the
// final sum — so nothing is skipped between "here's the formula" and "here's the answer."
function TermReveal({
  plain,
  formula,
  termLines,
  result,
}: {
  plain: string;
  formula: string;
  termLines: string[];
  result: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[15px] leading-relaxed text-foreground">{plain}</p>
      <div className="space-y-1.5 rounded bg-surface px-4 py-3 shadow-border-sm">
        <div className="font-mono font-mono-nums text-[14px] leading-relaxed text-foreground">
          {formula}
        </div>
        {termLines.map((line, i) => (
          <div
            key={i}
            className="font-mono font-mono-nums text-[14px] leading-relaxed text-foreground-soft"
          >
            {line}
          </div>
        ))}
        <div className="font-mono font-mono-nums text-[15px] font-semibold leading-relaxed text-accent">
          {result}
        </div>
      </div>
    </div>
  );
}

export default function PointPage() {
  const { a, b, c, d, point, setPoint, setMatrix } = useMatrix();
  const [step, setStep] = useState(0); // 0-indexed, steps 1..7

  const { x, y } = point;
  const { x: xPrime, y: yPrime } = applyMatrix(a, b, c, d, x, y);

  const term1x = a * x;
  const term2x = b * y;
  const term1y = c * x;
  const term2y = d * y;

  // Visual content (points/arrows) for the mini coordinate-grid canvas, per step.
  let canvasPoints: PlottedPoint[] = [{ x, y, color: "var(--origin)", label: "(x, y)" }];
  let canvasArrows: PlottedArrow[] = [];

  if (step === 5) {
    // Step 6 — see it move: the original point stays fixed as a reference; the transformed
    // point is the thing that actually travels, from the original position to its own, in sync
    // with the arrow (animateFrom) — otherwise it would sit pre-arrived at (x', y') from frame 0
    // while only the arrow caught up, which reads as "nothing moved."
    canvasPoints = [
      { x, y, color: "var(--origin)", label: "original" },
      { x: xPrime, y: yPrime, animateFrom: { x, y }, color: "var(--accent)", label: "transformed" },
    ];
    canvasArrows = [
      {
        from: { x, y },
        to: { x: xPrime, y: yPrime },
        color: "var(--accent)",
        dashed: true,
        animate: true,
      },
    ];
  } else if (step === 6) {
    // Step 7 — the matrix aspect: basis vectors and their images.
    canvasPoints = [
      { x: 1, y: 0, color: "var(--origin)", label: "(1, 0)" },
      { x: 0, y: 1, color: "var(--origin)", label: "(0, 1)" },
      { x: a, y: c, color: "var(--accent)", label: "(a, c)" },
      { x: b, y: d, color: "var(--eigen)", label: "(b, d)" },
    ];
    canvasArrows = [
      { from: { x: 1, y: 0 }, to: { x: a, y: c }, color: "var(--accent)" },
      { from: { x: 0, y: 1 }, to: { x: b, y: d }, color: "var(--eigen)" },
    ];
  }

  // Pick a canvas range that comfortably fits everything currently plotted. Step 7 plots basis
  // vectors and their images — coordinates around magnitude 1-3 — a completely different scale
  // from the point coordinates steps 1-6 use (up to ~120). Reusing one shared floor for both
  // zoomed step 7's unit-scale vectors out to the same view as an 80-unit point, collapsing them
  // into an illegible cluster at the origin — so the two cases get their own floor/rounding.
  const allCoords = [
    ...canvasPoints.flatMap((p) => [p.x, p.y]),
    ...canvasArrows.flatMap((ar) => [ar.from.x, ar.from.y, ar.to.x, ar.to.y]),
  ];
  const range =
    step === 6
      ? Math.max(2, Math.ceil(Math.max(1, ...allCoords.map((v) => Math.abs(v))) * 1.3 * 10) / 10)
      : Math.max(160, Math.ceil((Math.max(20, ...allCoords.map((v) => Math.abs(v))) * 1.25) / 10) * 10);

  const stepTitles = [
    "Start with a point",
    "The matrix is a rule",
    "Substitute the numbers",
    "Work out x′, term by term",
    "Work out y′, term by term",
    "See it move",
    "What a, b, c, d really are",
  ];

  return (
    <div>
      <h1 className="text-balance text-[28px] font-semibold tracking-tight text-foreground">
        Watch one point move
      </h1>
      <p className="mt-2 max-w-[65ch] text-[15px] leading-relaxed text-foreground-soft">
        Before a whole image gets transformed, one point does — this is the same rule, applied
        seven ways, to a single coordinate.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left: point picker + mini coordinate-grid canvas */}
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-end gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-foreground-soft">x</span>
                <NumberText
                  value={x}
                  onCommit={(n) => setPoint({ x: n, y })}
                  className="w-24 rounded bg-surface px-2 py-1 font-mono font-mono-nums text-[14px] text-foreground shadow-border-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                  ariaLabel="point x coordinate"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-foreground-soft">y</span>
                <NumberText
                  value={y}
                  onCommit={(n) => setPoint({ x, y: n })}
                  className="w-24 rounded bg-surface px-2 py-1 font-mono font-mono-nums text-[14px] text-foreground shadow-border-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                  ariaLabel="point y coordinate"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {POINT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setPoint({ x: preset.x, y: preset.y })}
                  className="rounded-full bg-surface px-3 py-1 text-[13px] text-foreground shadow-border-sm transition hover:shadow-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                >
                  {preset.name} ({preset.x}, {preset.y})
                </button>
              ))}
            </div>
          </div>

          <PointCanvas points={canvasPoints} arrows={canvasArrows} range={range} />

          {(step === 5 || step === 6) && (
            <div className="space-y-3 rounded-lg bg-background p-4 shadow-border">
              <h2 className="text-[13px] font-medium text-foreground-soft">
                {step === 5
                  ? "Matrix — edit it and watch the point move"
                  : "Matrix — edit it and watch where (1,0) and (0,1) land"}
              </h2>
              <MatrixInput value={{ a, b, c, d }} onChange={setMatrix} min={-3} max={3} step={0.1} />
            </div>
          )}
        </div>

        {/* Right: step panel */}
        <div className="space-y-5">
          <ol className="flex items-center gap-2" aria-label="Step progress">
            {Array.from({ length: STEP_COUNT }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={i === step ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${stepTitles[i]}`}
                  className={`h-2.5 w-2.5 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    i === step ? "bg-accent" : "bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(0,0,0,0.3)]"
                  }`}
                />
              </li>
            ))}
          </ol>

          <div>
            <div className="text-[12px] font-medium uppercase tracking-wide text-foreground-soft">
              Step {step + 1} of {STEP_COUNT}
            </div>
            <h2 className="mt-1 text-[19px] font-semibold tracking-tight text-foreground">
              {stepTitles[step]}
            </h2>
          </div>

          <div className="min-h-[180px]">
            {step === 0 && (
              <DualExplain
                plain="Every pixel in the image is just a coordinate pair. Here's one point."
                math={`(x, y) = (${fmt(x)}, ${fmt(y)})`}
              />
            )}

            {step === 1 && (
              <DualExplain
                plain="A 2×2 matrix defines a fixed rule for turning any (x, y) into a new (x′, y′). This shape never changes, no matter what a, b, c, d are."
                math={[
                  "x' = a·x + b·y",
                  "y' = c·x + d·y",
                  "",
                  "current matrix:",
                  `[a b]   [${fmt(a)} ${fmt(b)}]`,
                  `[c d] = [${fmt(c)} ${fmt(d)}]`,
                ].join("\n")}
              />
            )}

            {step === 2 && (
              <DualExplain
                plain="Swap in the actual matrix values and the actual point. Nothing is computed yet — this is just the formula with numbers dropped in."
                math={[
                  `x' = (${fmt(a)})(${fmt(x)}) + (${fmt(b)})(${fmt(y)})`,
                  `y' = (${fmt(c)})(${fmt(x)}) + (${fmt(d)})(${fmt(y)})`,
                ].join("\n")}
              />
            )}

            {step === 3 && (
              <TermReveal
                plain="The new x-coordinate is a weighted mix of the old x and the old y — that's all matrix multiplication is doing here. Two small multiplications, then add them."
                formula={`x' = (${fmt(a)})(${fmt(x)}) + (${fmt(b)})(${fmt(y)})`}
                termLines={[
                  `term 1 = a · x = (${fmt(a)})(${fmt(x)}) = ${fmt(term1x)}`,
                  `term 2 = b · y = (${fmt(b)})(${fmt(y)}) = ${fmt(term2x)}`,
                ]}
                result={`x' = term 1 + term 2 = ${fmt(term1x)} + ${fmt(term2x)} = ${fmt(xPrime)}`}
              />
            )}

            {step === 4 && (
              <TermReveal
                plain="Same idea, using the matrix's second row instead of its first — c and d in place of a and b."
                formula={`y' = (${fmt(c)})(${fmt(x)}) + (${fmt(d)})(${fmt(y)})`}
                termLines={[
                  `term 1 = c · x = (${fmt(c)})(${fmt(x)}) = ${fmt(term1y)}`,
                  `term 2 = d · y = (${fmt(d)})(${fmt(y)}) = ${fmt(term2y)}`,
                ]}
                result={`y' = term 1 + term 2 = ${fmt(term1y)} + ${fmt(term2y)} = ${fmt(yPrime)}`}
              />
            )}

            {step === 5 && (
              <DualExplain
                plain="That's the whole operation, for one point. The full image transform is exactly this, repeated for every single pixel."
                math={[
                  "(x, y) → (x', y')",
                  `(${fmt(x)}, ${fmt(y)}) → (${fmt(xPrime)}, ${fmt(yPrime)})`,
                ].join("\n")}
              />
            )}

            {step === 6 && (
              <DualExplain
                plain="Apply the same rule to the two simplest points, (1,0) and (0,1). That's not a coincidence — the two columns of the matrix are exactly where it sends those two points. Every other point, including the one above, is just a combination of these two mapped directions. That's what a 2×2 matrix is, geometrically."
                math={[
                  `(1, 0) → (a, c) = (${fmt(a)}, ${fmt(c)})`,
                  `(0, 1) → (b, d) = (${fmt(b)}, ${fmt(d)})`,
                ].join("\n")}
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full bg-surface px-4 py-2 text-[14px] text-foreground shadow-border-sm transition hover:shadow-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-border-sm"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEP_COUNT - 1, s + 1))}
              disabled={step === STEP_COUNT - 1}
              className="rounded-full bg-accent px-4 py-2 text-[14px] font-medium text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <PageNav />
    </div>
  );
}
