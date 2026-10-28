"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { SearchIcon } from "@/components/ui/icons";
import { formatShort } from "@/lib/format";
import type { Note, Subject } from "@/lib/types";

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  subjects: Subject[];
  onOpenNote: (subjectId: string, noteId: string) => void;
};

export function SearchDialog({ open, onClose, ...rest }: SearchDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Search notes" width="max-w-lg">
      <SearchBody onClose={onClose} {...rest} />
    </Modal>
  );
}

function SearchBody({
  notes,
  subjects,
  onOpenNote,
  onClose,
}: Omit<SearchDialogProps, "open">) {
  const [query, setQuery] = useState("");

  const subjectById = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const subject of subjects) map.set(subject.id, subject);
    return map;
  }, [subjects]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

    if (!needle) return pool.slice(0, 6);

    return pool
      .filter((note) => {
        const subject = subjectById.get(note.subjectId);
        const haystack = `${note.title} ${note.body} ${subject?.name ?? ""}`;
        return haystack.toLowerCase().includes(needle);
      })
      .slice(0, 20);
  }, [notes, query, subjectById]);

  function openNote(note: Note) {
    onOpenNote(note.subjectId, note.id);
    onClose();
  }

  return (
    <>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) {
              event.preventDefault();
              openNote(results[0]);
            }
          }}
          placeholder="Title, note or subject…"
          aria-label="Search"
          autoFocus
          className="w-full rounded-lg border border-rule bg-paper py-2.5 pr-3 pl-9 text-sm outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-ink/10"
        />
      </div>

      <div className="mt-3 max-h-[55dvh] space-y-1 overflow-y-auto">
        {results.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-ink-soft">
            No matching notes.
          </p>
        ) : (
          results.map((note) => {
            const subject = subjectById.get(note.subjectId);
            return (
              <button
                key={note.id}
                type="button"
                onClick={() => openNote(note)}
                className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-ink/5"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: subject?.color ?? "#999" }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium">
                      {note.title || "Untitled page"}
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-soft">
                      {formatShort(note.updatedAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-soft">
                    {subject?.name} ·{" "}
                    {note.body.replace(/\s+/g, " ").trim() || "Empty page"}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
