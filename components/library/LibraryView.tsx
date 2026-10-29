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
    <div className="library-scene library-room">
      <header className="library-head">
        <div>
          <h1 className="library-title">My Library</h1>
          <p className="library-sub">Every subject a book · every note a page</p>
        </div>

        <div className="library-actions">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search notes"
            className="library-action"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Light theme" : "Dark theme"}
            className="library-action"
          >
            {theme === "dark" ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      <div className="library-wall">
        <section className="bookcase bookcase--left" aria-label="Your library">
          <div className="bookcase-bay">
            <DecorativeShelf seed={1} />
            <span aria-hidden="true" className="glass-pane" />
          </div>

          <div className="bookcase-bay">
            <DecorativeShelf seed={2} />
            <span aria-hidden="true" className="glass-pane" />
          </div>
          <div className="bookcase-bay">
            <DecorativeShelf seed={5} />
            <span aria-hidden="true" className="glass-pane" />
          </div>
          <div className="bookcase-bay">
            <DecorativeShelf seed={9} />
            <span aria-hidden="true" className="glass-pane" />
          </div>
        </section>

        <section className="window-column" aria-label="Window">
          <div className="window-box">
            <div className="window-glass">
              <span className="window-shooting-star" />
              <span className="window-sun" />
              <span className="window-moon" />
              <span className="window-stars" />
              <span className="window-cloud window-cloud-a" />
              <span className="window-cloud window-cloud-b" />
              <span className="window-ridge window-ridge--far" />
              <span className="window-ridge window-ridge--mid" />
              <span className="window-treeline" />
              <span className="window-lake" />
              <span className="window-lake-glow window-lake-glow--moon" />
              <span className="window-lake-glow window-lake-glow--sun" />
            </div>

            <span aria-hidden="true" className="window-muntin window-muntin--v" />
            <span aria-hidden="true" className="window-muntin window-muntin--h" />
            <span aria-hidden="true" className="window-sill" />

            <div className="window-books">
              {subjects.length === 0 ? (
                <div className="shelf-empty window-empty">
                  <BookIcon className="mx-auto h-7 w-7" />
                  <p className="mt-2 font-display text-xl">Your shelf is empty</p>
                  <p className="mt-1 text-[11px]">Add your first subject.</p>
                  <button
                    type="button"
                    onClick={onNewBook}
                    className="shelf-empty-button"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    New book
                  </button>
                </div>
              ) : (
                <div className="window-books-row">
                  {subjects.map((subject, index) => (
                    <BookSpine
                      key={subject.id}
                      index={index}
                      subject={subject}
                      noteCount={countBySubject.get(subject.id) ?? 0}
                      compact
                      lifted={liftedId === subject.id}
                      onOpen={(from) => handleOpen(subject, from)}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={onNewBook}
                    aria-label="Add a new subject"
                    className="book-spine book-spine--compact book-spine-new"
                    style={{
                      width: 26,
                      height: "calc(var(--spine-base) - 8px)",
                    }}
                  >
                    <span className="book-spine-label">+ New book</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="window-cabinet">
            <div className="window-shelf">
              <DecorativeShelf seed={12} />
              <span aria-hidden="true" className="glass-pane" />
            </div>
            <div className="window-shelf">
              <DecorativeShelf seed={16} />
              <span aria-hidden="true" className="glass-pane" />
            </div>
          </div>
        </section>

        <section className="bookcase bookcase--right" aria-label="Bookcase">
          <div className="bookcase-bay">
            <DecorativeShelf seed={3} />
            <span aria-hidden="true" className="glass-pane" />
          </div>
          <div className="bookcase-bay">
            <DecorativeShelf seed={6} />
            <span aria-hidden="true" className="glass-pane" />
          </div>
          <div className="bookcase-bay">
            <DecorativeShelf seed={10} />
            <span aria-hidden="true" className="glass-pane" />
          </div>
          <div className="bookcase-bay">
            <DecorativeShelf seed={14} />
            <span aria-hidden="true" className="glass-pane" />
          </div>
        </section>
      </div>
    </div>
  );
}

const DUMMY_COLORS = [
  "#6d5a4a",
  "#8a6d55",
  "#4f5d6b",
  "#7a5a52",
  "#5b6b5a",
  "#8c7a5c",
  "#6a5566",
  "#7d6a4f",
];
const DUMMY_WIDTHS = [7, 10, 6, 12, 8, 9, 11, 7, 13, 8, 6, 10, 9, 7, 12, 8];
const DUMMY_HEIGHTS = [62, 74, 56, 80, 68, 72, 58, 76, 64, 70, 54, 78, 60, 73, 66, 69];

/** A quiet row of books on a shelf that is not part of the library. */
function DecorativeShelf({ seed }: { seed: number }) {
  return (
    <div aria-hidden="true" className="dummy-shelf">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className="dummy-book"
          style={{
            width: DUMMY_WIDTHS[i % DUMMY_WIDTHS.length],
            height: `${DUMMY_HEIGHTS[(i + seed) % DUMMY_HEIGHTS.length]}%`,
            backgroundColor: DUMMY_COLORS[(i + seed) % DUMMY_COLORS.length],
            transform: i % 7 === 3 ? "rotate(-2.5deg)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
