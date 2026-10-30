"use client";

import { useEffect, useRef, useState } from "react";
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

  const [cycling, setCycling] = useState(false);
  const cycleTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (cycleTimer.current) window.clearTimeout(cycleTimer.current);
    };
  }, []);

  function handleToggleTheme() {
    setCycling(true);
    if (cycleTimer.current) window.clearTimeout(cycleTimer.current);
    cycleTimer.current = window.setTimeout(() => setCycling(false), 2800);
    onToggleTheme();
  }

  return (
    <div
      className={`library-scene library-room ${
        cycling ? "theme-cycling" : ""
      } ${liftedId ? "is-quiet" : ""}`}
    >
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
            onClick={handleToggleTheme}
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
            <ArtShelf variant={1} />
            <span aria-hidden="true" className="glass-pane" />
          </div>

          <div className="bookcase-bay">
            <DecorativeShelf seed={2} />
            <span aria-hidden="true" className="glass-pane" />
          </div>
          <div className="bookcase-bay">
            <ArtShelf variant={2} />
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
              <span className="window-sky window-sky--day" />
              <span className="window-sky window-sky--night" />
              <span className="window-shooting-star" />
              <span className="window-sun" />
              <span className="window-moon" />
              <span className="window-stars" />
              <span className="window-cloud window-cloud-a" />
              <span className="window-cloud window-cloud-b" />
              <span className="window-cloud window-cloud-c" />
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
              <DecorativeShelf seed={12} count={8} />
              <span aria-hidden="true" className="glass-pane" />
            </div>
            <div className="window-shelf">
              <DecorativeShelf seed={16} count={8} />
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
            <PlantShelf />
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

      <span aria-hidden="true" className="room-light room-light--day" />
      <span aria-hidden="true" className="room-light room-light--night" />
    </div>
  );
}

const DUMMY_COLORS = [
  "#8f6a4b",
  "#b08455",
  "#53799b",
  "#a36855",
  "#628c62",
  "#b8945a",
  "#866586",
  "#927b4c",
];
// Background stock: cloth spines with raised brass bands and a few title
// labels. The books flex to fill the shelf, so they keep real thickness at
// every window size instead of stretching into thin slivers.
const DUMMY_WIDTHS = [19, 23, 17, 25, 21, 18, 24, 22, 16, 23, 20, 25, 18, 21];
const DUMMY_HEIGHTS = [80, 74, 78, 69, 83, 76, 81, 71, 77, 75, 82, 73, 79, 68];

/** A quiet row of books on a shelf that is not part of the library. */
function DecorativeShelf({
  seed,
  count = 12,
}: {
  seed: number;
  count?: number;
}) {
  return (
    <div aria-hidden="true" className="dummy-shelf">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="dummy-book"
          style={{
            flexBasis: `${DUMMY_WIDTHS[(i + seed) % DUMMY_WIDTHS.length]}px`,
            height: `${DUMMY_HEIGHTS[(i + seed) % DUMMY_HEIGHTS.length]}%`,
            // Runs of three keep the shelf looking arranged, not speckled.
            backgroundColor:
              DUMMY_COLORS[(Math.floor(i / 3) + seed) % DUMMY_COLORS.length],
          }}
        >
          {i % 3 === 0 ? (
            <span
              className="dummy-book-label"
              style={{ top: `${21 + ((i + seed) % 3) * 4}%` }}
            />
          ) : null}
        </span>
      ))}
    </div>
  );
}

const ART_SHELVES = {
  1: [
    { size: "large", art: "dusk", tilt: "left" },
    { size: "small", art: "garden", tilt: "right" },
  ],
  2: [
    { size: "medium", art: "sea", tilt: "left" },
    { size: "small", art: "terracotta", tilt: "right" },
  ],
} as const;

/** Two small framed paintings resting on a cabinet shelf. */
function ArtShelf({ variant }: { variant: keyof typeof ART_SHELVES }) {
  return (
    <div aria-hidden="true" className="dummy-shelf art-shelf">
      {ART_SHELVES[variant].map((frame) => (
        <span
          key={frame.art}
          className={`shelf-frame shelf-frame--${frame.size} shelf-frame--${frame.tilt}`}
        >
          <span className={`shelf-art shelf-art--${frame.art}`} />
        </span>
      ))}
    </div>
  );
}

/** A few potted plants on the right-hand cabinet. */
function PlantShelf() {
  return (
    <div aria-hidden="true" className="dummy-shelf plant-shelf">
      <span className="sill-plant shelf-plant shelf-plant--tall" />
      <span className="sill-plant shelf-plant shelf-plant--small" />
      <span className="sill-plant shelf-plant shelf-plant--medium" />
    </div>
  );
}
