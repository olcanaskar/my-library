"use client";

import { useEffect, useRef, useState } from "react";
import type { Subject, Theme } from "@/lib/types";
import {
  BookVisual,
  editorPageWidthEstimate,
  editorShellWidthEstimate,
  landingRect,
  type BookPagePreview,
  type BookRect,
} from "./BookVisual";

export type { BookPagePreview, BookRect } from "./BookVisual";

/** The existing flight and cover swing finish before the page starts to zoom. */
const NAVIGATE_AT = 700;
/** How long the opened page takes to grow to the editor's page size. */
const ZOOM_MS = 650;
/** Let the matched page rest for a beat before the hand-off. */
const HOLD_MS = 240;
/** Quick hand-off once the zoomed page fills the editor area. */
const FADE_MS = 220;
/** Safety net: never leave the overlay on screen if the view did not switch. */
const BAIL_OUT_AT = 3000;

type BookOpeningProps = {
  subject: Subject;
  theme: Theme;
  from: BookRect;
  preview: BookPagePreview | null;
  /** True once the page is rendered behind the overlay. */
  fading: boolean;
  onNavigate: () => void;
  onRemove: () => void;
};

/**
 * The book leaves its slot on the shelf and comes forward: it lifts, grows to
 * cover size in the middle of the screen, then the cover swings open on its
 * left edge and reveals the page underneath.
 *
 * It lives above both views, so it can fade out over the page it opened. The
 * fade waits for `fading` (the page is really on screen), which is why the
 * shelf never flashes back into view during the hand-off.
 */
export function BookOpening({
  subject,
  theme,
  from,
  preview,
  fading,
  onNavigate,
  onRemove,
}: BookOpeningProps) {
  const [to] = useState<BookRect>(landingRect);
  const [previewScale, setPreviewScale] = useState(
    () => to.width / editorShellWidthEstimate(),
  );
  const [pageWidth, setPageWidth] = useState(editorPageWidthEstimate);
  const [zoom, setZoom] = useState<{
    transform: string;
    origin: string;
  } | null>(null);
  const [fadingOut, setFadingOut] = useState(false);

  // Fresh callbacks without restarting the timers.
  const navigate = useRef(onNavigate);
  const remove = useRef(onRemove);

  useEffect(() => {
    navigate.current = onNavigate;
    remove.current = onRemove;
  }, [onNavigate, onRemove]);

  useEffect(() => {
    const navTimer = window.setTimeout(() => navigate.current(), NAVIGATE_AT);
    const bailOut = window.setTimeout(() => remove.current(), BAIL_OUT_AT);

    return () => {
      window.clearTimeout(navTimer);
      window.clearTimeout(bailOut);
    };
  }, []);

  useEffect(() => {
    if (!fading) return;

    let cancelled = false;
    let zoomTimer = 0;

    const startZoom = () => {
      if (cancelled) return;

      const editorShell = document.querySelector<HTMLElement>(
        ".desk .book-shell",
      );

      if (!editorShell) {
        setFadingOut(true);
        return;
      }

      const editorRect = editorShell.getBoundingClientRect();
      const editorPage = document.querySelector<HTMLElement>(
        ".desk .book-page-stack > .book-page",
      );
      if (to.width === 0 || to.height === 0) {
        setFadingOut(true);
        return;
      }

      // Uniform scale so the type keeps its shape. The whole opened book
      // becomes exactly as wide as the editor shell; the extra height runs
      // off the bottom of the viewport.
      const scale = editorRect.width / to.width;
      const dx =
        editorRect.left +
        editorRect.width / 2 -
        (to.left + to.width / 2);
      const dy = editorRect.top - to.top;

      setPreviewScale(to.width / editorRect.width);
      if (editorPage && editorPage.clientWidth > 0) {
        setPageWidth(editorPage.clientWidth);
      }
      setZoom({
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
        origin: "50% 0%",
      });

      zoomTimer = window.setTimeout(
        () => setFadingOut(true),
        ZOOM_MS + HOLD_MS,
      );
    };

    const frame = window.requestAnimationFrame(startZoom);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      if (zoomTimer) window.clearTimeout(zoomTimer);
    };
  }, [fading, to]);

  useEffect(() => {
    if (!fadingOut) return;
    const timer = window.setTimeout(() => remove.current(), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [fadingOut]);

  return (
    <BookVisual
      subject={subject}
      theme={theme}
      preview={preview}
      previewScale={previewScale}
      pageWidth={pageWidth}
      sceneClass={`book-open-scene ${zoom ? "is-zooming" : ""} ${
        fadingOut ? "is-fading" : ""
      }`}
      veilClass="book-open-veil"
      zoomTransform={zoom?.transform}
      zoomOrigin={zoom?.origin}
      style={
        {
          "--from-top": `${from.top}px`,
          "--from-left": `${from.left}px`,
          "--from-w": `${from.width}px`,
          "--from-h": `${from.height}px`,
          "--to-top": `${to.top}px`,
          "--to-left": `${to.left}px`,
          "--to-w": `${to.width}px`,
          "--to-h": `${to.height}px`,
        } as React.CSSProperties
      }
    />
  );
}
