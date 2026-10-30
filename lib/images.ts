import { newId } from "./id";
import type { NoteImage } from "./types";

/** Enough for a page of notes without filling localStorage. */
export const MAX_IMAGES_PER_NOTE = 6;

const MAX_EDGE = 1400;
const MIN_EDGE = 480;
const MAX_DATA_URL = 240_000;
const QUALITIES = [0.82, 0.72, 0.62];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read this image."));
    image.src = src;
  });
}

function encode(
  image: HTMLImageElement,
  maxEdge: number,
  quality: number,
): { src: string; width: number; height: number } {
  const scale = Math.min(
    1,
    maxEdge / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare this image.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, width, height);

  let src = canvas.toDataURL("image/webp", quality);
  if (!src.startsWith("data:image/webp")) {
    // Older browsers may ignore WebP encoding; JPEG is the reliable fallback.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    src = canvas.toDataURL("image/jpeg", quality);
  }

  return { src, width, height };
}

/**
 * Resize and compress a camera photo or pasted diagram before it reaches
 * localStorage. The original file stays on the device; only this small copy
 * is saved with the note.
 */
export async function imageFileToNoteImage(file: File): Promise<NoteImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file is not an image.");
  }
  if (file.size > 25_000_000) {
    throw new Error("That image is too large to import.");
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    let maxEdge = MAX_EDGE;
    let last: { src: string; width: number; height: number } | null = null;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      for (const quality of QUALITIES) {
        last = encode(image, maxEdge, quality);
        if (last.src.length <= MAX_DATA_URL) {
          return { ...last, id: newId(), name: file.name };
        }
      }
      maxEdge = Math.max(MIN_EDGE, Math.round(maxEdge * 0.78));
    }

    throw new Error(
      last
        ? "This image could not be shrunk enough to save."
        : "Could not read this image.",
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
