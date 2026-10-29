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
    <div className="library-scene min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full flex-col items-center justify-center px-3 py-8 sm:px-6 sm:py-10">
        <section className="cabinet" aria-labelledby="library-title">
          <div className="cabinet-inner">
            <header className="cabinet-head">
              <h1 id="library-title" className="cabinet-title">
                My Library
              </h1>
              <p className="cabinet-sub">
                Every subject a book · every note a page
              </p>
              <span aria-hidden="true" className="cabinet-ornament" />

              <div className="cabinet-actions">
                <button
                  type="button"
                  onClick={onOpenSearch}
                  aria-label="Search notes"
                  className="cabinet-action"
                >
                  <SearchIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={theme === "dark" ? "Light theme" : "Dark theme"}
                  className="cabinet-action"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-4 w-4" />
                  ) : (
                    <MoonIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </header>

            {subjects.length === 0 ? (
              <div className="cabinet-empty">
                <BookIcon className="mx-auto h-9 w-9 text-[var(--lib-cream-soft)]" />
                <h2 className="mt-3 font-display text-2xl">Your shelf is empty</h2>
                <p className="mt-1 text-xs text-[var(--lib-cream-soft)]">
                  Add your first subject and give it a place on the shelf.
                </p>
                <button
                  type="button"
                  onClick={onNewBook}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-[var(--lib-cream-faint)] px-3 py-2 text-xs font-medium tracking-wide text-[var(--lib-cream)] uppercase transition hover:border-[var(--lib-cream-soft)] hover:bg-white/5"
                >
                  <PlusIcon className="h-4 w-4" />
                  New book
                </button>
              </div>
            ) : (
              <div className="cabinet-shelf">
                <div className="shelf-scroll overflow-x-auto">
                  <div className="shelf-row">
                    {subjects.map((subject, index) => (
                      <BookSpine
                        key={subject.id}
                        index={index}
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
                      className="book-spine book-spine-new"
                      style={{
                        width: "clamp(38px, 4.6vw, 48px)",
                        height: "calc(var(--spine-base) - 18px)",
                      }}
                    >
                      <span className="book-spine-label">+ New book</span>
                    </button>

                    <ShelfStack />
                  </div>
                </div>
              </div>
            )}

            <div aria-hidden="true" className="shelf-board" />

            <footer className="cabinet-foot">
              {subjects.length} {subjects.length === 1 ? "book" : "books"} ·{" "}
              {notes.length} {notes.length === 1 ? "page" : "pages"}
            </footer>
          </div>
        </section>

        <p className="scene-hint">
          Pick a book to keep writing where you left off · stored on this device
        </p>
      </div>
    </div>
  );
}

/** Two books lying flat on the shelf: pure decoration, like a real bookcase. */
function ShelfStack() {
  return (
    <div
      aria-hidden="true"
      className="ml-2 hidden shrink-0 flex-col items-start gap-[2px] self-end sm:flex"
    >
      <span
        className="shelf-stack"
        style={{
          width: 70,
          height: 9,
          background:
            "linear-gradient(90deg, #5f6b4a 0 68%, #efe1c2 68% 90%, #d8c7a4 90%)",
        }}
      />
      <span
        className="shelf-stack"
        style={{
          width: 76,
          height: 11,
          background:
            "linear-gradient(90deg, #8a4238 0 68%, #efe1c2 68% 90%, #d8c7a4 90%)",
        }}
      />
    </div>
  );
}
