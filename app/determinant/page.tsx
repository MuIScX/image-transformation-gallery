"use client";

import { useEffect, useRef } from "react";
import { useMatrix } from "@/context/MatrixContext";
import { applyMatrix, determinant, type Point2 } from "@/lib/matrix";
import DualExplain from "@/components/DualExplain";
import ShowMath from "@/components/ShowMath";
import PageNav from "@/components/PageNav";
import MatrixInput from "@/components/MatrixInput";
import MatrixDisplay from "@/components/MatrixDisplay";

// Literal color values matching the CSS custom properties in globals.css. Canvas 2D fillStyle
// cannot resolve var(--token) references (no cascade context), so — same convention PointCanvas
// uses for its grid lines — the semantic colors are hardcoded here to match --origin/--accent/--warn.
const ORIGIN_HEX = "#a6553b";
const ORIGIN_FILL = "rgba(166, 85, 59, 0.22)";
const ACCENT_HEX = "#33509e";
const ACCENT_FILL = "rgba(51, 80, 158, 0.22)";
const WARN_HEX = "#b33b3b";

// A small asymmetric "F" marker, defined as three rectangles in local unit-square-scale
// coordinates (y-up). Asymmetric on purpose — under a reflection (det < 0) it reads as a
// mirrored/backwards F, which is unambiguous at a glance without reading any numbers.
const F_PARTS: { x0: number; y0: number; x1: number; y1: number }[] = [
  { x0: -0.045, y0: -0.17, x1: 0.045, y1: 0.17 }, // stem
  { x0: -0.045, y0: 0.1, x1: 0.16, y1: 0.17 }, // top arm
  { x0: -0.045, y0: -0.02, x1: 0.12, y1: 0.05 }, // mid arm
];

function fmt(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return String(r);
}

type UnitSquareCanvasProps = {
  quad: Point2[];
  fillColor: string;
  strokeColor: string;
  range: number;
  markerAnchor: Point2;
  markerBasisX: Point2;
  markerBasisY: Point2;
  markerColor: string;
  size?: number;
  ariaLabel: string;
};

