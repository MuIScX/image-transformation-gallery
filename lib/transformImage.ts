// Inverse-mapping + bilinear interpolation image transform.
// Ported directly from the validated HTML prototype (see docs/04-shared-components-and-state.md).
//
// Core idea: for every output pixel, compute where it came from via A^-1, then bilinearly
// blend the four nearest source pixels. Never forward-map (source -> output) — that leaves gaps.

export function transformImageData(
  src: ImageData,
  w: number,
  h: number,
  a: number,
  b: number,
  c: number,
  d: number
): ImageData {
  const dst = new ImageData(w, h);
  const det = a * d - b * c;
  const cx = w / 2;
  const cy = h / 2;
  const singular = Math.abs(det) < 1e-6;
  const ia = singular ? 0 : d / det;
  const ib = singular ? 0 : -b / det;
  const ic = singular ? 0 : -c / det;
  const id = singular ? 0 : a / det;
  const bg = [246, 245, 240, 255];

  for (let py = 0; py < h; py++) {
    const oy = py - cy;
    for (let px = 0; px < w; px++) {
      const ox = px - cx;
      let sx = -9999;
      let sy = -9999;
      if (!singular) {
        sx = ia * ox + ib * oy + cx;
        sy = ic * ox + id * oy + cy;
      }
      const idx = (py * w + px) * 4;
      if (sx >= 0 && sx < w - 1 && sy >= 0 && sy < h - 1) {
        const x0 = Math.floor(sx);
        const y0 = Math.floor(sy);
        const fx = sx - x0;
        const fy = sy - y0;
        for (let ch = 0; ch < 4; ch++) {
          const c00 = src.data[(y0 * w + x0) * 4 + ch];
          const c10 = src.data[(y0 * w + x0 + 1) * 4 + ch];
          const c01 = src.data[((y0 + 1) * w + x0) * 4 + ch];
          const c11 = src.data[((y0 + 1) * w + x0 + 1) * 4 + ch];
          const top = c00 * (1 - fx) + c10 * fx;
          const bot = c01 * (1 - fx) + c11 * fx;
          dst.data[idx + ch] = top * (1 - fy) + bot * fy;
        }
      } else {
        dst.data[idx] = bg[0];
        dst.data[idx + 1] = bg[1];
        dst.data[idx + 2] = bg[2];
        dst.data[idx + 3] = bg[3];
      }
    }
  }
  return dst;
}
