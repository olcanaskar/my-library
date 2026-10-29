"use client";

import { useEffect, useRef, useState } from "react";
import { formatDay } from "@/lib/format";
import { inkPalette, resolveInkColor } from "@/lib/ink";
import {
  applyTextEdit,
  runsFromNote,
  runsToText,
  writingColorFromNote,
  type TextEditInfo,
} from "@/lib/textRuns";
import {
  paperClass,
  type InkColor,
  type InkStroke,
  type Note,
  type Subject,
  type TextRun,
  type Theme,
} from "@/lib/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EraserIcon,
  PenIcon,
  PlusIcon,
  TextIcon,
  TrashIcon,
  UndoIcon,
} from "@/components/ui/icons";
import { PenCanvas } from "./PenCanvas";

const INK_SIZES = [
  { name: "Fine", value: 0.004, dot: 3 },
  { name: "Medium", value: 0.008, dot: 5 },
  { name: "Bold", value: 0.014, dot: 7 },
] as const;

type NoteEditorProps = {
  subject: Subject;
  note: Note;
  theme: Theme;
  pageNo: number;
  totalPages: number;
  onChange: (patch: {
    title?: string;
    body?: string;
    ink?: InkStroke[];
    textColor?: InkColor;
    textRuns?: TextRun[];
  }) => void;
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
  theme,
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

  const [tool, setTool] = useState<"type" | "pen">("type");
  const [ink, setInk] = useState<InkStroke[]>(() => note.ink ?? []);
  const [runs, setRuns] = useState<TextRun[]>(() => runsFromNote(note));
  const runsRef = useRef(runs);
  const editRef = useRef<TextEditInfo | null>(null);
  const palette = inkPalette(theme);
  const [inkColor, setInkColor] = useState<InkColor>("ink");
  const [textColor, setTextColor] = useState<InkColor>(() =>
    writingColorFromNote(note),
  );
  const [inkSize, setInkSize] = useState<number>(INK_SIZES[1].value);
  const [eraser, setEraser] = useState(false);
  const penActive = tool === "pen";
  const textColorValue = resolveInkColor(textColor, theme);
  const body = runsToText(runs);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  // Page turns remount this editor (key={note.id}), so each page starts clean.

  useEffect(() => {
    const field = bodyRef.current;
    if (!field) return;
    const textarea: HTMLTextAreaElement = field;

    function onBeforeInput(event: InputEvent) {
      editRef.current = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
        inputType: event.inputType ?? "",
      };
    }

    textarea.addEventListener("beforeinput", onBeforeInput);
    return () => textarea.removeEventListener("beforeinput", onBeforeInput);
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [body, note.id]);

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

  function handleChange(patch: {
    title?: string;
    body?: string;
    ink?: InkStroke[];
    textColor?: InkColor;
    textRuns?: TextRun[];
  }) {
    markTyping();
    onChange(patch);
  }

  function commitRuns(next: TextRun[]) {
    runsRef.current = next;
    setRuns(next);
  }

  function handleBodyChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const nextText = event.currentTarget.value;
    const edit = editRef.current;
    editRef.current = null;
    const nextRuns = applyTextEdit(runsRef.current, nextText, textColor, {
      start: edit?.start ?? 0,
      end: edit?.end ?? 0,
      inputType: edit?.inputType ?? "",
      afterCaret: event.currentTarget.selectionStart,
    });
    commitRuns(nextRuns);
    handleChange({ body: nextText, textRuns: nextRuns, textColor });
  }

  function chooseColor(next: InkColor) {
    if (!penActive) {
      const field = bodyRef.current;
      const start = field?.selectionStart ?? 0;
      const end = field?.selectionEnd ?? start;

      setTextColor(next);
      // Persist the existing runs alongside the new writing colour. Without
      // this, an older note with no runs would treat the new colour as if it
      // had always applied to the whole page after a reload.
      handleChange({ textColor: next, textRuns: runsRef.current });

      // Keep the caret (and any selection) in the page so the writer can
      // carry on immediately; only future characters take the new colour.
      window.requestAnimationFrame(() => {
        const el = bodyRef.current;
        if (!el) return;
        el.focus({ preventScroll: true });
        el.setSelectionRange(start, end);
      });
      return;
    }

    setInkColor(next);
    setEraser(false);
  }

  function handleInkChange(next: InkStroke[]) {
    setInk(next);
    handleChange({ ink: next });
  }

  function undoInk() {
    if (ink.length === 0) return;
    handleInkChange(ink.slice(0, -1));
  }

  function clearInk() {
    if (ink.length === 0) return;
    if (!window.confirm("Clear all ink on this page?")) return;
    handleInkChange([]);
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
          role="toolbar"
          aria-label="Note tools"
          className="pen-toolbar mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-rule/80 bg-card/90 p-1.5 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.5)]"
        >
          <div className="pen-group flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                setTool("type");
                setEraser(false);
              }}
              aria-pressed={tool === "type"}
              className={`pen-tool ${tool === "type" ? "is-active" : ""}`}
            >
              <TextIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Type</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTool("pen");
                setEraser(false);
              }}
              aria-pressed={tool === "pen"}
              className={`pen-tool ${tool === "pen" ? "is-active" : ""}`}
            >
              <PenIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pen</span>
            </button>
          </div>

          <span aria-hidden="true" className="pen-divider" />

          <div
            role="group"
            aria-label={penActive ? "Ink color" : "Text color"}
            className="pen-group flex items-center gap-1"
          >
            {palette.map((option) => {
              const selected =
                !eraser && (penActive ? inkColor : textColor) === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseColor(option.key)}
                  aria-label={option.name}
                  aria-pressed={selected}
                  className={`pen-swatch ${selected ? "is-active" : ""}`}
                  style={{ backgroundColor: option.value }}
                />
              );
            })}
          </div>

          {penActive ? (
            <>
              <span aria-hidden="true" className="pen-divider" />

              <div className="pen-group flex items-center gap-0.5">
                {INK_SIZES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setInkSize(option.value);
                      setEraser(false);
                    }}
                    aria-label={`${option.name} pen`}
                    aria-pressed={!eraser && inkSize === option.value}
                    className={`pen-size ${
                      !eraser && inkSize === option.value ? "is-active" : ""
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="block rounded-full bg-current"
                      style={{ width: option.dot, height: option.dot }}
                    />
                  </button>
                ))}
              </div>

              <span aria-hidden="true" className="pen-divider" />

              <button
                type="button"
                onClick={() => setEraser((value) => !value)}
                aria-label="Eraser"
                aria-pressed={eraser}
                className={`pen-tool ${eraser ? "is-active" : ""}`}
              >
                <EraserIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Eraser</span>
              </button>

              <div className="ml-auto flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={undoInk}
                  disabled={ink.length === 0}
                  aria-label="Undo ink"
                  className="pen-tool"
                >
                  <UndoIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Undo</span>
                </button>
                <button
                  type="button"
                  onClick={clearInk}
                  disabled={ink.length === 0}
                  aria-label="Clear ink"
                  className="pen-tool"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div
          key={note.id}
          className={`paper-sheet page-turn overflow-hidden rounded-lg border border-rule/70 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_44px_-30px_rgba(0,0,0,0.55)]`}
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
            className={`relative mt-5 ${paperClass(subject.paper)} ${
              margin ? "paper-margin" : ""
            }`}
          >
            <div className="relative">
              {/* The textarea supplies the caret and editing; this mirror
                  supplies the per-run colours behind its transparent text. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden px-5 py-0 text-[16px] break-words whitespace-pre-wrap sm:px-14"
                style={{ lineHeight: "32px" }}
              >
                {runs.map((run, index) => (
                  <span
                    key={`${index}-${run.color}`}
                    style={{ color: resolveInkColor(run.color, theme) }}
                  >
                    {run.text}
                  </span>
                ))}
              </div>

              <textarea
                ref={bodyRef}
                value={body}
                onChange={handleBodyChange}
                placeholder={
                  penActive
                    ? "Switch to Type to write, or draw on the page…"
                    : "Start writing…"
                }
                aria-label="Note content"
                spellCheck
                wrap="soft"
                className={`note-textarea relative z-[1] block min-h-[46dvh] w-full resize-none overflow-hidden border-0 bg-transparent px-5 py-0 text-[16px] break-words outline-none sm:px-14 ${
                  penActive ? "pointer-events-none" : ""
                }`}
                style={{
                  lineHeight: "32px",
                  caretColor: textColorValue,
                }}
              />
            </div>

            <PenCanvas
              key={note.id}
              ink={ink}
              active={penActive}
              color={inkColor}
              size={inkSize}
              eraser={eraser}
              theme={theme}
              onCommit={handleInkChange}
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
          <span>
            {penActive
              ? "Draw directly on the page with a pen, Pencil or mouse."
              : "Your writing is saved automatically."}
          </span>
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
