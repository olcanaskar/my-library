"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookView } from "@/components/book/BookView";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { LibraryView } from "@/components/library/LibraryView";
import { NewBookDialog } from "@/components/library/NewBookDialog";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useLibrary } from "@/lib/useLibrary";
import { pagesLabel } from "@/lib/format";
import type { Paper } from "@/lib/types";

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

  const subjectId = params.get("kitap");
  const noteId = params.get("not");

  const subject = subjectId
    ? (lib.store.subjects.find((s) => s.id === subjectId) ?? null)
    : null;

  const note =
    subject && noteId
      ? (lib.store.notes.find(
          (n) => n.id === noteId && n.subjectId === subject.id,
        ) ?? null)
      : null;

  function goLibrary() {
    router.push("/", { scroll: false });
  }

  function goBook(id: string) {
    router.push(`/?kitap=${encodeURIComponent(id)}`, { scroll: false });
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

  function handleCreateBook(input: {
    name: string;
    color: string;
    paper: Paper;
  }) {
    const id = lib.addSubject(input);
    setNewBookOpen(false);
    goBook(id);
  }

  if (!lib.ready) return <Boot />;

  let view: React.ReactNode;

  if (subject && note) {
    const notes = lib.notesFor(subject.id);
    const index = notes.findIndex((n) => n.id === note.id);
    const pageNo = index >= 0 ? index + 1 : 1;

    view = (
      <NoteEditor
        subject={subject}
        note={note}
        pageNo={pageNo}
        totalPages={Math.max(notes.length, 1)}
        onChange={(patch) => lib.updateNote(note.id, patch)}
        onBack={() => goBook(subject.id)}
        onDelete={() => {
          const ok = window.confirm("Delete this page?");
          if (!ok) return;
          lib.deleteNote(subject.id, note.id);
          goBook(subject.id);
        }}
      />
    );
  } else if (subject) {
    const notes = lib.notesFor(subject.id);
    const lastId = lib.store.lastNoteBySubject[subject.id];
    const bookmark = notes.find((n) => n.id === lastId) ?? null;

    view = (
      <BookView
        subject={subject}
        notes={notes}
        bookmark={bookmark}
        onBack={goLibrary}
        onNewNote={() => {
          const id = lib.addNote(subject.id);
          goNote(subject.id, id);
        }}
        onOpenNote={(noteToOpen) => goNote(subject.id, noteToOpen)}
        onDelete={() => {
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
        onOpenBook={goBook}
        onNewBook={() => setNewBookOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleTheme={lib.toggleTheme}
      />
    );
  }

  return (
    <>
      {view}

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
