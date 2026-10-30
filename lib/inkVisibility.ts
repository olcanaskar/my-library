import type { InkStroke } from "./types";

/**
 * True when the strokes still leave something visible on the page. Eraser
 * strokes are composited with destination-out exactly like the canvas, so a
 * page whose ink was fully erased counts as empty.
 */
export function hasVisibleInk(strokes: InkStroke[]): boolean {
  if (strokes.length === 0) return false;

  if (typeof document === "undefined") {
    return strokes.some(
      (stroke) => stroke.mode === "pen" && stroke.points.length > 0,
    );
  }

  const width = 160;
  const height = 220;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  ctx.clearRect(0, 0, width, height);

  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;

    ctx.save();
    ctx.globalCompositeOperation =
      stroke.mode === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.points.length === 1) {
      const point = stroke.points[0];
      const lineWidth = stroke.size * width * (0.55 + point.p * 0.9);
      ctx.beginPath();
      ctx.arc(
        point.x * width,
        point.y * height,
        Math.max(0.5, lineWidth / 2),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    } else {
      for (let i = 1; i < stroke.points.length; i += 1) {
        const from = stroke.points[i - 1];
        const to = stroke.points[i];
        ctx.beginPath();
        ctx.lineWidth = Math.max(
          0.6,
          stroke.size * width * (0.55 + to.p * 0.9),
        );
        ctx.moveTo(from.x * width, from.y * height);
        ctx.lineTo(to.x * width, to.y * height);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  const data = ctx.getImageData(0, 0, width, height).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 8) return true;
  }
  return false;
}
