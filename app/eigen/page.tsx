"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMatrix } from "@/context/MatrixContext";
import { applyMatrix, eigenInfo, type EigenInfo } from "@/lib/matrix";
import DualExplain from "@/components/DualExplain";
import ShowMath from "@/components/ShowMath";
import InfoBox from "@/components/InfoBox";
import PageNav from "@/components/PageNav";
import MatrixInput from "@/components/MatrixInput";

// Small numeric formatter shared by every readout on this page — rounds to 2 decimals and
// strips trailing zeros so e.g. "3" not "3.00", but keeps "2.5" as-is.
function fmt(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return Object.is(rounded, -0) ? "0" : rounded.toString();
}

const TWO_PI = Math.PI * 2;
const SAMPLE_COUNT = 8;
const EIGEN_ANGLE_EPS = (3 * Math.PI) / 180; // ~3 degrees

function normalizeAngle(t: number): number {
  let a = t % TWO_PI;
  if (a < 0) a += TWO_PI;
  return a;
}

type ArrowSpec = { angle: number; isEigen: boolean; lambda?: number };

// Builds the set of radiating-arrow directions: 8 evenly spaced "generic" samples, plus (when
// eigenvalues are real) the actual eigenvector line(s) — injected as extra arrows at their exact
// angle if they don't already coincide with one of the 8 samples, otherwise the coinciding
// sample is just tagged as the eigenvector arrow. This keeps the visual correct for any matrix,
// not just the axis-aligned special cases (scale/shear) where the eigenvectors happen to land on
// a sample angle already.
function buildArrows(info: EigenInfo): ArrowSpec[] {
  const arrows: ArrowSpec[] = [];
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    arrows.push({ angle: (i * TWO_PI) / SAMPLE_COUNT, isEigen: false });
  }

  if (info.type === "real") {
    info.vectors.forEach((v, vi) => {
      const lambda = info.values[vi];
      const baseAngle = Math.atan2(v[1], v[0]);
      // An eigenvector's line runs both ways through the origin — both the vector's angle and
      // its opposite lie on the same invariant line, so tag both.
      [baseAngle, baseAngle + Math.PI].forEach((raw) => {
        const angle = normalizeAngle(raw);
        let nearestIdx = -1;
        let nearestDist = Infinity;
        arrows.forEach((ar, idx) => {
          const diff = Math.min(Math.abs(ar.angle - angle), TWO_PI - Math.abs(ar.angle - angle));
          if (diff < nearestDist) {
            nearestDist = diff;
            nearestIdx = idx;
          }
        });
        if (nearestDist < EIGEN_ANGLE_EPS) {
          arrows[nearestIdx].isEigen = true;
          arrows[nearestIdx].lambda = lambda;
        } else {
          arrows.push({ angle, isEigen: true, lambda });
        }
      });
    });
  }

  return arrows;
}

type EigenArrowsProps = {
  a: number;
  b: number;
  c: number;
  d: number;
  info: EigenInfo;
};

