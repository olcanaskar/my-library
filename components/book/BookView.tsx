"use client";

import { formatShort } from "@/lib/format";
import { paperLabel, type Note, type Subject } from "@/lib/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";

type BookViewProps = {
  subject: Subject;
  notes: Note[];
  bookmark: Note | null;
  onBack: () => void;
  onNewNote: () => void;
  onOpenNote: (noteId: string) => void;
  onDelete: () => void;
};

export function BookView({
  subject,
  notes,
  bookmark,
  onBack,
  onNewNote,
  onOpenNote,
  onDelete,
}: BookViewProps) {
  return (
    <div className="min-h-dvh pb-20">
      <header className="sticky top-0 z-10 border-b border-rule/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-3 sm:px-5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kitaplığa dön"
            className="rounded-lg p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <h1 className="truncate font-hand text-2xl leading-none">
                {subject.name}
              </h1>
            </div>
            <p className="mt-1 text-[11px] text-ink-soft">
              {notes.length} sayfa · {paperLabel(subject.paper)} defter
            </p>
          </div>

          <button
            type="button"
            onClick={onNewNote}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-paper transition hover:opacity-90"
          >
            <PlusIcon className="h-4 w-4" />
            Sayfa
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Defteri sil"
            className="rounded-lg p-2 text-ink-soft transition hover:bg-red-500/10 hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-5">
        {bookmark ? (
          <button
            type="button"
            onClick={() => onOpenNote(bookmark.id)}
            className="group mb-4 flex w-full items-center gap-3 rounded-lg border border-dashed border-ink/20 bg-card px-4 py-3 text-left transition hover:border-ink/35 hover:shadow-sm"
          >
            <BookmarkIcon className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-medium tracking-widest text-ink-soft uppercase">
                Kaldığın yer
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium">
                {bookmark.title || "Başlıksız sayfa"}
              </span>
            </span>
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-soft transition group-hover:translate-x-0.5" />
          </button>
        ) : null}

        {notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/20 bg-card/60 px-6 py-12 text-center">
            <h2 className="font-hand text-2xl">Bu defter henüz boş</h2>
            <p className="mt-1 text-sm text-ink-soft">
              İlk sayfayı aç, {subject.name} notların burada biriksin.
            </p>
            <button
              type="button"
              onClick={onNewNote}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-paper transition hover:opacity-90"
            >
              <PlusIcon className="h-4 w-4" />
              İlk sayfayı aç
            </button>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {notes.map((note, index) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => onOpenNote(note.id)}
                  className="flex w-full items-start gap-3 rounded-lg border border-rule/70 bg-card px-4 py-3 text-left transition hover:border-ink/20 hover:shadow-sm"
                >
                  <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-xs text-ink-soft">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium">
                        {note.title || "Başlıksız sayfa"}
                      </span>
                      <span className="shrink-0 text-[11px] text-ink-soft">
                        {formatShort(note.updatedAt)}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm text-ink-soft">
                      {note.body.trim() || "Boş sayfa"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
