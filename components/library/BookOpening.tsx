"use client";

import { useEffect, useRef, useState } from "react";
import { paperClass, type Subject } from "@/lib/types";

export type BookRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** The page opens while the cover is still finishing its swing. */
const NAVIGATE_AT = 620;
/** How long the fade over the real page takes. */
const FADE_MS = 220;
/** Safety net: never leave the overlay on screen if the view did not switch. */
const BAIL_OUT_AT = 3000;

type BookOpeningProps = {
  subject: Subject;
  from: BookRect;
  /** True once the page is rendered behind the overlay. */
  fading: boolean;
  onNavigate: () => void;
  onRemove: () => void;
};

/** Where the book ends up: cover-shaped, centred, scaled to the screen. */
function landingRect(): BookRect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.round(Math.min(360, Math.max(200, vw * 0.62)));
  const height = Math.round(Math.min(width * 1.3, vh * 0.58));

  return {
    top: Math.round((vh - height) / 2 - vh * 0.02),
    left: Math.round((vw - width) / 2),
    width,
    height,
  };
}

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
    <div
      aria-hidden="true"
      className={`book-open-scene fixed inset-0 z-40 [perspective:1700px] ${
        fading ? "is-fading" : ""
      }`}
    >
      <div className="book-open-veil absolute inset-0 bg-paper-deep" />

      <div
        className="book-fly"
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
      >
        {/* the page block, revealed once the cover swings away */}
        <div
          className={`book-page ${paperClass(subject.paper)} ${
            fading ? "is-fading" : ""
          } absolute inset-0 overflow-hidden rounded-[3px] shadow-[0_30px_70px_-32px_rgba(0,0,0,0.5)]`}
        >
          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/25 to-transparent" />
        </div>

        {/* the cover, hinged on its left edge */}
        <div
          className="book-cover-face absolute inset-0 overflow-hidden rounded-[3px]"
          style={{ backgroundColor: subject.color }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-4 w-px bg-white/20"
          />
          <span
            aria-hidden="true"
            className="absolute inset-y-0 right-6 w-px bg-black/15"
          />

          {/* the title as it sits on the spine... */}
          <span className="book-title-out absolute inset-0 flex items-center justify-center">
            <span className="[writing-mode:vertical-rl] max-h-[78%] overflow-hidden text-[13px] font-medium tracking-wide text-white/95 [text-shadow:0_1px_0_rgba(0,0,0,0.25)]">
              {subject.name}
            </span>
          </span>

          {/* ...and the same title once the book faces us */}
          <span className="book-title-in absolute inset-0 flex items-center justify-center px-6 text-center">
            <span className="font-hand text-3xl leading-tight text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)] sm:text-4xl">
              {subject.name}
            </span>
          </span>

          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10"
          />
        </div>
      </div>
    </div>
  );
}
