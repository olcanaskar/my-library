"use client";

import { useEffect, useRef } from "react";
import type { Subject } from "@/lib/types";

/** Cover swing is 100 ms of delay + 300 ms of motion; we hand over just before
 *  the very end so the page appears while the cover is still finishing. */
export const BOOK_OPEN_MS = 380;

type BookOpeningProps = {
  subject: Subject;
  onDone: () => void;
};

/**
 * Painted over the shelf while a book opens: the subject's colour fills the
 * screen, then the cover swings open on its left edge and reveals the paper.
 */
export function BookOpening({ subject, onDone }: BookOpeningProps) {
  // Keep the completion callback out of the effect deps so a re-render can
  // never restart (and thus lengthen) the animation.
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const timer = window.setTimeout(() => done.current(), BOOK_OPEN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="book-open-scene pointer-events-none fixed inset-0 z-40 [perspective:1800px]"
    >
      <div className="absolute inset-0 bg-paper-deep" />

      <div
        className="book-cover-face absolute inset-0 flex items-center justify-center overflow-hidden"
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
        <span className="[writing-mode:vertical-rl] max-h-[70%] overflow-hidden font-hand text-4xl leading-none text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.28)] sm:text-5xl">
          {subject.name}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10"
        />
      </div>
    </div>
  );
}
