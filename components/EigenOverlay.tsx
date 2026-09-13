import { eigenInfo, type Matrix2 } from "@/lib/matrix";

type EigenOverlayProps = {
  matrix: Matrix2;
  size: number;
  // Must match whatever camera (viewScale/pan) the image canvas beneath this overlay was
  // rendered with — see lib/transformImage.ts's transformImageData — or the line drifts out of
  // alignment with the actual invariant direction in the (possibly zoomed/panned) image.
  viewScale?: number;
  pan?: { x: number; y: number };
};

// Draws green line(s) through the canvas center along eigenvector direction(s), length scaled
// by |lambda| (clamped). Renders nothing when eigenvalues are complex — the absence of green
// lines on e.g. a rotation is itself part of the lesson (paired with explanatory text elsewhere).
//
// This overlay sits directly on top of the transformed image canvas (ImageCompareCanvas), which
// is drawn by transformImageData in raw raster coordinates (y increases downward, no flip). The
// line's endpoints must use that same convention or the "invariant direction" it draws stops
// lining up with the actual invariant direction in the image underneath for any eigenvector with
// a non-zero y-component.
export default function EigenOverlay({ matrix, size, viewScale = 1, pan = { x: 0, y: 0 } }: EigenOverlayProps) {
  const info = eigenInfo(matrix.a, matrix.b, matrix.c, matrix.d);
  if (info.type !== "real") return null;

  const cx = size / 2 + pan.x;
  const cy = size / 2 + pan.y;
  const maxLen = size * 0.46 * viewScale;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={size}
      height={size}
      aria-hidden="true"
    >
      {info.vectors.map((v, i) => {
        const lambda = Math.abs(info.values[i]);
        const scaled = Math.max(0.35, Math.min(1.4, lambda)) / 1.4;
        const len = maxLen * scaled;
        const x1 = cx - v[0] * len;
        const y1 = cy - v[1] * len;
        const x2 = cx + v[0] * len;
        const y2 = cy + v[1] * len;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--eigen)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
