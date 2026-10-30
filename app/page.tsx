"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { LibraryView } from "@/components/library/LibraryView";
import { NewBookDialog } from "@/components/library/NewBookDialog";
import { BookOpening, type BookPagePreview, type BookRect } from "@/components/library/BookOpening";
import { BookClosing } from "@/components/library/BookClosing";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useLibrary } from "@/lib/useLibrary";
import { formatDay, pagesLabel } from "@/lib/format";
import { hasVisibleInk } from "@/lib/inkVisibility";
import { runsFromNote, runsToText } from "@/lib/textRuns";
import type { Note, Paper, Subject } from "@/lib/types";

function noteIsBlank(note: Note): boolean {
  if (note.title.trim().length > 0) return false;
  if (runsToText(runsFromNote(note)).trim().length > 0) return false;
  return !hasVisibleInk(note.ink ?? []);
}

function pagePreview(note: Note, notes: Note[]): BookPagePreview {
  const index = notes.findIndex((n) => n.id === note.id);
  const text = runsToText(runsFromNote(note))
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return {
    title: note.title.trim(),
    text: text.slice(0, 2000),
    date: formatDay(note.createdAt),
    pageNo: index >= 0 ? index + 1 : 1,
    totalPages: Math.max(notes.length, 1),
  };
}

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
    preview: BookPagePreview | null;
  } | null>(null);
  const [closing, setClosing] = useState<{
    subject: Subject;
    from: BookRect | null;
    preview: BookPagePreview | null;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [pageMotion, setPageMotion] = useState<
    "next" | "prev" | "open" | null
  >(null);
  const [pageFrom, setPageFrom] = useState<{
    note: Note;
    pageNo: number;
    totalPages: number;
  } | null>(null);
  const bookRects = useRef<Record<string, BookRect>>({});

  const subjectId = params.get("kitap");
  const noteId = params.get("not");

  const subject = subjectId
    ? (lib.store.subjects.find((s) => s.id === subjectId) ?? null)
    : null;

  const notesFor = lib.notesFor;
  const notes = useMemo(
    () => (subject ? notesFor(subject.id) : []),
    [subject, notesFor],
  );

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
    setPageMotion(null);
    setPageFrom(null);
    router.push("/", { scroll: false });
  }

  /** The reverse of opening: the cover closes over the page and flies back. */
  function closeBook() {
    if (!subject || closing) {
      goLibrary();
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      goLibrary();
      return;
    }

    setClosing({
      subject,
      preview: note ? pagePreview(note, notes) : null,
      from: bookRects.current[subject.id] ?? null,
    });
  }

  async function exportNotebook() {
    if (!subject || exporting || sharing) return;

    setExporting(true);
    try {
      const { downloadNotebookPdf } = await import("@/lib/pdf");
      await downloadNotebookPdf(subject, notes);
    } catch (error) {
      console.error(error);
      window.alert("PDF oluşturulamadı. Lütfen tekrar dene.");
    } finally {
      setExporting(false);
    }
  }

  async function shareNotebook() {
    if (!subject || exporting || sharing) return;

    setSharing(true);
    try {
      const { shareNotebookPdf } = await import("@/lib/pdf");
      const result = await shareNotebookPdf(subject, notes);
      if (result === "downloaded") {
        window.alert(
          "Bu tarayıcı dosya paylaşımını desteklemiyor. PDF indirildi.",
        );
      }
    } catch (error) {
      console.error(error);
      window.alert("PDF paylaşılamadı. Lütfen tekrar dene.");
    } finally {
      setSharing(false);
    }
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
    setPageMotion("open");
    setPageFrom(null);
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

    bookRects.current[subjectToOpen] = from;
    const bookNotes = lib.notesFor(subjectToOpen);
    const targetNote =
      bookNotes.find(
        (n) => n.id === lib.store.lastNoteBySubject[subjectToOpen],
      ) ??
      bookNotes[0] ??
      null;
    setOpening({
      subject: picked,
      from,
      preview: targetNote ? pagePreview(targetNote, bookNotes) : null,
    });
  }

  function turnPage(offset: number) {
    if (!subject || !note) return;
    const index = notes.findIndex((n) => n.id === note.id);
    if (index < 0) return;

    const target = notes[index + offset];
    const totalPages = Math.max(notes.length, 1);

    if (!target) {
      // Next on the last page opens a fresh page instead of stopping. If the
      // current page is already that fresh, empty page, leave it as it is.
      if (offset > 0 && !noteIsBlank(note)) {
        setPageMotion("next");
        setPageFrom({ note, pageNo: index + 1, totalPages });
        goNote(subject.id, lib.addNote(subject.id));
      }
      return;
    }

    // An empty last page is the page Next created. Going back removes it
    // rather than leaving an untouched sheet in the notebook.
    if (offset < 0 && index === notes.length - 1 && noteIsBlank(note)) {
      lib.deleteNote(subject.id, note.id);
      setPageMotion("prev");
      setPageFrom({ note, pageNo: index + 1, totalPages });
      goNote(subject.id, target.id);
      return;
    }

    setPageMotion(offset > 0 ? "next" : "prev");
    setPageFrom({ note, pageNo: index + 1, totalPages });
    goNote(subject.id, target.id);
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
        pageMotion={pageMotion}
        fromNote={pageFrom?.note ?? null}
        fromPageNo={pageFrom?.pageNo ?? null}
        fromTotalPages={pageFrom?.totalPages ?? null}
        subject={subject}
        note={note}
        pageNo={pageNo}
        totalPages={Math.max(notes.length, 1)}
        onChange={(patch) => lib.updateNote(note.id, patch)}
        onBack={closeBook}
        onPrev={() => turnPage(-1)}
        onNext={() => turnPage(1)}
        onExportPdf={exportNotebook}
        onSharePdf={shareNotebook}
        exporting={exporting}
        sharing={sharing}
        onDelete={() => {
          const ok = window.confirm("Delete this page?");
          if (!ok) return;
          lib.deleteNote(subject.id, note.id);

          const remaining = notes.filter((n) => n.id !== note.id);
          const next = remaining[Math.min(index, remaining.length - 1)];
          setPageMotion(null);
          setPageFrom(null);
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
        liftedId={opening?.subject.id ?? closing?.subject.id ?? null}
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
          preview={opening.preview}
          fading={Boolean(subject && note)}
          onNavigate={() => openBook(opening.subject.id)}
          onRemove={() => setOpening(null)}
        />
      ) : null}

      {closing ? (
        <BookClosing
          subject={closing.subject}
          preview={closing.preview}
          from={closing.from}
          onNavigate={goLibrary}
          onRemove={() => setClosing(null)}
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
        onOpenNote={(subjectToOpen, noteToOpen) => {
          setPageMotion(null);
          setPageFrom(null);
          goNote(subjectToOpen, noteToOpen);
        }}
      />
    </>
  );
}