// The core teaching visual for this page — several arrows radiating from the canvas center.
// Under the current matrix, most rotate to a new direction (muted gray); the eigenvector
// arrow(s), when real, only change length and stay on their original line (highlighted green).
// When eigenvalues are complex, nothing is highlighted — every direction rotates.
function EigenArrows({ a, b, c, d, info }: EigenArrowsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 290;
  const range = 140;
  const unitLen = 82;

  const arrows = useMemo(() => buildArrows(info), [info]);

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

    const cx = size / 2;
    const cy = size / 2;
    const scale = size / 2 / range;
    // No y-flip: matches the raster (y-down) convention the real image transform uses elsewhere
    // (transformImageData), so a matrix rotates arrows here the same visual direction it actually
    // rotates the sample image on /transforms and /playground.
    const toPx = (x: number, y: number) => ({ px: cx + x * scale, py: cy + y * scale });

    // Canvas 2D fillStyle/strokeStyle don't resolve CSS custom properties (unlike SVG
    // presentation attributes elsewhere in the app), so resolve the tokens to concrete colors.
    const rootStyle = getComputedStyle(document.documentElement);
    const eigenColor = rootStyle.getPropertyValue("--eigen").trim() || "#2f7d5c";
    const mutedColor = rootStyle.getPropertyValue("--foreground-soft").trim() || "#5b6472";

    const drawArrowhead = (px: number, py: number, angle: number, color: string) => {
      const headLen = 7;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-headLen, headLen / 2.2);
      ctx.lineTo(-headLen, -headLen / 2.2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    ctx.clearRect(0, 0, size, size);

    // faint axes
    ctx.strokeStyle = "rgba(29, 36, 48, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 0.5, 0);
    ctx.lineTo(cx + 0.5, size);
    ctx.moveTo(0, cy + 0.5);
    ctx.lineTo(size, cy + 0.5);
    ctx.stroke();

    // faint dashed reference circle at the "unit length" radius
    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(29, 36, 48, 0.18)";
    ctx.beginPath();
    ctx.arc(cx, cy, unitLen * scale, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();

    // compute transformed points, then find a uniform display scale so nothing overflows
    const pts = arrows.map((ar) => {
      const ox = unitLen * Math.cos(ar.angle);
      const oy = unitLen * Math.sin(ar.angle);
      const t = applyMatrix(a, b, c, d, ox, oy);
      return { ...ar, ox, oy, tx: t.x, ty: t.y };
    });
    const maxMag = Math.max(unitLen, ...pts.map((p) => Math.hypot(p.tx, p.ty)));
    const maxDisplay = range * 0.9;
    const displayScale = maxMag > maxDisplay ? maxDisplay / maxMag : 1;

    // original (pre-transform) reference rays — thin dashed, drawn first so solid arrows sit on top
    for (const p of pts) {
      const from = toPx(0, 0);
      const to = toPx(p.ox, p.oy);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "rgba(29, 36, 48, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(from.px, from.py);
      ctx.lineTo(to.px, to.py);
      ctx.stroke();
      ctx.restore();
    }

    // transformed arrows — muted for generic directions, eigen-green for invariant lines
    for (const p of pts) {
      const from = toPx(0, 0);
      const to = toPx(p.tx * displayScale, p.ty * displayScale);
      const color = p.isEigen ? eigenColor : mutedColor;
      ctx.save();
      ctx.globalAlpha = p.isEigen ? 1 : 0.6;
      ctx.strokeStyle = color;
      ctx.lineWidth = p.isEigen ? 2.5 : 2;
      ctx.beginPath();
      ctx.moveTo(from.px, from.py);
      ctx.lineTo(to.px, to.py);
      ctx.stroke();
      const angle = Math.atan2(to.py - from.py, to.px - from.px);
      drawArrowhead(to.px, to.py, angle, color);
      ctx.restore();
    }
  }, [a, b, c, d, arrows, size, range, unitLen]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded bg-background shadow-border"
      role="img"
      aria-label="Arrows radiating from the center, showing how each direction moves under the current matrix. Muted arrows rotate; green arrows only change length."
    />
  );
}