// Draws one filled quadrilateral (the unit square, or its image under the current matrix) plus a
// small "F" marker embedded in the same local coordinate frame, so the marker rides along with
// the shape exactly the way a pixel's color rides along with its location elsewhere in the app.
function UnitSquareCanvas({
  quad,
  fillColor,
  strokeColor,
  range,
  markerAnchor,
  markerBasisX,
  markerBasisY,
  markerColor,
  size = 180,
  ariaLabel,
}: UnitSquareCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const quadKey = JSON.stringify(quad);
  const markerKey = JSON.stringify([markerAnchor, markerBasisX, markerBasisY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const scale = (size / 2 / range) * 0.82;
    // Standard math y-up convention: this is a self-contained abstract diagram (no real image
    // composited underneath it, unlike EigenOverlay), so it should look like a textbook unit
    // square — sitting above the axis, not flipped to match raster/image coordinates.
    const toPx = (x: number, y: number) => ({ px: cx + x * scale, py: cy - y * scale });

    // axes for orientation
    ctx.strokeStyle = "rgba(29, 36, 48, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy + 0.5);
    ctx.lineTo(size, cy + 0.5);
    ctx.moveTo(cx + 0.5, 0);
    ctx.lineTo(cx + 0.5, size);
    ctx.stroke();

    // the quadrilateral (unit square or its transformed image)
    ctx.beginPath();
    quad.forEach((v, i) => {
      const { px, py } = toPx(v.x, v.y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // the "F" marker, embedded via the same local basis so it inherits any mirroring
    ctx.fillStyle = markerColor;
    for (const part of F_PARTS) {
      const corners: [number, number][] = [
        [part.x0, part.y0],
        [part.x1, part.y0],
        [part.x1, part.y1],
        [part.x0, part.y1],
      ];
      ctx.beginPath();
      corners.forEach(([lx, ly], i) => {
        const mx = markerAnchor.x + lx * markerBasisX.x + ly * markerBasisY.x;
        const my = markerAnchor.y + lx * markerBasisX.y + ly * markerBasisY.y;
        const { px, py } = toPx(mx, my);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quadKey, fillColor, strokeColor, range, markerKey, markerColor, size]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded bg-background shadow-border"
      role="img"
      aria-label={ariaLabel}
    />
  );
}

const WORKED_EXAMPLES: {
  name: string;
  matrix: [string, string, string, string] | null;
  calc: string;
  result: string;
}[] = [
  { name: "Scale", matrix: ["2", "0", "0", "3"], calc: "det = 2(3) − 0 = 6", result: "area × 6" },
  { name: "Rotation (any θ)", matrix: null, calc: "det = cos²θ + sin²θ = 1", result: "area preserved" },
  { name: "Shear", matrix: ["1", "k", "0", "1"], calc: "det = 1(1) − k(0) = 1", result: "area preserved, shape changes" },
  {
    name: "Reflect y-axis",
    matrix: ["-1", "0", "0", "1"],
    calc: "det = -1(1) − 0 = -1",
    result: "area preserved, orientation flipped",
  },
];

export default function DeterminantPage() {
  const { a, b, c, d, setMatrix } = useMatrix();
  const det = determinant(a, b, c, d);
  const absDet = Math.abs(det);
  const flipped = det < 0;

  const beforeQuad: Point2[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];
  const afterQuad: Point2[] = beforeQuad.map((v) => applyMatrix(a, b, c, d, v.x, v.y));

  const maxAbs = [...beforeQuad, ...afterQuad].reduce(
    (m, p) => Math.max(m, Math.abs(p.x), Math.abs(p.y)),
    1
  );
  const range = Math.max(1.2, maxAbs * 1.15);

  const afterAnchor = applyMatrix(a, b, c, d, 0.5, 0.5);

  const mathLines = [
    "det(A) = ad − bc",
    `= (${fmt(a)})(${fmt(d)}) − (${fmt(b)})(${fmt(c)})`,
    `= ${fmt(a * d)} − ${fmt(b * c)}`,
    `= ${fmt(det)}`,
  ].join("\n");

  return (
    <div>
      <div className="mb-8 space-y-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          The determinant: area and orientation
        </h1>
        <p className="text-[15px] text-foreground-soft">
          Every 2×2 matrix scales area by a single number — the determinant — and its sign tells
          you whether shapes come out mirrored.
        </p>
      </div>

      <div className="mb-10 space-y-3 rounded-lg bg-background p-5 shadow-border">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Try it — the square on the right is this matrix&rsquo;s live image
        </h2>
        <MatrixInput value={{ a, b, c, d }} onChange={setMatrix} min={-3} max={3} step={0.1} />
      </div>

      <div className="grid gap-10 md:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2">
            <span className="inline-block rounded-full bg-origin-soft px-2.5 py-0.5 text-[12px] font-medium text-origin">
              Before
            </span>
            <UnitSquareCanvas
              quad={beforeQuad}
              fillColor={ORIGIN_FILL}
              strokeColor={ORIGIN_HEX}
              range={range}
              markerAnchor={{ x: 0.5, y: 0.5 }}
              markerBasisX={{ x: 1, y: 0 }}
              markerBasisY={{ x: 0, y: 1 }}
              markerColor="rgba(23, 23, 23, 0.45)"
              ariaLabel="The unit square before transformation, area 1"
            />
            <p className="font-mono font-mono-nums text-[13px] text-foreground-soft">Area = 1</p>
          </div>

          <div className="flex justify-center text-[18px] text-foreground-soft" aria-hidden>
            ↓
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-medium text-accent">
              After (current matrix)
            </span>
            <UnitSquareCanvas
              quad={afterQuad}
              fillColor={ACCENT_FILL}
              strokeColor={flipped ? WARN_HEX : ACCENT_HEX}
              range={range}
              markerAnchor={afterAnchor}
              markerBasisX={{ x: a, y: c }}
              markerBasisY={{ x: b, y: d }}
              markerColor={flipped ? WARN_HEX : "rgba(23, 23, 23, 0.55)"}
              ariaLabel={`The unit square's image under the current matrix, area ${fmt(absDet)}${flipped ? ", mirrored" : ""}`}
            />
            <p
              className={`font-mono font-mono-nums text-[13px] ${flipped ? "font-semibold text-warn" : "text-foreground-soft"}`}
            >
              Area = |det(A)| = {fmt(absDet)}
              {flipped ? " (mirrored)" : ""}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <DualExplain
            plain="The determinant tells you how the transformation changes area. If |det(A)| = 2, every shape doubles in area. If |det(A)| = 0.5, areas shrink by half. If |det(A)| = 1, area is exactly preserved."
            math={mathLines}
          />

          <div className={`rounded px-4 py-3 shadow-border-sm ${flipped ? "bg-warn-soft" : "bg-surface"}`}>
            <p className="text-[14px] leading-relaxed text-foreground">
              A positive determinant preserves orientation.{" "}
              <span className={flipped ? "font-semibold text-warn" : ""}>
                A negative determinant reverses it — the image comes out mirrored, even if the
                area is unchanged.
              </span>
            </p>
            {flipped && (
              <p className="mt-2 text-[13px] font-medium text-warn">
                Current matrix: det(A) = {fmt(det)} &lt; 0 — orientation is flipped. Notice the
                &ldquo;F&rdquo; marker in the &ldquo;after&rdquo; square reads backwards, not just
                the number.
              </p>
            )}
          </div>

          <div className="rounded bg-surface px-4 py-3 shadow-border-sm">
            <p className="mb-2 text-[13px] font-medium text-foreground-soft">
              Worked examples (reference — not the current matrix)
            </p>
            <div className="space-y-2">
              {WORKED_EXAMPLES.map((ex) => (
                <div
                  key={ex.name}
                  className="grid grid-cols-1 gap-x-4 gap-y-1 font-mono font-mono-nums text-[13px] leading-relaxed text-foreground sm:grid-cols-[minmax(0,190px)_minmax(0,220px)_1fr] sm:items-center"
                >
                  <span className="flex items-center gap-2">
                    {ex.name}
                    {ex.matrix && (
                      <MatrixDisplay
                        size="sm"
                        a={ex.matrix[0]}
                        b={ex.matrix[1]}
                        c={ex.matrix[2]}
                        d={ex.matrix[3]}
                      />
                    )}
                    :
                  </span>
                  <span>{ex.calc}</span>
                  <span className="text-foreground-soft">→ {ex.result}</span>
                </div>
              ))}
            </div>
          </div>

          <ShowMath label="Show the derivation">
            <div>
              <p className="flex items-center gap-2 text-foreground-soft">
                Scale <MatrixDisplay size="sm" a="2" b="0" c="0" d="3" />
              </p>
              <p>det = 2(3) − 0(0) = 6 − 0 = 6</p>
            </div>
            <div>
              <p className="flex flex-wrap items-center gap-2 text-foreground-soft">
                Rotation R(θ) = <MatrixDisplay size="sm" a="cosθ" b="-sinθ" c="sinθ" d="cosθ" />
              </p>
              <p>det = cosθ·cosθ − (−sinθ)·sinθ = cos²θ + sin²θ = 1</p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-foreground-soft">
                Shear <MatrixDisplay size="sm" a="1" b="k" c="0" d="1" />
              </p>
              <p>det = 1(1) − k(0) = 1 − 0 = 1</p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-foreground-soft">
                Reflect y-axis <MatrixDisplay size="sm" a="-1" b="0" c="0" d="1" />
              </p>
              <p>det = (−1)(1) − 0(0) = −1 − 0 = −1</p>
            </div>
            <div>
              <p>
                This is exactly why the shaded parallelogram&rsquo;s area equals |det(A)| times
                the original square&rsquo;s area — the determinant <em>is</em> the area-scaling
                factor, this is just the algebra that proves it.
              </p>
            </div>
          </ShowMath>
        </div>
      </div>

      <PageNav />
    </div>
  );
}
