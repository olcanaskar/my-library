import { jsPDF } from "jspdf";
import { formatDay } from "./format";
import { resolveInkColor } from "./ink";
import { runsFromNote } from "./textRuns";
import type { InkStroke, Note, NoteImage, Subject } from "./types";

const PAGE_W = 794;
const PAGE_H = 1123;
const SCALE = 2;
const MARGIN = 64;
const PAPER_W = PAGE_W - MARGIN * 2;
const PAPER_BOTTOM = PAGE_H - MARGIN;
const BODY_SIZE = 14;
const BODY_LINE = 26;
const CONTINUED_TOP = 120;
/** Space kept free at the bottom of a note's first PDF page for its images. */
const IMAGE_RESERVE = 154;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load an imported image."));
    image.src = src;
  });
}

type StyledChar = { char: string; color: string };
type StyledLine = StyledChar[];

function fileName(subjectName: string): string {
  const slug = subjectName
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "notebook"}-notebook.pdf`;
}

function measure(ctx: CanvasRenderingContext2D, chars: StyledChar[]): number {
  return ctx.measureText(chars.map((c) => c.char).join("")).width;
}

function splitWord(
  word: StyledChar[],
  ctx: CanvasRenderingContext2D,
  maxWidth: number,
): StyledLine[] {
  const chunks: StyledLine[] = [];
  let line: StyledChar[] = [];
  let width = 0;

  for (const char of word) {
    const charWidth = ctx.measureText(char.char).width;
    if (line.length > 0 && width + charWidth > maxWidth) {
      chunks.push(line);
      line = [];
      width = 0;
    }
    line.push(char);
    width += charWidth;
  }

  if (line.length > 0) chunks.push(line);
  return chunks;
}

function wrapChars(
  chars: StyledChar[],
  ctx: CanvasRenderingContext2D,
  maxWidth: number,
): StyledLine[] {
  const lines: StyledLine[] = [];
  let line: StyledChar[] = [];
  let lineWidth = 0;
  let word: StyledChar[] = [];
  let wordWidth = 0;
  let spaces: StyledChar[] = [];
  let spaceWidth = 0;

  function flushLine() {
    lines.push(line);
    line = [];
    lineWidth = 0;
  }

  function commitWord() {
    if (word.length === 0) return;

    if (
      line.length > 0 &&
      lineWidth + spaceWidth + wordWidth > maxWidth
    ) {
      flushLine();
    }

    if (line.length > 0 && spaces.length > 0) {
      line.push(...spaces);
      lineWidth += spaceWidth;
    }
    spaces = [];
    spaceWidth = 0;

    if (wordWidth <= maxWidth) {
      if (line.length === 0) {
        line = word.slice();
        lineWidth = wordWidth;
      } else if (lineWidth + wordWidth <= maxWidth) {
        line.push(...word);
        lineWidth += wordWidth;
      } else {
        flushLine();
        line = word.slice();
        lineWidth = wordWidth;
      }
    } else {
      if (line.length > 0) flushLine();
      const chunks = splitWord(word, ctx, maxWidth);
      for (let i = 0; i < chunks.length - 1; i += 1) {
        lines.push(chunks[i]);
      }
      line = chunks[chunks.length - 1] ?? [];
      lineWidth = measure(ctx, line);
    }

    word = [];
    wordWidth = 0;
  }

  for (const char of chars) {
    if (char.char === "\n") {
      commitWord();
      flushLine();
      spaces = [];
      spaceWidth = 0;
      continue;
    }

    if (/^\s$/.test(char.char)) {
      if (word.length > 0) commitWord();
      if (line.length > 0) {
        spaces.push(char);
        spaceWidth += ctx.measureText(char.char).width;
      }
      continue;
    }

    if (line.length > 0 && word.length === 0 && spaces.length === 0) {
      // A word begins after a completed line; no space is needed at the edge.
    }

    word.push(char);
    wordWidth += ctx.measureText(char.char).width;
  }

  commitWord();
  if (line.length > 0 || lines.length === 0) lines.push(line);
  return lines;
}

function styledTitle(text: string): StyledChar[] {
  return Array.from(text, (char) => ({ char, color: "#2c2418" }));
}

function styledBody(note: Note): StyledChar[] {
  const runs = runsFromNote(note);
  if (runs.length === 0) {
    return Array.from("Empty page", (char) => ({
      char,
      color: "#9a8a70",
    }));
  }

  const chars: StyledChar[] = [];
  for (const run of runs) {
    const color = resolveInkColor(run.color, "light");
    for (const char of run.text) chars.push({ char, color });
  }
  return chars;
}

function textFont(note: Note, family: string, size = BODY_SIZE): string {
  const style = note.textStyle;
  return `${style?.italic ? "italic " : ""}${
    style?.bold ? "600 " : ""
  }${size}px ${family}`;
}

function paintInk(
  ctx: CanvasRenderingContext2D,
  strokes: InkStroke[],
  left: number,
  top: number,
  width: number,
  height: number,
) {
  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;

    const color = resolveInkColor(stroke.color, "light");
    const activeBrush =
      stroke.mode === "eraser" ? "pen" : (stroke.brush ?? "pen");

    ctx.save();
    ctx.globalCompositeOperation =
      stroke.mode === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha =
      activeBrush === "marker"
        ? 0.34
        : activeBrush === "pencil"
          ? 0.62
          : activeBrush === "brush"
            ? 0.9
            : 1;
    ctx.lineCap = activeBrush === "marker" ? "butt" : "round";
    ctx.lineJoin = activeBrush === "marker" ? "miter" : "round";

    const lineWidthFor = (pressure: number) => {
      const base = stroke.size * width;
      let value: number;

      if (activeBrush === "marker") {
        value = base * 2.5;
      } else if (activeBrush === "pencil") {
        value = base * (0.4 + pressure * 0.55);
      } else if (activeBrush === "brush") {
        value = base * (0.7 + pressure * 1.2);
      } else {
        value = base * (0.55 + pressure * 0.9);
      }

      return Math.max(0.6, value);
    };

    if (stroke.points.length === 1) {
      const point = stroke.points[0];
      const lineWidth = lineWidthFor(point.p);
      ctx.beginPath();
      ctx.arc(
        left + point.x * width,
        top + point.y * height,
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
        ctx.lineWidth = lineWidthFor(to.p);
        ctx.moveTo(left + from.x * width, top + from.y * height);
        ctx.lineTo(left + to.x * width, top + to.y * height);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

type PagePlan = {
  note: Note;
  lines: StyledLine[];
  first: boolean;
  notePage: number;
  notePages: number;
};

function buildPagePlans(
  subject: Subject,
  notes: Note[],
  ctx: CanvasRenderingContext2D,
  bodyFont: string,
  titleFont: string,
): PagePlan[] {
  const plans: PagePlan[] = [];

  for (const note of notes) {
    ctx.font = `38px ${titleFont}`;
    const titleText = note.title.trim() || "Untitled page";
    const titleLines = wrapChars(
      styledTitle(titleText),
      ctx,
      PAGE_W - MARGIN * 2,
    );
    const titleHeight = Math.max(1, titleLines.length) * 42;
    const metaBaseline = 110 + titleHeight + 12;
    const paperTop = metaBaseline + 24;

    ctx.font = textFont(note, bodyFont);
    const lines = wrapChars(
      styledBody(note),
      ctx,
      PAPER_W - 36,
    );

    const firstTextTop = paperTop + 10;
    const imageReserve =
      (note.images?.length ?? 0) > 0 ? IMAGE_RESERVE : 0;
    const firstCapacity = Math.max(
      1,
      Math.floor(
        (PAPER_BOTTOM - firstTextTop - BODY_SIZE - imageReserve) /
          BODY_LINE,
      ) + 1,
    );
    const continuedTextTop = CONTINUED_TOP + 10;
    const continuedCapacity = Math.max(
      1,
      Math.floor((PAPER_BOTTOM - continuedTextTop - BODY_SIZE) / BODY_LINE) +
        1,
    );

    const chunks: StyledLine[][] = [];
    chunks.push(lines.slice(0, firstCapacity));
    let rest = lines.slice(firstCapacity);
    while (rest.length > 0) {
      chunks.push(rest.slice(0, continuedCapacity));
      rest = rest.slice(continuedCapacity);
    }

    for (let i = 0; i < chunks.length; i += 1) {
      plans.push({
        note,
        lines: chunks[i],
        first: i === 0,
        notePage: i + 1,
        notePages: chunks.length,
      });
    }
  }

  return plans;
}

function drawPaper(
  ctx: CanvasRenderingContext2D,
  subject: Subject,
  top: number,
  capacity: number,
) {
  const height = PAPER_BOTTOM - top;
  const left = MARGIN;
  const right = left + PAPER_W;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(left, top, PAPER_W, height, 3);
  ctx.clip();

  ctx.fillStyle = "#fcf8ec";
  ctx.fillRect(left, top, PAPER_W, height);

  const textLeft = left + 18;
  const textTop = top + 10;

  if (subject.paper === "lined" || subject.paper === "grid") {
    ctx.strokeStyle =
      subject.paper === "grid"
        ? "rgba(44,36,24,0.08)"
        : "rgba(44,36,24,0.09)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= capacity; i += 1) {
      const y = textTop + i * BODY_LINE;
      ctx.beginPath();
      ctx.moveTo(left + 10, y);
      ctx.lineTo(right - 10, y);
      ctx.stroke();
    }

    if (subject.paper === "grid") {
      ctx.strokeStyle = "rgba(44,36,24,0.06)";
      for (let i = 0; i <= Math.ceil((PAPER_W - 36) / BODY_LINE); i += 1) {
        const x = textLeft + i * BODY_LINE;
        ctx.beginPath();
        ctx.moveTo(x, top + 8);
        ctx.lineTo(x, PAPER_BOTTOM - 8);
        ctx.stroke();
      }
    }
  } else if (subject.paper === "dotted") {
    ctx.fillStyle = "rgba(44,36,24,0.15)";
    for (let y = top + 20; y < PAPER_BOTTOM - 10; y += 20) {
      for (let x = left + 20; x < right - 10; x += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();

  ctx.strokeStyle = "rgba(44,36,24,0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(left, top, PAPER_W, height, 3);
  ctx.stroke();
}

function drawTextLines(
  ctx: CanvasRenderingContext2D,
  lines: StyledLine[],
  top: number,
  underline: boolean,
  strike: boolean,
) {
  const left = MARGIN + 18;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const baseline = top + 10 + BODY_SIZE + lineIndex * BODY_LINE;
    let x = left;

    for (const char of line) {
      ctx.fillStyle = char.color;
      ctx.fillText(char.char, x, baseline);
      x += ctx.measureText(char.char).width;
    }

    const width = x - left;
    if ((underline || strike) && width > 0) {
      ctx.save();
      ctx.strokeStyle =
        line.find((char) => char.char.trim().length > 0)?.color ??
        line[0]?.color ??
        "#2c2418";
      ctx.lineWidth = 1;
      if (underline) {
        ctx.beginPath();
        ctx.moveTo(left, baseline + 2);
        ctx.lineTo(left + width, baseline + 2);
        ctx.stroke();
      }
      if (strike) {
        ctx.beginPath();
        ctx.moveTo(left, baseline - BODY_SIZE * 0.32);
        ctx.lineTo(left + width, baseline - BODY_SIZE * 0.32);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

function drawNoteImages(
  ctx: CanvasRenderingContext2D,
  images: NoteImage[],
  loaded: Map<string, HTMLImageElement>,
  top: number,
  height: number,
) {
  if (images.length === 0) return;

  const left = MARGIN + 18;
  const width = PAPER_W - 36;
  const gap = 10;
  const cellWidth = (width - gap * (images.length - 1)) / images.length;

  images.forEach((image, index) => {
    const element = loaded.get(image.src);
    if (!element) return;

    const innerWidth = Math.max(1, cellWidth - 8);
    const innerHeight = Math.max(1, height - 8);
    const scale = Math.min(
      innerWidth / element.naturalWidth,
      innerHeight / element.naturalHeight,
    );
    const drawWidth = Math.max(1, element.naturalWidth * scale);
    const drawHeight = Math.max(1, element.naturalHeight * scale);
    const x = left + index * (cellWidth + gap) + (cellWidth - drawWidth) / 2;
    const y = top + (height - drawHeight) / 2;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(x - 4, y - 4, drawWidth + 8, drawHeight + 8);
    ctx.restore();

    ctx.drawImage(element, x, y, drawWidth, drawHeight);
    ctx.strokeStyle = "rgba(70, 45, 20, 0.2)";
    ctx.lineWidth = 0.6;
    ctx.strokeRect(x - 4, y - 4, drawWidth + 8, drawHeight + 8);
  });
}

function renderPage(
  subject: Subject,
  plan: PagePlan,
  globalPage: number,
  totalPages: number,
  bodyFont: string,
  titleFont: string,
  loadedImages: Map<string, HTMLImageElement>,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_W * SCALE;
  canvas.height = PAGE_H * SCALE;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = "#fbf6e9";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  ctx.textBaseline = "alphabetic";

  const titleText = plan.note.title.trim() || "Untitled page";
  ctx.font = `38px ${titleFont}`;
  const titleLines =
    plan.first && titleText
      ? wrapChars(
          styledTitle(titleText),
          ctx,
          PAGE_W - MARGIN * 2,
        ).map((line) => line.map((char) => char.char).join(""))
      : [];
  const titleHeight = Math.max(1, titleLines.length) * 42;
  const metaBaseline = plan.first ? 110 + titleHeight + 12 : 0;
  const paperTop = plan.first ? metaBaseline + 24 : CONTINUED_TOP;

  ctx.font = `9px ${bodyFont}`;
  ctx.fillStyle = "#8b785c";
  ctx.fillText(subject.name.toUpperCase(), MARGIN, 70);
  ctx.textAlign = "right";
  ctx.fillText(
    plan.first ? "NOTEBOOK" : "CONTINUED",
    PAGE_W - MARGIN,
    70,
  );
  ctx.textAlign = "left";

  ctx.strokeStyle = "#d8c8aa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, 84);
  ctx.lineTo(PAGE_W - MARGIN, 84);
  ctx.stroke();

  if (plan.first) {
    ctx.font = `38px ${titleFont}`;
    ctx.fillStyle = noteTitleColor(plan.note);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, MARGIN, 110 + 34 + index * 42);
    });

    ctx.font = `10px ${bodyFont}`;
    ctx.fillStyle = "#8b785c";
    ctx.fillText(formatDay(plan.note.createdAt), MARGIN, metaBaseline);
    ctx.textAlign = "right";
    ctx.fillText(
      `${subject.name} notebook`,
      PAGE_W - MARGIN,
      metaBaseline,
    );
    ctx.textAlign = "left";
  }

  const capacity = Math.max(
    1,
    Math.floor((PAPER_BOTTOM - (paperTop + 10) - BODY_SIZE) / BODY_LINE) +
      1,
  );
  drawPaper(ctx, subject, paperTop, capacity);

  ctx.font = textFont(plan.note, bodyFont);
  drawTextLines(
    ctx,
    plan.lines,
    paperTop,
    plan.note.textStyle?.underline ?? false,
    plan.note.textStyle?.strike ?? false,
  );

  const hasImages =
    plan.first && (plan.note.images?.length ?? 0) > 0;
  if (hasImages) {
    drawNoteImages(
      ctx,
      plan.note.images ?? [],
      loadedImages,
      PAPER_BOTTOM - IMAGE_RESERVE + 8,
      IMAGE_RESERVE - 18,
    );
  }

  if (plan.first && plan.note.ink && plan.note.ink.length > 0) {
    const ink = document.createElement("canvas");
    ink.width = PAGE_W * SCALE;
    ink.height = PAGE_H * SCALE;
    const inkCtx = ink.getContext("2d");
    if (inkCtx) {
      inkCtx.scale(SCALE, SCALE);
      const inkHeight = hasImages
        ? PAPER_BOTTOM - IMAGE_RESERVE - paperTop
        : PAPER_BOTTOM - paperTop;
      paintInk(
        inkCtx,
        plan.note.ink,
        MARGIN,
        paperTop,
        PAPER_W,
        Math.max(1, inkHeight),
      );
      ctx.drawImage(ink, 0, 0, PAGE_W, PAGE_H);
    }
  }

  ctx.font = `9px ${bodyFont}`;
  ctx.fillStyle = "#9a8a70";
  ctx.fillText(subject.name, MARGIN, PAGE_H - 48);
  ctx.textAlign = "right";
  ctx.fillText(
    `${globalPage + 1} / ${totalPages}`,
    PAGE_W - MARGIN,
    PAGE_H - 48,
  );
  ctx.textAlign = "left";

  return canvas;
}

function noteTitleColor(note: Note): string {
  return note.title.trim() ? "#2c2418" : "#9a8a70";
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

type PdfResult = {
  blob: Blob;
  fileName: string;
};

async function generateNotebookPdf(
  subject: Subject,
  notes: Note[],
): Promise<PdfResult | null> {
  if (typeof window === "undefined" || notes.length === 0) return null;

  const cover = document.createElement("div");
  cover.className = "pdf-export-cover";
  cover.setAttribute("role", "status");
  const card = document.createElement("div");
  card.className = "pdf-export-card";
  const title = document.createElement("p");
  title.textContent = "Preparing PDF…";
  const detail = document.createElement("p");
  detail.textContent = `${subject.name} notebook`;
  card.append(title, detail);
  cover.append(card);

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.body.append(cover);

  try {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 30);
    });

    const titleField = document.querySelector<HTMLInputElement>(
      'input[aria-label="Page title"]',
    );
    const titleFont = titleField
      ? getComputedStyle(titleField).fontFamily
      : '"Caveat", cursive';
    const bodyFont = getComputedStyle(document.body).fontFamily;

    const measureCanvas = document.createElement("canvas");
    const ctx = measureCanvas.getContext("2d");
    if (!ctx) return null;

    const imageSources = new Set<string>();
    for (const note of notes) {
      for (const image of note.images ?? []) imageSources.add(image.src);
    }
    const loadedImages = new Map<string, HTMLImageElement>();
    await Promise.allSettled(
      Array.from(imageSources, async (src) => {
        try {
          loadedImages.set(src, await loadImage(src));
        } catch {
          // A broken import should not stop the rest of the notebook.
        }
      }),
    );

    const plans = buildPagePlans(subject, notes, ctx, bodyFont, titleFont);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (let i = 0; i < plans.length; i += 1) {
      if (i > 0) pdf.addPage();
      const page = renderPage(
        subject,
        plans[i],
        i,
        plans.length,
        bodyFont,
        titleFont,
        loadedImages,
      );
      pdf.addImage(
        page.toDataURL("image/jpeg", 0.94),
        "JPEG",
        0,
        0,
        210,
        297,
        undefined,
        "FAST",
      );

      // Let the loading card repaint between larger pages.
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
      });
    }

    return {
      blob: pdf.output("blob") as Blob,
      fileName: fileName(subject.name),
    };
  } finally {
    cover.remove();
    document.body.style.overflow = previousOverflow;
  }
}

export async function downloadNotebookPdf(
  subject: Subject,
  notes: Note[],
): Promise<void> {
  const result = await generateNotebookPdf(subject, notes);
  if (!result) return;
  saveBlob(result.blob, result.fileName);
}

export type ShareNotebookResult =
  | "shared"
  | "cancelled"
  | "downloaded"
  | null;

/**
 * On phones the PDF is handed to the native share sheet. Desktop browsers
 * that cannot share files get the PDF as a download instead.
 */
export async function shareNotebookPdf(
  subject: Subject,
  notes: Note[],
): Promise<ShareNotebookResult> {
  const result = await generateNotebookPdf(subject, notes);
  if (!result) return null;

  const file = new File([result.blob], result.fileName, {
    type: "application/pdf",
  });

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    const canShare =
      typeof navigator.canShare !== "function" ||
      navigator.canShare({ files: [file] });

    if (canShare) {
      try {
        await navigator.share({
          files: [file],
          title: `${subject.name} notebook`,
          text: `${subject.name} notebook PDF`,
        });
        return "shared";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return "cancelled";
        }
        // A browser may expose share but reject file sharing; fall through
        // to the normal download rather than losing the export.
      }
    }
  }

  saveBlob(result.blob, result.fileName);
  return "downloaded";
}
