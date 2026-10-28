"use client";

import { useEffect, useRef, useState } from "react";
import { formatDay } from "@/lib/format";
import { paperClass, type Note, type Subject } from "@/lib/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";

type NoteEditorProps = {
  subject: Subject;
  note: Note;
  pageNo: number;
  totalPages: number;
  onChange: (patch: { title?: string; body?: string }) => void;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onNewPage: () => void;
  onDelete: () => void;
  onDeleteNotebook: () => void;
};

export function NoteEditor({
  subject,
  note,
  pageNo,
  totalPages,
  onChange,
  onBack,
  onPrev,
  onNext,
  onNewPage,
  onDelete,
  onDeleteNotebook,
}: NoteEditorProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<"typing" | "saved">("saved");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [note.body, note.id]);

  // Alt+arrow turns pages without stealing keys from the text fields.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!event.altKey) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  function markTyping() {
    setStatus("typing");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("saved"), 650);
  }

  function handleChange(patch: { title?: string; body?: string }) {
    markTyping();
    onChange(patch);
  }

  const margin = subject.paper === "lined" || subject.paper === "grid";
  const hasPrev = pageNo > 1;
  const hasNext = pageNo < totalPages;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-rule/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to library"
            className="rounded-lg p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: subject.color }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm leading-tight font-medium">
                {subject.name}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-ink-soft">
                Page {pageNo} of {totalPages}
              </p>
            </div>
          </div>

          <span
            aria-live="polite"
            className="flex shrink-0 items-center gap-1.5 pr-1 text-[11px] text-ink-soft"
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                status === "saved" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="whitespace-nowrap">
              {status === "saved" ? "Saved" : "Saving…"}
            </span>
          </span>

          <button
            type="button"
            onClick={onNewPage}
            aria-label="New page"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rule px-2 py-2 text-xs font-medium transition hover:border-ink/30 hover:bg-ink/5 sm:px-3 sm:text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">New page</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete page"
            className="shrink-0 rounded-lg p-2 text-ink-soft transition hover:bg-red-500/10 hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-2 py-4 sm:px-5 sm:py-8">
        <div
          key={note.id}
          className="paper-sheet page-turn overflow-hidden rounded-lg border border-rule/70 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_44px_-30px_rgba(0,0,0,0.55)]"
        >
          <div className="px-5 pt-7 sm:px-14">
            <input
              value={note.title}
              onChange={(event) => handleChange({ title: event.target.value })}
              placeholder="Page title"
              aria-label="Page title"
              maxLength={80}
              autoFocus={!note.title}
              className="w-full bg-transparent font-hand text-3xl leading-tight outline-none sm:text-4xl"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-soft">
              <span>{formatDay(note.createdAt)}</span>
              <span className="truncate pl-3">{subject.name} notebook</span>
            </div>
          </div>

          <div
            className={`mt-5 ${paperClass(subject.paper)} ${
              margin ? "paper-margin" : ""
            }`}
          >
            <textarea
              ref={bodyRef}
              value={note.body}
              onChange={(event) => handleChange({ body: event.target.value })}
              placeholder="Start writing…"
              aria-label="Note content"
              spellCheck
              className="block min-h-[46dvh] w-full resize-none overflow-hidden border-0 bg-transparent px-5 py-0 text-[16px] text-ink outline-none sm:px-14"
              style={{ lineHeight: "32px" }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-rule/70 px-2 py-1.5 sm:px-3">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Previous page"
              className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-ink-soft transition hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-30 sm:px-3"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="font-mono text-[11px] tabular-nums text-ink-soft">
              {pageNo} / {totalPages}
            </span>

            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next page"
              className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-ink-soft transition hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-30 sm:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 text-[11px] text-ink-soft/80">
          <span>Your writing is saved automatically.</span>
          <button
            type="button"
            onClick={onDeleteNotebook}
            className="rounded px-1 py-0.5 transition hover:text-red-600"
          >
            Delete notebook
          </button>
        </div>
      </main>
    </div>
  );
}
