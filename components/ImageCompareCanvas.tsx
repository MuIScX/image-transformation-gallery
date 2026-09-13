"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { transformImageData } from "@/lib/transformImage";
import { paintSampleImage } from "@/lib/sampleImage";
import EigenOverlay from "@/components/EigenOverlay";
import type { Matrix2 } from "@/lib/matrix";

type ImageCompareCanvasProps = {
  matrix: Matrix2;
  size?: number;
  image?: HTMLImageElement | null;
  showEigenOverlay?: boolean;
  originalLabel?: string;
  transformedLabel?: string;
  // When true, both canvases become drag-to-pan / scroll-to-zoom (a shared zoom+pan, so
  // "the same corner" stays aligned between original and transformed). Off by default so the
  // compact /transforms cards stay simple; /playground turns it on.
  zoomable?: boolean;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.4;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// Original | transformed side by side, each tagged with a pill label, connected by a plain
// arrow. Used on /transforms and /playground. See docs/03-design-system.md "Canvas cards".
export default function ImageCompareCanvas({
  matrix,
  size = 220,
  image = null,
  showEigenOverlay = false,
  originalLabel = "Original",
  transformedLabel = "Transformed",
  zoomable = false,
}: ImageCompareCanvasProps) {
  const originalRef = useRef<HTMLCanvasElement>(null);
  const transformedRef = useRef<HTMLCanvasElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const clampPan = useCallback(
    (p: { x: number; y: number }, z: number) => {
      const maxOffset = (size * (z - 1)) / 2;
      return { x: clamp(p.x, -maxOffset, maxOffset), y: clamp(p.y, -maxOffset, maxOffset) };
    },
    [size]
  );

  // Re-clamp whenever zoom changes (e.g. zooming out via the buttons after panning near an edge).
  useEffect(() => {
    setPan((p) => clampPan(p, zoom));
  }, [zoom, clampPan]);

  useEffect(() => {
    const originalCanvas = originalRef.current;
    const transformedCanvas = transformedRef.current;
    if (!originalCanvas || !transformedCanvas) return;
    const octx = originalCanvas.getContext("2d");
    const tctx = transformedCanvas.getContext("2d");
    if (!octx || !tctx) return;

    originalCanvas.width = size;
    originalCanvas.height = size;
    transformedCanvas.width = size;
    transformedCanvas.height = size;

    if (image) {
      octx.fillStyle = "#F6F5F0";
      octx.fillRect(0, 0, size, size);
      const scale = Math.max(size / image.width, size / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      octx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
    } else {
      paintSampleImage(octx, size, size);
    }

    const src = octx.getImageData(0, 0, size, size);
    const dst = transformImageData(src, size, size, matrix.a, matrix.b, matrix.c, matrix.d);
    tctx.putImageData(dst, 0, 0);
  }, [matrix.a, matrix.b, matrix.c, matrix.d, size, image]);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!zoomable) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!zoomable || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan(clampPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy }, zoom));
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleWheel(e: WheelEvent<HTMLDivElement>) {
    if (!zoomable) return;
    e.preventDefault();
    setZoom((z) => clamp(z * (1 - e.deltaY * 0.0015), MIN_ZOOM, MAX_ZOOM));
  }

  function zoomIn() {
    setZoom((z) => clamp(z * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }

  function zoomOut() {
    setZoom((z) => clamp(z / ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  const viewTransform = zoomable
    ? { transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center" }
    : undefined;

  return (
    <div className="space-y-3">
      {zoomable && (
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-foreground-soft">
          <span>Drag to pan, scroll to zoom</span>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              className="h-7 w-7 rounded-full bg-surface text-foreground shadow-border-sm transition hover:shadow-border disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            >
              −
            </button>
            <span className="w-10 text-center font-mono font-mono-nums text-[12px]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className="h-7 w-7 rounded-full bg-surface text-foreground shadow-border-sm transition hover:shadow-border disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            >
              +
            </button>
            <button
              type="button"
              onClick={resetView}
              disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
              className="ml-1 rounded-full bg-surface px-3 py-1 text-[12px] text-foreground shadow-border-sm transition hover:shadow-border disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            >
              Reset view
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-origin-soft px-2.5 py-0.5 text-[12px] font-medium text-origin">
            {originalLabel}
          </span>
          <div
            className={`relative overflow-hidden rounded shadow-border ${zoomable ? "touch-none select-none active:cursor-grabbing" : ""}`}
            style={{ width: size, height: size, cursor: zoomable ? "grab" : undefined }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            <div style={{ width: size, height: size, ...viewTransform }}>
              <canvas
                ref={originalRef}
                width={size}
                height={size}
                className="block"
                role="img"
                aria-label="Original image"
              />
            </div>
          </div>
        </div>

        <span aria-hidden className="text-[20px] text-foreground-soft">
          →
        </span>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-medium text-accent">
            {transformedLabel}
          </span>
          <div
            className={`relative overflow-hidden rounded shadow-border ${zoomable ? "touch-none select-none active:cursor-grabbing" : ""}`}
            style={{ width: size, height: size, cursor: zoomable ? "grab" : undefined }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            <div className="relative" style={{ width: size, height: size, ...viewTransform }}>
              <canvas
                ref={transformedRef}
                width={size}
                height={size}
                className="block"
                role="img"
                aria-label="Transformed image"
              />
              {showEigenOverlay && <EigenOverlay matrix={matrix} size={size} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
