"use client";

import { pagesLabel } from "@/lib/format";
import type { Subject } from "@/lib/types";
import type { BookRect } from "./BookOpening";

/** Slight height differences so the shelf reads as real books, not bars. */
const STAGGER = [0, 16, 6, 13, 3, 18];
/** A gentle lean, as if the row settled against the left side. */
const TILT = [-1.8, -1.4, -1.7, -1.2, -1.6, -1];

type BookSpineProps = {
  subject: Subject;
  noteCount: number;
  /** Position on the shelf; drives the cosmetic height stagger. */
  index: number;
  /** True while this book is flying out of the shelf. */
  lifted?: boolean;
  onOpen: (from: BookRect) => void;
};

export function BookSpine({
  subject,
  noteCount,
  index,
  lifted = false,
  onOpen,
}: BookSpineProps) {
  // Spine width grows with the page count: the shelf's nicest feedback loop.
  const width = `calc(clamp(54px, 7.4vw, 68px) + ${
    Math.min(noteCount, 8) * 1.5
  }px)`;
  const height = `calc(var(--spine-base) - ${
    STAGGER[index % STAGGER.length]
  }px)`;

  // Long subject names step down a little so they still read as one line.
  const nameLength = subject.name.length;
  const labelSize = nameLength > 18 ? 7.5 : nameLength > 13 ? 8.5 : 10;

  return (
    <button
      type="button"
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        onOpen({
          top: Math.round(box.top),
          left: Math.round(box.left),
          width: Math.round(box.width),
          height: Math.round(box.height),
        });
      }}
      aria-label={`${subject.name} notebook, ${pagesLabel(noteCount)}`}
      className={`book-spine ${lifted ? "pointer-events-none opacity-0" : ""}`}
      style={
        {
          width,
          height,
          // Dust the stored colour down towards the wood so the shelf feels aged.
          "--spine-color": `color-mix(in oklab, ${subject.color} 76%, #6b4e30)`,
          "--tilt": `${TILT[index % TILT.length]}deg`,
        } as React.CSSProperties
      }
    >
      <span aria-hidden="true" className="book-spine-band" />
      <span className="book-spine-label" style={{ fontSize: labelSize }}>
        {subject.name}
      </span>
      <span aria-hidden="true" className="book-spine-foot">
        {noteCount}
      </span>
    </button>
  );
}