export default function EigenPage() {
  const { a, b, c, d, setMatrix } = useMatrix();
  const liveInfo = useMemo(() => eigenInfo(a, b, c, d), [a, b, c, d]);

  // Static reference examples — deliberately computed from fixed local matrices via eigenInfo(),
  // never from the shared/current matrix, so this block stays constant while the presenter
  // changes the live matrix elsewhere on the page (per CLAUDE.md).
  const scaleInfo = useMemo(() => eigenInfo(2, 0, 0, 3), []);
  const rot90Info = useMemo(() => eigenInfo(0, -1, 1, 0), []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Eigenvectors: the directions that don&rsquo;t turn
      </h1>
      <p className="mt-2 max-w-[70ch] text-[15px] text-foreground-soft">
        Most directions in an image spin and stretch under a matrix. Eigenvectors are the
        special directions that don&rsquo;t.
      </p>

      <div className="mt-8 space-y-3 rounded-lg bg-background p-5 shadow-border">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Try it — watch which arrows stay put as you change the matrix
        </h2>
        <MatrixInput value={{ a, b, c, d }} onChange={setMatrix} min={-3} max={3} step={0.1} />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[290px_1fr] md:items-start">
        <div>
          <EigenArrows a={a} b={b} c={c} d={d} info={liveInfo} />
          <div className="mt-3 space-y-1.5 text-[13px] text-foreground-soft">
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--foreground-soft)" }} aria-hidden />
              rotates and changes length under the current matrix
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--eigen)" }} aria-hidden />
              eigenvector direction — only changes length, stays on the same line
            </p>
            {liveInfo.type === "complex" && (
              <p className="pt-1 text-foreground">
                No arrow is green here: this matrix has no real eigenvectors, so every direction
                rotates.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. Analogy, before any math */}
          <p className="text-[15px] leading-relaxed text-foreground">
            Most directions in the image spin and stretch when you apply the matrix. But
            sometimes there&rsquo;s a direction — maybe two — that only stretches. It never
            turns. That direction is called an <strong>eigenvector</strong>, and the amount it
            stretches by is its <strong>eigenvalue</strong>.
          </p>

          {/* 2. The defining equation, worked numerically */}
          <DualExplain
            plain="Normally, applying A changes both the length and direction of a vector. An eigenvector is the special case where only the length changes."
            math={[
              "Av = λv",
              "",
              "v = (1, 0), and suppose Av = (3, 0).",
              "Then Av = 3v, so λ = 3.",
              "The x-axis is an eigenvector direction here, stretched by 3.",
            ].join("\n")}
          />
        </div>
      </div>

      {/* 3. How do we actually find them? (derivation, collapsed) */}
      <div className="mt-10">
        <ShowMath label="How do we actually find them?">
          <div>det(A − λI) = 0</div>
          <div>&nbsp;</div>
          <div>det [ a−λ&nbsp;&nbsp; b&nbsp; ] = 0</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;[ c&nbsp;&nbsp; d−λ ]</div>
          <div>&nbsp;</div>
          <div>(a−λ)(d−λ) − bc = 0</div>
          <div>&nbsp;</div>
          <div className="text-foreground-soft">
            This is the characteristic equation. Solving it — a quadratic in λ — gives the
            eigenvalue(s).
          </div>
        </ShowMath>
      </div>

      {/* 4. Worked examples per transform — static, always all four */}
      <div className="mt-10">
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
          Worked examples, one per transform
        </h2>
        <p className="mt-1 text-[14px] text-foreground-soft">
          These use fixed example matrices, independent of whatever matrix is currently loaded
          above.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded bg-surface px-4 py-3 shadow-border-sm">
            <div className="text-[13px] font-medium text-foreground">Scale [2 0; 0 3]</div>
            <div className="font-mono font-mono-nums text-[13px] leading-relaxed text-foreground">
              det(A−λI) = (2−λ)(3−λ) = 0
              <br />→ λ₁ = {fmt(scaleInfo.type === "real" ? scaleInfo.values[0] : 0)}, λ₂ ={" "}
              {fmt(scaleInfo.type === "real" ? scaleInfo.values[1] : 0)}
            </div>
            <p className="text-[13px] leading-relaxed text-foreground-soft">
              Matches intuition: x is stretched ×2, y is stretched ×3.
            </p>
          </div>

          <div className="space-y-2 rounded bg-surface px-4 py-3 shadow-border-sm">
            <div className="text-[13px] font-medium text-foreground">Shear [1 k; 0 1]</div>
            <div className="font-mono font-mono-nums text-[13px] leading-relaxed text-foreground">
              det(A−λI) = (1−λ)² = 0
              <br />→ λ = 1 (double root)
            </div>
            <p className="text-[13px] leading-relaxed text-foreground-soft">
              There&rsquo;s a direction that isn&rsquo;t stretched at all — the x-axis, for
              horizontal shear.
            </p>
          </div>

          <div className="space-y-2 rounded bg-surface px-4 py-3 shadow-border-sm">
            <div className="text-[13px] font-medium text-foreground">Rotation R(θ)</div>
            <div className="font-mono font-mono-nums text-[13px] leading-relaxed text-foreground">
              λ = cosθ ± i·sinθ
            </div>
            <p className="text-[13px] leading-relaxed text-foreground-soft">
              Complex, except θ = 0° or 180°.
            </p>
          </div>

          <div className="space-y-2 rounded bg-surface px-4 py-3 shadow-border-sm">
            <div className="text-[13px] font-medium text-foreground">
              Rotation 90° [0 −1; 1 0]
            </div>
            <div className="font-mono font-mono-nums text-[13px] leading-relaxed text-foreground">
              λ = {rot90Info.type === "complex" ? `${fmt(rot90Info.re)} ± ${fmt(rot90Info.im)}i` : "±i"}
              {" "}— no real eigenvectors.
            </div>
            <p className="text-[13px] leading-relaxed text-foreground-soft">
              Why: there is no real direction that points the same way after a 90° turn. Every
              real vector rotates, so the &ldquo;special direction that doesn&rsquo;t turn&rdquo;
              simply doesn&rsquo;t exist here — and the math reflects that by giving imaginary
              eigenvalues instead of real ones.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Live current-matrix readout */}
      <div className="mt-10">
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
          Right now, on the current matrix
        </h2>
        <p className="mt-1 font-mono font-mono-nums text-[13px] text-foreground-soft">
          A = [{fmt(a)} {fmt(b)}; {fmt(c)} {fmt(d)}]
        </p>

        <div className="mt-3 max-w-sm">
          {liveInfo.type === "real" ? (
            <InfoBox
              rows={[
                { label: "λ₁", value: fmt(liveInfo.values[0]) },
                { label: "λ₂", value: fmt(liveInfo.values[1]) },
                { label: "det(A)", value: fmt(liveInfo.det) },
                { label: "trace(A)", value: fmt(liveInfo.trace) },
              ]}
              note="Both eigenvector directions are drawn in green in the visual above."
            />
          ) : (
            <InfoBox
              rows={[
                { label: "λ", value: `${fmt(liveInfo.re)} ± ${fmt(liveInfo.im)}i` },
                { label: "det(A)", value: fmt(liveInfo.det) },
                { label: "trace(A)", value: fmt(liveInfo.trace) },
              ]}
              note="No real eigenvectors — every direction rotates under this matrix."
            />
          )}
        </div>
      </div>

      <PageNav />
    </div>
  );
}
