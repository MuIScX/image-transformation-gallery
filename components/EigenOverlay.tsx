import { eigenInfo, type Matrix2 } from "@/lib/matrix";

type EigenOverlayProps = {
  matrix: Matrix2;
  size: number;
};

// Draws green line(s) through the canvas center along eigenvector direction(s), length scaled
// by |lambda| (clamped). Renders nothing when eigenvalues are complex — the absence of green
// lines on e.g. a rotation is itself part of the lesson (paired with explanatory text elsewhere).
export default function EigenOverlay({ matrix, size }: EigenOverlayProps) {
  const info = eigenInfo(matrix.a, matrix.b, matrix.c, matrix.d);
  if (info.type !== "real") return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxLen = size * 0.46;

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
        const y1 = cy + v[1] * len;
        const x2 = cx + v[0] * len;
        const y2 = cy - v[1] * len;
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
