// Pure math functions for the 2x2 transformation matrix.
// Ported directly from the validated HTML prototype (see docs/04-shared-components-and-state.md).

export type Matrix2 = { a: number; b: number; c: number; d: number };
export type Point2 = { x: number; y: number };

export function applyMatrix(a: number, b: number, c: number, d: number, x: number, y: number): Point2 {
  return { x: a * x + b * y, y: c * x + d * y };
}

export function determinant(a: number, b: number, c: number, d: number): number {
  return a * d - b * c;
}

export function trace(a: number, b: number, c: number, d: number): number {
  return a + d;
}

export type EigenInfo =
  | {
      type: "real";
      values: [number, number];
      vectors: [[number, number], [number, number]];
      det: number;
      trace: number;
    }
  | {
      type: "complex";
      re: number;
      im: number;
      det: number;
      trace: number;
    };

export function eigenInfo(a: number, b: number, c: number, d: number): EigenInfo {
  const tr = a + d;
  const det = a * d - b * c;

  if (Math.abs(b) < 1e-9 && Math.abs(c) < 1e-9) {
    return { type: "real", values: [a, d], vectors: [[1, 0], [0, 1]], det, trace: tr };
  }

  const disc = tr * tr - 4 * det;

  if (disc >= 0) {
    const sq = Math.sqrt(disc);
    const l1 = (tr + sq) / 2;
    const l2 = (tr - sq) / 2;
    const vecFor = (l: number) => normalize(Math.abs(b) > 1e-9 ? [b, l - a] : [l - d, c]);
    return { type: "real", values: [l1, l2], vectors: [vecFor(l1), vecFor(l2)], det, trace: tr };
  }

  const sq = Math.sqrt(-disc);
  return { type: "complex", re: tr / 2, im: sq / 2, det, trace: tr };
}

export const PRESETS: { name: string; matrix: Matrix2 }[] = [
  { name: "Identity", matrix: { a: 1, b: 0, c: 0, d: 1 } },
  { name: "Scale", matrix: { a: 2, b: 0, c: 0, d: 1.5 } },
  { name: "Rotate 45°", matrix: { a: 0.707, b: -0.707, c: 0.707, d: 0.707 } },
  { name: "Shear", matrix: { a: 1, b: 0.6, c: 0, d: 1 } },
  { name: "Reflect (y-axis)", matrix: { a: -1, b: 0, c: 0, d: 1 } },
  { name: "Reflect (x-axis)", matrix: { a: 1, b: 0, c: 0, d: -1 } },
  { name: "Singular", matrix: { a: 1, b: 0, c: 0, d: 0 } },
];

function normalize(v: [number, number]): [number, number] {
  const len = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / len, v[1] / len];
}
