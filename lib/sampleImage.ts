// Procedural test image: no external image asset needed, and every viewer sees the same thing.
//
// Design intent (see docs/04-shared-components-and-state.md):
// - faint reference grid so movement/rotation reads clearly
// - four colored quadrants so flips/rotations are visually unambiguous
// - a bold asymmetric "F" centered — asymmetric on both axes, so mirroring is always obvious
// - a small corner marker circle as a single trackable reference point

const QUADRANT_COLORS = ["#E4E9F5", "#F3E5DF", "#E3F0E9", "#F5EFDD"] as const;

export function paintSampleImage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;

  // Base paper background
  ctx.fillStyle = "#F6F5F0";
  ctx.fillRect(0, 0, w, h);

  // Four colored quadrants
  ctx.fillStyle = QUADRANT_COLORS[0];
  ctx.fillRect(0, 0, cx, cy);
  ctx.fillStyle = QUADRANT_COLORS[1];
  ctx.fillRect(cx, 0, w - cx, cy);
  ctx.fillStyle = QUADRANT_COLORS[2];
  ctx.fillRect(0, cy, cx, h - cy);
  ctx.fillStyle = QUADRANT_COLORS[3];
  ctx.fillRect(cx, cy, w - cx, h - cy);

  // Faint reference grid
  ctx.strokeStyle = "rgba(29, 36, 48, 0.08)";
  ctx.lineWidth = 1;
  const step = Math.max(20, Math.round(w / 15));
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }

  // Center crosshair through the axes, so the origin is legible
  ctx.strokeStyle = "rgba(29, 36, 48, 0.25)";
  ctx.beginPath();
  ctx.moveTo(cx + 0.5, 0);
  ctx.lineTo(cx + 0.5, h);
  ctx.moveTo(0, cy + 0.5);
  ctx.lineTo(w, cy + 0.5);
  ctx.stroke();

  // Bold asymmetric "F" centered — asymmetric on both axes, so mirroring is always obvious
  const fSize = Math.round(h * 0.5);
  ctx.fillStyle = "#1D2430";
  ctx.font = `bold ${fSize}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("F", cx, cy + fSize * 0.05);

  // Small corner marker circle as a single trackable reference point
  const markerX = w * 0.78;
  const markerY = h * 0.22;
  ctx.beginPath();
  ctx.arc(markerX, markerY, Math.max(5, w * 0.02), 0, Math.PI * 2);
  ctx.fillStyle = "#A6553B";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
}

export function createSampleImageData(w: number, h: number): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  paintSampleImage(ctx, w, h);
  return ctx.getImageData(0, 0, w, h);
}
