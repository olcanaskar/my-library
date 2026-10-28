"use client";

import type { Note, Subject } from "@/lib/types";
import {
  BookIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
} from "@/components/ui/icons";
import type { BookRect } from "./BookOpening";
import { BookSpine } from "./BookSpine";

type LibraryViewProps = {
  subjects: Subject[];
  notes: Note[];
  theme: "light" | "dark";
  /** Subject whose book is currently flying out of the shelf. */
  liftedId: string | null;
  onOpenBook: (id: string, from: BookRect | null) => void;
  onNewBook: () => void;
  onOpenSearch: () => void;
  onToggleTheme: () => void;
};

export function LibraryView({
  subjects,
  notes,
  theme,
  liftedId,
  onOpenBook,
  onNewBook,
  onOpenSearch,
  onToggleTheme,
}: LibraryViewProps) {
  const countBySubject = new Map<string, number>();
  for (const note of notes) {
    countBySubject.set(
      note.subjectId,
      (countBySubject.get(note.subjectId) ?? 0) + 1,
    );
  }

  // The cover animation needs a starting rectangle; reduced-motion users skip
  // straight to the page instead of waiting through it.
  function handleOpen(subject: Subject, from: BookRect) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    onOpenBook(subject.id, reduce ? null : from);
  }

  return (
    <div className="min-h-dvh pb-16">
      <header className="mx-auto flex max-w-5xl items-end justify-between gap-3 px-4 pt-9 pb-6 sm:px-5 sm:pt-10">
        <div className="min-w-0">
          <h1 className="font-hand text-4xl leading-none sm:text-5xl md:text-6xl">
            My Library
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search notes"
            className="rounded-lg p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Light theme" : "Dark theme"}
            className="rounded-lg p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        {subjects.length === 0 ? (
          <div className="mx-auto mt-10 max-w-sm rounded-xl border border-dashed border-ink/20 bg-card/60 px-6 py-12 text-center">
            <BookIcon className="mx-auto h-10 w-10 text-ink-soft/70" />
            <h2 className="mt-4 font-hand text-2xl">Your shelf is empty</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Add your first subject and give it a place on the shelf.
            </p>
            <button
              type="button"
              onClick={onNewBook}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-paper transition hover:opacity-90"
            >
              <PlusIcon className="h-4 w-4" />
              New book
            </button>
          </div>
        ) : (
          <div>
            <div className="shelf-scroll overflow-x-auto pb-1">
              <div className="flex min-w-max items-end justify-center gap-2.5 px-4 pt-8 sm:px-6">
                {subjects.map((subject) => (
                  <BookSpine
                    key={subject.id}
                    subject={subject}
                    noteCount={countBySubject.get(subject.id) ?? 0}
                    lifted={liftedId === subject.id}
                    onOpen={(from) => handleOpen(subject, from)}
                  />
                ))}

                <button
                  type="button"
                  onClick={onNewBook}
                  aria-label="Add a new subject"
                  className="flex h-48 w-12 shrink-0 items-center justify-center rounded-t-[3px] border border-dashed border-ink/25 text-ink-soft transition hover:border-ink/50 hover:bg-card/50 hover:text-ink sm:h-56 sm:w-14"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="h-3.5 rounded-b-[3px] bg-gradient-to-b from-shelf to-shelf-edge" />
            <div className="mx-1 h-2 rounded-b-md bg-black/10" />
          </div>
        )}

        <p className="mt-10 text-center text-xs text-ink-soft/80">
          Your notes are stored on this device. Works offline.
        </p>
      </main>
    </div>
  );
}
