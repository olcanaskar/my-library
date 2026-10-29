import type { InkColor, Note, TextRun } from "./types";

export function runsToText(runs: TextRun[]): string {
  return runs.map((run) => run.text).join("");
}

/** Merge touching runs that share a colour. */
export function normalizeRuns(runs: TextRun[]): TextRun[] {
  const out: TextRun[] = [];

  for (const run of runs) {
    if (!run.text) continue;
    const last = out[out.length - 1];
    if (last && last.color === run.color) {
      out[out.length - 1] = { ...last, text: last.text + run.text };
    } else {
      out.push({ text: run.text, color: run.color });
    }
  }

  return out;
}

/**
 * Notes saved before coloured runs existed only have a body plus one colour.
 * In that case the whole body becomes the first run.
 */
export function runsFromNote(
  note: Pick<Note, "body" | "textRuns" | "textColor">,
): TextRun[] {
  if (note.textRuns?.length) {
    if (runsToText(note.textRuns) === note.body) {
      return normalizeRuns(note.textRuns);
    }
  }

  return note.body
    ? [{ text: note.body, color: note.textColor ?? "ink" }]
    : [];
}

/** Colour the next typed characters should use. */
export function writingColorFromNote(
  note: Pick<Note, "textRuns" | "textColor">,
): InkColor {
  if (note.textColor) return note.textColor;
  const last = note.textRuns?.[note.textRuns.length - 1];
  return last?.color ?? "ink";
}

function sliceRuns(runs: TextRun[], start: number, end: number): TextRun[] {
  if (end <= start) return [];

  const out: TextRun[] = [];
  let offset = 0;

  for (const run of runs) {
    const runStart = offset;
    const runEnd = offset + run.text.length;
    offset = runEnd;

    const from = Math.max(start, runStart);
    const to = Math.min(end, runEnd);
    if (to > from) {
      out.push({
        text: run.text.slice(from - runStart, to - runStart),
        color: run.color,
      });
    }

    if (runEnd >= end) break;
  }

  return out;
}

export type TextEditInfo = {
  /** Selection just before the browser applies the edit. */
  start: number;
  end: number;
  inputType: string;
  /** Caret position after the edit; resolves repeated-character ambiguity. */
  afterCaret?: number;
};

type EditRange = {
  start: number;
  end: number;
  inserted: string;
};

function inferEditRange(
  oldText: string,
  nextText: string,
  edit?: TextEditInfo,
): EditRange | null {
  if (!edit) return null;
  const { start, end, inputType } = edit;
  if (start < 0 || end < start || end > oldText.length) return null;

  if (inputType.startsWith("insert") && inputType !== "insertReplacementText") {
    const insertedLength = nextText.length - oldText.length + (end - start);
    if (insertedLength < 0) return null;

    const inserted = nextText.slice(start, start + insertedLength);
    if (oldText.slice(0, start) + inserted + oldText.slice(end) === nextText) {
      return { start, end, inserted };
    }
    return null;
  }

  if (inputType.startsWith("delete")) {
    if (start !== end) {
      if (oldText.slice(0, start) + oldText.slice(end) === nextText) {
        return { start, end, inserted: "" };
      }
      return null;
    }

    const removed = oldText.length - nextText.length;
    if (removed <= 0) return null;

    const backward =
      inputType.includes("Backward") || inputType.includes("Back");
    const from = backward ? start - removed : start;
    const to = backward ? start : start + removed;

    if (from < 0 || to > oldText.length) return null;
    if (oldText.slice(0, from) + oldText.slice(to) === nextText) {
      return { start: from, end: to, inserted: "" };
    }
    return null;
  }

  return null;
}

/**
 * Rebuild the coloured runs after a native textarea edit. `beforeinput`
 * gives us the exact selection for typing, pasting and deleting, which avoids
 * ambiguity when the new text repeats its neighbours. Autocorrect and undo
 * fall back to a prefix/suffix diff.
 */
export function applyTextEdit(
  runs: TextRun[],
  nextText: string,
  color: InkColor,
  edit?: TextEditInfo,
): TextRun[] {
  const text = runsToText(runs);
  if (text === nextText) return runs;

  let prefix = 0;
  const prefixLimit = Math.min(text.length, nextText.length);
  while (prefix < prefixLimit && text[prefix] === nextText[prefix]) {
    prefix += 1;
  }

  let suffix = 0;
  const suffixLimit = Math.min(
    text.length - prefix,
    nextText.length - prefix,
  );
  while (
    suffix < suffixLimit &&
    text[text.length - 1 - suffix] === nextText[nextText.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const removedLength = text.length - prefix - suffix;
  const insertedLength = nextText.length - prefix - suffix;
  const inserted = nextText.slice(prefix, nextText.length - suffix);
  const beforeRange = inferEditRange(text, nextText, edit);

  const applyRange = (range: EditRange) =>
    normalizeRuns([
      ...sliceRuns(runs, 0, range.start),
      ...(range.inserted ? [{ text: range.inserted, color }] : []),
      ...sliceRuns(runs, range.end, text.length),
    ]);

  // A replaced selection is explicit in `beforeinput`, so trust it before
  // the pure-insertion heuristic below.
  if (beforeRange && edit && edit.start !== edit.end) {
    return applyRange(beforeRange);
  }

  // Typing at the start of repeated characters is ambiguous for a pure diff;
  // the caret after the edit says where the characters really went.
  if (edit?.afterCaret != null) {
    if (removedLength === 0 && insertedLength > 0) {
      const start = edit.afterCaret - insertedLength;
      if (
        start >= 0 &&
        text.slice(0, start) + inserted + text.slice(start) === nextText
      ) {
        return normalizeRuns([
          ...sliceRuns(runs, 0, start),
          { text: inserted, color },
          ...sliceRuns(runs, start, text.length),
        ]);
      }
    }

    if (insertedLength === 0 && removedLength > 0) {
      const start = edit.afterCaret;
      const end = start + removedLength;
      if (
        start >= 0 &&
        end <= text.length &&
        text.slice(0, start) + text.slice(end) === nextText
      ) {
        return normalizeRuns([
          ...sliceRuns(runs, 0, start),
          ...sliceRuns(runs, end, text.length),
        ]);
      }
    }
  }

  if (beforeRange) {
    return applyRange(beforeRange);
  }

  const removedEnd = text.length - suffix;

  return normalizeRuns([
    ...sliceRuns(runs, 0, prefix),
    ...(inserted ? [{ text: inserted, color }] : []),
    ...sliceRuns(runs, removedEnd, text.length),
  ]);
}
