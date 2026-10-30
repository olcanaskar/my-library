"use client";

import { formatDay } from "@/lib/format";
import { resolveInkColor } from "@/lib/ink";
import { runsFromNote, runsToText } from "@/lib/textRuns";
import { paperClass, type Note, type Subject, type Theme } from "@/lib/types";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import type { AnimationEventHandler, CSSProperties } from "react";
import { NoteImages } from "./NoteImages";
import { PenCanvas } from "./PenCanvas";

type PageFaceProps = {
  subject: Subject;
  note: Note;
  theme: Theme;
  pageNo: number;
  totalPages: number;
  className?: string;
  onAnimationEnd?: AnimationEventHandler<HTMLDivElement>;
};

/**
 * A read-only copy of a notebook page. It is the same sheet the editor shows,
 * used as the moving leaf while a page turns so the old page keeps its ink and
 * coloured text for the whole flip.
 */
export function PageFace({
  subject,
  note,
  theme,
  pageNo,
  totalPages,
  className = "",
  onAnimationEnd,
}: PageFaceProps) {
  const runs = runsFromNote(note);
  const text = runsToText(runs);
  const empty = text.length === 0;
  // A textarea keeps a final empty line after a trailing newline; a plain
  // block would swallow it, leaving the page one line shorter than the editor.
  const trailingBreak = text.endsWith("\n");
  const margin = subject.paper === "lined" || subject.paper === "grid";
  const hasPrev = pageNo > 1;
  const hasNext = pageNo < totalPages;
  const textStyle = note.textStyle ?? {};
  const textStyleCss = {
    fontWeight: textStyle.bold ? 600 : undefined,
    fontStyle: textStyle.italic ? "italic" : undefined,
    textDecorationLine:
      [
        textStyle.underline ? "underline" : "",
        textStyle.strike ? "line-through" : "",
      ]
        .filter(Boolean)
        .join(" ") || undefined,
  } satisfies CSSProperties;

  return (
    <div
      aria-hidden="true"
      onAnimationEnd={onAnimationEnd}
      className={`book-page relative overflow-hidden rounded-[3px] bg-paper shadow-[inset_14px_0_18px_-18px_rgba(0,0,0,0.55),inset_-10px_0_18px_-16px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(0,0,0,0.05)] ${className}`}
    >
      <div className="px-5 pt-7 sm:px-14">
        <h1
          className={`m-0 w-full py-0 font-hand text-3xl leading-tight sm:text-4xl ${
            note.title.trim() ? "" : "text-ink-soft/75"
          }`}
        >
          {note.title.trim() || "Page title"}
        </h1>
        <div className="mt-2 text-[11px] text-ink-soft">
          <span>{formatDay(note.createdAt)}</span>
        </div>
      </div>

      <div
        className={`relative mt-5 ${paperClass(subject.paper)} ${
          margin ? "paper-margin" : ""
        }`}
      >
        <div className="relative">
          <div
            className="block min-h-[46dvh] w-full px-5 py-0 text-[16px] break-words whitespace-pre-wrap sm:px-14"
            style={{ lineHeight: "32px", ...textStyleCss }}
          >
            {empty ? (
              <span className="text-ink-soft/75">Start writing…</span>
            ) : (
              runs.map((run, index) => (
                <span
                  key={`${index}-${run.color}`}
                  style={{ color: resolveInkColor(run.color, theme) }}
                >
                  {run.text}
                </span>
              ))
            )}
            {!empty && trailingBreak ? "\u200b" : null}
          </div>

          <PenCanvas
            ink={note.ink ?? []}
            active={false}
            color="ink"
            size={0.008}
            eraser={false}
            theme={theme}
            onCommit={() => {}}
          />
        </div>

        <NoteImages
          images={note.images ?? []}
          className="px-5 sm:px-14"
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-rule/70 px-2 py-1.5 sm:px-3">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-ink-soft sm:px-3 ${
            hasPrev ? "" : "opacity-30"
          }`}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </span>

        <span className="font-mono text-[11px] tabular-nums text-ink-soft">
          {pageNo} / {totalPages}
        </span>

        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-ink-soft sm:px-3 ${
            hasNext ? "" : "opacity-30"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
