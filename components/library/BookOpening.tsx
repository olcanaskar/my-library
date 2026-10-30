"use client";

import { useEffect, useRef, useState } from "react";
import type { Subject } from "@/lib/types";
import { BookVisual, landingRect, type BookPagePreview, type BookRect } from "./BookVisual";

export type { BookPagePreview, BookRect } from "./BookVisual";

/** The page opens while the cover is still finishing its swing. */
const NAVIGATE_AT = 620;
/** How long the fade over the real page takes. */
const FADE_MS = 520;
/** Safety net: never leave the overlay on screen if the view did not switch. */
const BAIL_OUT_AT = 3000;

type BookOpeningProps = {
  subject: Subject;
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
  from,
  preview,
  fading,
  onNavigate,
  onRemove,
}: BookOpeningProps) {
  const [to] = useState<BookRect>(landingRect);

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
    const timer = window.setTimeout(() => remove.current(), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [fading]);

  return (
    <BookVisual
      subject={subject}
      preview={preview}
      sceneClass={`book-open-scene ${fading ? "is-fading" : ""}`}
      veilClass="book-open-veil"
      modelClass={fading ? "is-fading" : ""}
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
