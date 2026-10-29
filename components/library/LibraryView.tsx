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

  const books = `${subjects.length} ${
    subjects.length === 1 ? "book" : "books"
  }`;
  const pages = `${notes.length} ${notes.length === 1 ? "page" : "pages"}`;

  return (
    <div className="library-scene min-h-dvh">
      <RoomBackdrop />

      <div className="room-stage">
        <header className="room-head">
          <div className="room-heading-wrap">
            <h1 className="room-heading">My Library</h1>
            <p className="room-sub">Every subject a book · every note a page</p>
            <span aria-hidden="true" className="room-ornament" />
          </div>

          <div className="room-actions">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search notes"
              className="room-action"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Light theme" : "Dark theme"}
              className="room-action"
            >
              {theme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        <section className="open-shelf" aria-labelledby="library-title">
          <h2 id="library-title" className="sr-only">
            My Library
          </h2>

          <div className="shelf-unit">
            <span aria-hidden="true" className="shelf-post" />

            <div className="shelf-stack">
              <div className="shelf-opening">
                {subjects.length === 0 ? (
                  <div className="shelf-empty">
                    <BookIcon className="mx-auto h-9 w-9 text-[var(--room-ink-soft)]" />
                    <p className="mt-3 font-display text-2xl text-[var(--room-ink)]">
                      Your shelf is empty
                    </p>
                    <p className="mt-1 text-xs text-[var(--room-ink-soft)]">
                      Add your first subject and give it a place on the shelf.
                    </p>
                    <button
                      type="button"
                      onClick={onNewBook}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-[var(--room-ink-soft)] px-3 py-2 text-xs font-medium tracking-wide text-[var(--room-ink)] uppercase transition hover:bg-white/10"
                    >
                      <PlusIcon className="h-4 w-4" />
                      New book
                    </button>
                  </div>
                ) : (
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
                )}
              </div>

              <div className="shelf-board">
                <span className="shelf-count">
                  {books} · {pages}
                </span>
                <span className="shelf-note">Stored on this device</span>
              </div>

              <div className="lower-shelf">
                <DecorativeShelf seed={2} />
                <div aria-hidden="true" className="shelf-board shelf-board--slim" />
              </div>

              <div className="lower-shelf">
                <DecorativeShelf seed={7} />
                <div aria-hidden="true" className="shelf-board shelf-board--slim" />
              </div>
            </div>

            <span aria-hidden="true" className="shelf-post" />
          </div>
        </section>

        <div aria-hidden="true" className="lower-cabinet">
          <DecorativeShelf seed={11} />
        </div>

        <div aria-hidden="true" className="side-bookcase">
          <div className="side-shelf">
            <DecorativeShelf seed={4} />
            <div className="shelf-board shelf-board--slim" />
          </div>
          <div className="side-shelf">
            <DecorativeShelf seed={8} />
            <div className="shelf-board shelf-board--slim" />
          </div>
          <div className="side-shelf">
            <DecorativeShelf seed={13} />
            <div className="shelf-board shelf-board--slim" />
          </div>
        </div>

        <div aria-hidden="true" className="ladder" />
      </div>
    </div>
  );
}

/** The room around the shelf: back wall, floor and the window behind it. */
function RoomBackdrop() {
  return (
    <div aria-hidden="true" className="room-backdrop">
      <div className="room-window">
        <div className="window-view">
          <span className="window-sun" />
          <span className="window-moon" />
          <span className="window-stars" />
          <span className="window-cloud window-cloud-a" />
          <span className="window-cloud window-cloud-b" />
          <span className="window-hills" />
        </div>
        <span className="window-bar-v" />
        <span className="window-bar-h" />
        <span className="window-sill" />
        <span className="window-curtain" />
        <span className="sill-plant sill-plant-a" />
        <span className="sill-plant sill-plant-b" />
      </div>

      <div className="room-floor" />
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
