"use client";

import { useEffect, useRef } from "react";
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
};

// Original | transformed side by side, each tagged with a pill label, connected by a plain
// arrow. Used on /transforms and /playground. See docs/03-design-system.md "Canvas cards".
export default function ImageCompareCanvas({
  matrix,
  size = 220,
  image = null,
  showEigenOverlay = false,
  originalLabel = "Original",
  transformedLabel = "Transformed",
}: ImageCompareCanvasProps) {
  const originalRef = useRef<HTMLCanvasElement>(null);
  const transformedRef = useRef<HTMLCanvasElement>(null);

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

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="space-y-2">
        <span className="inline-block rounded-full bg-origin-soft px-2.5 py-0.5 text-[12px] font-medium text-origin">
          {originalLabel}
        </span>
        <canvas
          ref={originalRef}
          width={size}
          height={size}
          className="block rounded shadow-border"
          role="img"
          aria-label="Original image"
        />
      </div>

      <span aria-hidden className="text-[20px] text-foreground-soft">
        →
      </span>

      <div className="space-y-2">
        <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-medium text-accent">
          {transformedLabel}
        </span>
        <div className="relative" style={{ width: size, height: size }}>
          <canvas
            ref={transformedRef}
            width={size}
            height={size}
            className="block rounded shadow-border"
            role="img"
            aria-label="Transformed image"
          />
          {showEigenOverlay && <EigenOverlay matrix={matrix} size={size} />}
        </div>
      </div>
    </div>
  );
}
