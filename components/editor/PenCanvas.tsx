"use client";

import { useEffect, useRef } from "react";
import { resolveInkColor } from "@/lib/ink";
import type {
  InkColor,
  InkPoint,
  InkStroke,
  Theme,
} from "@/lib/types";

type PenCanvasProps = {
  ink: InkStroke[];
  active: boolean;
  color: InkColor;
  size: number;
  eraser: boolean;
  theme: Theme;
  onCommit: (ink: InkStroke[]) => void;
};

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function pointFrom(
  event: { clientX: number; clientY: number; pressure: number },
  rect: DOMRect,
): InkPoint {
  return {
    x: clamp((event.clientX - rect.left) / rect.width),
    y: clamp((event.clientY - rect.top) / rect.height),
    p: event.pressure > 0 ? event.pressure : 0.5,
  };
}

/**
 * A transparent ink layer that sits over the note paper. Strokes are stored
 * in page-normalised coordinates, so they survive resizes and page turns.
 */
export function PenCanvas({
  ink,
  active,
  color,
  size,
  eraser,
  theme,
  onCommit,
}: PenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef(ink);
  const themeRef = useRef(theme);
  const currentRef = useRef<InkStroke | null>(null);
  const pointerRef = useRef<number | null>(null);
  const pointerTypeRef = useRef<string | null>(null);

  function drawStroke(
    ctx: CanvasRenderingContext2D,
    stroke: InkStroke,
    width: number,
    height: number,
  ) {
    const points = stroke.points;
    if (points.length === 0) return;

    const strokeColor = resolveInkColor(stroke.color, themeRef.current);

    ctx.save();
    ctx.globalCompositeOperation =
      stroke.mode === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (points.length === 1) {
      const point = points[0];
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
      for (let i = 1; i < points.length; i++) {
        const from = points[i - 1];
        const to = points[i];
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

  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Layout size, not the projected rect: a scaled copy of the page (book
    // opening, page turn) must keep a crisp bitmap at its real resolution.
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(cssWidth * ratio));
    const height = Math.max(1, Math.round(cssHeight * ratio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    for (const stroke of inkRef.current) {
      drawStroke(ctx, stroke, cssWidth, cssHeight);
    }
    if (currentRef.current) {
      drawStroke(ctx, currentRef.current, cssWidth, cssHeight);
    }
  }

  useEffect(() => {
    inkRef.current = ink;
    themeRef.current = theme;
    render();
    // Render whenever the committed ink or the theme changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ink, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => render());
    observer.observe(canvas);
    render();

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    // Palm rejection: while the pencil draws, fingers and palms are ignored.
    if (event.pointerType === "touch" && pointerTypeRef.current === "pen") {
      return;
    }

    // A palm landed first: drop its stroke when the pencil takes over.
    if (event.pointerType === "pen" && pointerTypeRef.current === "touch") {
      currentRef.current = null;
      pointerRef.current = null;
      pointerTypeRef.current = null;
    }

    // Only one pointer draws at a time (two fingers, palm plus pencil).
    if (pointerRef.current !== null) return;

    event.preventDefault();
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers cannot be captured; drawing still works.
    }
    pointerRef.current = event.pointerId;
    pointerTypeRef.current = event.pointerType;

    const rect = canvas.getBoundingClientRect();
    currentRef.current = {
      color: eraser ? "ink" : color,
      size: eraser ? 0.03 : size,
      mode: eraser ? "eraser" : "pen",
      points: [pointFrom(event, rect)],
    };
    render();
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!active || pointerRef.current !== event.pointerId) return;
    const canvas = canvasRef.current;
    const stroke = currentRef.current;
    if (!canvas || !stroke) return;

    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const native = event.nativeEvent;
    const events =
      typeof native.getCoalescedEvents === "function"
        ? native.getCoalescedEvents()
        : [native];

    for (const coalesced of events) {
      stroke.points.push(pointFrom(coalesced, rect));
    }
    render();
  }

  function finishStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    pointerTypeRef.current = null;

    const stroke = currentRef.current;
    currentRef.current = null;
    if (!stroke) return;

    if (stroke.points.length > 0) {
      const next = [...inkRef.current, stroke];
      inkRef.current = next;
      onCommit(next);
    }
    render();
  }

  return (
    <canvas
      ref={canvasRef}
      className={`pen-canvas ${active ? "is-active" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishStroke}
      onPointerCancel={finishStroke}
      aria-label="Handwriting canvas"
    />
  );
}
