"use client";

import { pagesLabel } from "@/lib/format";
import type { Subject } from "@/lib/types";
import type { BookRect } from "./BookOpening";

type BookSpineProps = {
  subject: Subject;
  noteCount: number;
  /** True while this book is flying out of the shelf. */
  lifted?: boolean;
  onOpen: (from: BookRect) => void;
};

export function BookSpine({
  subject,
  noteCount,
  lifted = false,
  onOpen,
}: BookSpineProps) {
  // Spine width grows with the page count: the shelf's nicest feedback loop.
  const width = 54 + Math.min(noteCount, 8) * 4;

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
      className={`group relative flex h-48 shrink-0 items-center justify-center overflow-hidden rounded-t-[3px] shadow-[inset_-3px_0_0_rgba(0,0,0,0.18),inset_2px_0_0_rgba(255,255,255,0.14),0_8px_12px_-8px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out hover:-translate-y-2 active:-translate-y-1 hover:shadow-[inset_-3px_0_0_rgba(0,0,0,0.18),inset_2px_0_0_rgba(255,255,255,0.14),0_18px_22px_-12px_rgba(0,0,0,0.55)] focus-visible:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:h-56 ${
        lifted ? "pointer-events-none opacity-0" : ""
      }`}
      style={{ width, backgroundColor: subject.color }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-1.5 top-3 h-px bg-white/25"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-1.5 bottom-9 h-px bg-black/15"
      />
      <span className="[writing-mode:vertical-rl] max-h-[80%] overflow-hidden text-[13px] font-medium tracking-wide text-white/95 [text-shadow:0_1px_0_rgba(0,0,0,0.25)]">
        {subject.name}
      </span>
      <span className="absolute right-1 bottom-1.5 rounded-sm bg-black/25 px-1 text-[10px] leading-4 text-white/85">
        {noteCount}
      </span>
    </button>
  );
}
