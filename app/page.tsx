"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { LibraryView } from "@/components/library/LibraryView";
import { NewBookDialog } from "@/components/library/NewBookDialog";
import { BookOpening, type BookRect } from "@/components/library/BookOpening";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useLibrary } from "@/lib/useLibrary";
import { pagesLabel } from "@/lib/format";
import type { Paper, Subject } from "@/lib/types";

export default function Page() {
  return (
    <Suspense fallback={<Boot />}>
      <App />
    </Suspense>
  );
}

function Boot() {
  return <div className="min-h-dvh" aria-busy="true" />;
}

function App() {
  const lib = useLibrary();
  const router = useRouter();
  const params = useSearchParams();

  const [newBookOpen, setNewBookOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [opening, setOpening] = useState<{
    subject: Subject;
    from: BookRect;
  } | null>(null);

  const subjectId = params.get("kitap");
  const noteId = params.get("not");

  const subject = subjectId
    ? (lib.store.subjects.find((s) => s.id === subjectId) ?? null)
    : null;

  const notes = subject ? lib.notesFor(subject.id) : [];

  // The URL is the source of truth, but a stale link (deleted page, old
  // bookmark) falls back to the page the reader left off on.
  const requestedNote = noteId
    ? (notes.find((n) => n.id === noteId) ?? null)
    : null;
  const note =
    requestedNote ??
    notes.find((n) => n.id === lib.store.lastNoteBySubject[subject?.id ?? ""]) ??
    notes[0] ??
    null;

  function goLibrary() {
    router.push("/", { scroll: false });
  }

  function goNote(subjectToOpen: string, noteToOpen: string) {
    lib.touchNote(subjectToOpen, noteToOpen);
    router.push(
      `/?kitap=${encodeURIComponent(subjectToOpen)}&not=${encodeURIComponent(
        noteToOpen,
      )}`,
      { scroll: false },
    );
  }

  /** Opening a book jumps straight into a page: no page list in between. */
  function openBook(subjectToOpen: string) {
    const bookNotes = lib.notesFor(subjectToOpen);

    if (bookNotes.length === 0) {
      goNote(subjectToOpen, lib.addNote(subjectToOpen));
      return;
    }

    const remembered =
      bookNotes.find(
        (n) => n.id === lib.store.lastNoteBySubject[subjectToOpen],
      ) ?? bookNotes[0];

    goNote(subjectToOpen, remembered.id);
  }

  /** A spine click: play the book coming off the shelf, then open its page. */
  function handleOpenBook(subjectToOpen: string, from: BookRect | null) {
    const picked = lib.store.subjects.find((s) => s.id === subjectToOpen);

    if (!picked || !from) {
      openBook(subjectToOpen);
      return;
    }

    setOpening({ subject: picked, from });
  }

  function turnPage(offset: number) {
    if (!subject || !note) return;
    const index = notes.findIndex((n) => n.id === note.id);
    const target = notes[index + offset];
    if (target) goNote(subject.id, target.id);
  }

  function addPage() {
    if (!subject) return;
    goNote(subject.id, lib.addNote(subject.id));
  }

  function handleCreateBook(input: {
    name: string;
    color: string;
    paper: Paper;
  }) {
    const id = lib.addSubject(input);
    setNewBookOpen(false);
    openBook(id);
  }

  // Keep the URL honest without rendering a page the reader never chose.
  useEffect(() => {
    if (!lib.ready || !subject) return;

    if (!note) {
      router.replace("/", { scroll: false });
      return;
    }

    if (noteId !== note.id) {
      router.replace(
        `/?kitap=${encodeURIComponent(subject.id)}&not=${encodeURIComponent(
          note.id,
        )}`,
        { scroll: false },
      );
    }
  }, [lib.ready, note, noteId, router, subject]);

  if (!lib.ready) return <Boot />;

  let view: React.ReactNode;

  if (subject && note) {
    const index = notes.findIndex((n) => n.id === note.id);
    const pageNo = index >= 0 ? index + 1 : 1;

    view = (
      <NoteEditor
        key={note.id}
        theme={lib.store.theme}
        subject={subject}
        note={note}
        pageNo={pageNo}
        totalPages={Math.max(notes.length, 1)}
        onChange={(patch) => lib.updateNote(note.id, patch)}
        onBack={goLibrary}
        onPrev={() => turnPage(-1)}
        onNext={() => turnPage(1)}
        onNewPage={addPage}
        onDelete={() => {
          const ok = window.confirm("Delete this page?");
          if (!ok) return;
          lib.deleteNote(subject.id, note.id);

          const remaining = notes.filter((n) => n.id !== note.id);
          const next = remaining[Math.min(index, remaining.length - 1)];
          if (next) {
            goNote(subject.id, next.id);
          } else {
            goLibrary();
          }
        }}
        onDeleteNotebook={() => {
          const ok = window.confirm(
            `Delete "${subject.name}" and all ${pagesLabel(notes.length)}?`,
          );
          if (!ok) return;
          lib.deleteSubject(subject.id);
          goLibrary();
        }}
      />
    );
  } else {
    view = (
      <LibraryView
        subjects={lib.store.subjects}
        notes={lib.store.notes}
        theme={lib.store.theme}
        liftedId={opening?.subject.id ?? null}
        onOpenBook={handleOpenBook}
        onNewBook={() => setNewBookOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleTheme={lib.toggleTheme}
      />
    );
  }

  return (
    <>
      {view}

      {opening ? (
        <BookOpening
          subject={opening.subject}
          from={opening.from}
          fading={Boolean(subject && note)}
          onNavigate={() => openBook(opening.subject.id)}
          onRemove={() => setOpening(null)}
        />
      ) : null}

      <NewBookDialog
        open={newBookOpen}
        onClose={() => setNewBookOpen(false)}
        onCreate={handleCreateBook}
      />

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        notes={lib.store.notes}
        subjects={lib.store.subjects}
        onOpenNote={goNote}
      />
    </>
  );
}
