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
  d: number,
  // Optional output-side camera: viewScale zooms (values <1 fit MORE of the transformed scene
  // into the same w x h canvas — values >1 zoom in), panX/panY shift which part is visible, both
  // in output-pixel units. Defaults reproduce the original 1:1, uncentered-camera behavior
  // exactly, so every existing caller is unaffected. See ImageCompareCanvas's "zoomable" mode —
  // this is what actually reveals a sheared/scaled image's parts that fall outside the plain
  // w x h canvas, unlike a cosmetic CSS scale which can only shrink what's already rendered.
  viewScale = 1,
  panX = 0,
  panY = 0
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
    const oy = (py - cy - panY) / viewScale;
    for (let px = 0; px < w; px++) {
      const ox = (px - cx - panX) / viewScale;
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
