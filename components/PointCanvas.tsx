"use client";

import { useEffect, useRef } from "react";

export type PlottedPoint = {
  x: number;
  y: number;
  color: string;
  label?: string;
  // When set, this point animates from `animateFrom` to (x, y) instead of sitting statically at
  // its final position — used for the "transformed" point on /point step 6, so it visibly travels
  // rather than appearing pre-arrived while the arrow is still catching up to it.
  animateFrom?: { x: number; y: number };
};
export type PlottedArrow = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  dashed?: boolean;
  animate?: boolean;
};

type PointCanvasProps = {
  size?: number;
  range?: number;
  points?: PlottedPoint[];
  arrows?: PlottedArrow[];
};

// Canvas 2D's fillStyle/strokeStyle does NOT resolve CSS var(...) the way SVG presentation
// attributes do — passing "var(--origin)" straight through silently draws nothing/black.
// Resolve any var(--token) reference against the root element's computed style first.
function resolveCanvasColor(color: string): string {
  const match = color.match(/^var\((--[\w-]+)\)$/);
  if (!match) return color;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return resolved || color;
}

// Mini coordinate-grid canvas used on /point. Plots points/arrows in math coordinates
// (y-up, origin at center) against a pixel canvas (y-down, origin at corner).
export default function PointCanvas({ size = 280, range = 160, points = [], arrows = [] }: PointCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

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
    // Standard math y-up convention: this is a self-contained abstract diagram (no real image
    // composited underneath it, unlike EigenOverlay), so points/arrows plot the way a textbook
    // coordinate-grid diagram would, not flipped to match raster/image coordinates.
    const toPx = (x: number, y: number) => ({ px: cx + x * scale, py: cy - y * scale });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasAnimation = arrows.some((ar) => ar.animate) || points.some((pt) => pt.animateFrom);

    function drawStatic(ctx: CanvasRenderingContext2D, progress: number) {
      ctx.clearRect(0, 0, size, size);

      // grid
      ctx.strokeStyle = "rgba(29, 36, 48, 0.08)";
      ctx.lineWidth = 1;
      const step = range / 8;
      for (let v = -range; v <= range; v += step) {
        const { px } = toPx(v, 0);
        ctx.beginPath();
        ctx.moveTo(px + 0.5, 0);
        ctx.lineTo(px + 0.5, size);
        ctx.stroke();
        const { py } = toPx(0, v);
        ctx.beginPath();
        ctx.moveTo(0, py + 0.5);
        ctx.lineTo(size, py + 0.5);
        ctx.stroke();
      }

      // axes
      ctx.strokeStyle = "rgba(29, 36, 48, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 0.5, 0);
      ctx.lineTo(cx + 0.5, size);
      ctx.moveTo(0, cy + 0.5);
      ctx.lineTo(size, cy + 0.5);
      ctx.stroke();

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

      for (const arrow of arrows) {
        const from = toPx(arrow.from.x, arrow.from.y);
        let target = arrow.to;
        if (arrow.animate && !reduceMotion) {
          target = {
            x: arrow.from.x + (arrow.to.x - arrow.from.x) * progress,
            y: arrow.from.y + (arrow.to.y - arrow.from.y) * progress,
          };
        }
        const to = toPx(target.x, target.y);
        const arrowColor = resolveCanvasColor(arrow.color);
        ctx.strokeStyle = arrowColor;
        ctx.lineWidth = 2;
        if (arrow.dashed) ctx.setLineDash([5, 4]);
        else ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(from.px, from.py);
        ctx.lineTo(to.px, to.py);
        ctx.stroke();
        ctx.setLineDash([]);
        const angle = Math.atan2(to.py - from.py, to.px - from.px);
        drawArrowhead(to.px, to.py, angle, arrowColor);
      }

      for (const pt of points) {
        let plotX = pt.x;
        let plotY = pt.y;
        if (pt.animateFrom && !reduceMotion) {
          plotX = pt.animateFrom.x + (pt.x - pt.animateFrom.x) * progress;
          plotY = pt.animateFrom.y + (pt.y - pt.animateFrom.y) * progress;
        }
        const { px, py } = toPx(plotX, plotY);
        const ptColor = resolveCanvasColor(pt.color);
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = ptColor;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        if (pt.label) {
          ctx.font = "12px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
          ctx.fillStyle = ptColor;
          ctx.textBaseline = "bottom";
          ctx.fillText(pt.label, px + 8, py - 4);
        }
      }
    }

    if (hasAnimation && !reduceMotion) {
      const duration = 350;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const elapsed = ts - start;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        drawStatic(ctx, eased);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    } else {
      drawStatic(ctx, 1);
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, range, JSON.stringify(points), JSON.stringify(arrows)]);

  return <canvas ref={canvasRef} className="rounded bg-background shadow-border" role="img" aria-label="Coordinate grid showing plotted point(s)" />;
}
