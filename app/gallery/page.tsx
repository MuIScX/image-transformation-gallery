"use client";

import { useEffect, useRef } from "react";
import { PRESETS, determinant, eigenInfo, type Matrix2 } from "@/lib/matrix";
import { transformImageData } from "@/lib/transformImage";
import { paintSampleImage } from "@/lib/sampleImage";
import EigenOverlay from "@/components/EigenOverlay";
import PageNav from "@/components/PageNav";

// Static, presentable reference grid — doubles as the "set of original & transformed images
// with analysis" deliverable. Deliberately does NOT read useMatrix(): every card below carries
// its own fixed preset matrix, reused straight from lib/matrix.ts's PRESETS so the numbers can
// never drift from what /transforms and /playground show for the same preset names.
// See docs_extracted/docs/11-page-gallery.md.

const THUMB_SIZE = 120;

type GalleryEntry = {
  name: string;
  matrix: Matrix2;
  caption: string;
};

// Suggested captions, verbatim from the page spec — written once, reused whenever presenting.
const CAPTIONS: Record<string, string> = {
  Identity: "Our reference point — everything else is measured against this.",
  // Spec text says "det(A) = 2.8", written against a different sx/sy than this app's shared
  // Scale preset ({a:2,b:0,c:0,d:1.5}, det=3, matching /transforms' Scale card default). Using
  // the live number here instead of the spec's literal 2.8 so it never contradicts the det badge
  // computed just below on the same card.
  Scale: "Area grows to match det(A) = 3. Both eigenvalues are real and axis-aligned.",
  "Rotate 45°":
    "Area unchanged (det = 1), but eigenvalues are complex — no direction survives unrotated.",
  Shear:
    "Area unchanged (det = 1), shape skewed. Eigenvalue 1 (doubled) — one direction is completely unstretched.",
  "Reflect (y-axis)":
    "Area unchanged, but det = −1 — orientation is flipped. Watch the mirrored F.",
};

// The prototype's GALLERY_PRESETS: Identity (shown as "Original"), Scale, Rotate 45°, Shear,
// Reflect (y-axis) — in that order. Pulled from the shared PRESETS array, not re-typed, so this
// grid can never drift from the canonical numbers.
const DISPLAY_NAMES: Record<string, string> = { Identity: "Original" };
const ENTRY_ORDER = ["Identity", "Scale", "Rotate 45°", "Shear", "Reflect (y-axis)"];

const GALLERY_PRESETS: GalleryEntry[] = ENTRY_ORDER.map((name) => {
  const preset = PRESETS.find((p) => p.name === name);
  if (!preset) throw new Error(`Missing PRESETS entry: ${name}`);
  return {
    name: DISPLAY_NAMES[name] ?? preset.name,
    matrix: preset.matrix,
    caption: CAPTIONS[name],
  };
});

// Round to `decimals` places and trim trailing zeros (2.80 -> "2.8", 1.00 -> "1").
function fmt(n: number, decimals = 2): string {
  return Number(n.toFixed(decimals)).toString();
}

function GalleryCard({ entry }: { entry: GalleryEntry }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { a, b, c, d } = entry.matrix;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = THUMB_SIZE;
    canvas.height = THUMB_SIZE;
    paintSampleImage(ctx, THUMB_SIZE, THUMB_SIZE);
    const src = ctx.getImageData(0, 0, THUMB_SIZE, THUMB_SIZE);
    const dst = transformImageData(src, THUMB_SIZE, THUMB_SIZE, a, b, c, d);
    ctx.putImageData(dst, 0, 0);
  }, [a, b, c, d]);

  // Every value below is computed live from this card's own matrix, never hardcoded.
  const det = determinant(a, b, c, d);
  const info = eigenInfo(a, b, c, d);
  const lambda =
    info.type === "real"
      ? `λ = ${fmt(info.values[0])}, ${fmt(info.values[1])}`
      : `λ = ${fmt(info.re)} ± ${fmt(info.im)}i`;

  return (
    <div className="space-y-3 rounded-lg bg-background p-3 shadow-border">
      <div className="relative mx-auto" style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
        <canvas
          ref={canvasRef}
          width={THUMB_SIZE}
          height={THUMB_SIZE}
          className="block rounded shadow-border-sm"
          role="img"
          aria-label={`${entry.name} transformed sample image`}
        />
        <EigenOverlay matrix={entry.matrix} size={THUMB_SIZE} />
      </div>

      <div className="space-y-1">
        <h2 className="text-[14px] font-semibold tracking-tight text-foreground">{entry.name}</h2>
        <p className="break-words font-mono text-[11px] text-foreground-soft">
          [{fmt(a)} {fmt(b)}; {fmt(c)} {fmt(d)}]
        </p>
        <p
          className={`font-mono font-mono-nums text-[11px] ${
            det < 0 ? "font-semibold text-warn" : "text-foreground"
          }`}
        >
          det = {fmt(det)}
        </p>
        <p className="font-mono font-mono-nums text-[11px] text-foreground-soft">{lambda}</p>
      </div>

      <p className="text-[12px] leading-relaxed text-foreground-soft">{entry.caption}</p>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Gallery</h1>
        <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground-soft">
          A static, presentable reference grid — the set of original and transformed images to
          screenshot or export for a written report. Each card below is fixed to its own preset
          matrix (it does not follow the matrix you set elsewhere in the walkthrough), so this
          page always shows the same five reference transforms side by side.
        </p>
      </div>

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
      >
        {GALLERY_PRESETS.map((entry) => (
          <GalleryCard key={entry.name} entry={entry} />
        ))}
      </div>

      <PageNav />
    </div>
  );
}
