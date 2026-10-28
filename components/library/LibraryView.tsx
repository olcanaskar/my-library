"use client";

import type { Note, Subject } from "@/lib/types";
import { paperLabel } from "@/lib/types";
import {
  BookIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
} from "@/components/ui/icons";
import { BookSpine } from "./BookSpine";

type LibraryViewProps = {
  subjects: Subject[];
  notes: Note[];
  theme: "light" | "dark";
  onOpenBook: (id: string) => void;
  onNewBook: () => void;
  onOpenSearch: () => void;
  onToggleTheme: () => void;
};

export function LibraryView({
  subjects,
  notes,
  theme,
  onOpenBook,
  onNewBook,
  onOpenSearch,
  onToggleTheme,
}: LibraryViewProps) {
  const countBySubject = new Map<string, number>();
  for (const note of notes) {
    countBySubject.set(note.subjectId, (countBySubject.get(note.subjectId) ?? 0) + 1);
  }

  return (
    <div className="min-h-dvh pb-16">
      <header className="mx-auto flex max-w-5xl items-end justify-between gap-3 px-4 pt-9 pb-6 sm:px-5 sm:pt-10">
        <div className="min-w-0">
          <h1 className="font-hand text-4xl leading-none sm:text-5xl md:text-6xl">
            Kütüphanem
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {subjects.length} ders · {notes.length} sayfa
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Notlarda ara"
            className="rounded-lg p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Aydınlık tema" : "Karanlık tema"}
            className="rounded-lg p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={onNewBook}
            aria-label="Yeni kitap ekle"
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-ink px-2.5 py-2 text-sm font-medium text-paper transition hover:opacity-90 sm:px-3"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Kitap</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        {subjects.length === 0 ? (
          <div className="mx-auto mt-10 max-w-sm rounded-xl border border-dashed border-ink/20 bg-card/60 px-6 py-12 text-center">
            <BookIcon className="mx-auto h-10 w-10 text-ink-soft/70" />
            <h2 className="mt-4 font-hand text-2xl">Kitaplık boş</h2>
            <p className="mt-1 text-sm text-ink-soft">
              İlk dersini ekle, defterin rafındaki yerini alsın.
            </p>
            <button
              type="button"
              onClick={onNewBook}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-paper transition hover:opacity-90"
            >
              <PlusIcon className="h-4 w-4" />
              Yeni kitap
            </button>
          </div>
        ) : (
          <>
            {/* Mobil: kapak ızgarası */}
            <div className="grid grid-cols-2 gap-4 sm:hidden">
              {subjects.map((subject) => {
                const count = countBySubject.get(subject.id) ?? 0;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => onOpenBook(subject.id)}
                    className="group relative flex aspect-3/4 flex-col justify-between overflow-hidden rounded-md p-3 text-left shadow-[inset_-4px_0_0_rgba(0,0,0,0.16),0_8px_14px_-8px_rgba(0,0,0,0.5)] transition active:scale-[0.98]"
                    style={{ backgroundColor: subject.color }}
                  >
                    <span className="text-[10px] font-medium tracking-wider text-white/70 uppercase">
                      {paperLabel(subject.paper)}
                    </span>
                    <span className="font-hand text-2xl leading-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
                      {subject.name}
                    </span>
                    <span className="text-[11px] text-white/75">
                      {count} sayfa
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Masaüstü: raf */}
            <div className="hidden sm:block">
              <div className="shelf-scroll overflow-x-auto pb-1">
                <div className="flex min-w-max items-end justify-center gap-2.5 px-6 pt-8">
                  {subjects.map((subject) => (
                    <BookSpine
                      key={subject.id}
                      subject={subject}
                      noteCount={countBySubject.get(subject.id) ?? 0}
                      onOpen={() => onOpenBook(subject.id)}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={onNewBook}
                    aria-label="Yeni ders ekle"
                    className="flex h-56 w-14 shrink-0 items-center justify-center rounded-t-[3px] border border-dashed border-ink/25 text-ink-soft transition hover:border-ink/50 hover:bg-card/50 hover:text-ink"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="h-3.5 rounded-b-[3px] bg-gradient-to-b from-shelf to-shelf-edge" />
              <div className="mx-1 h-2 rounded-b-md bg-black/10" />
            </div>
          </>
        )}

        <p className="mt-10 text-center text-xs text-ink-soft/80">
          Notların bu cihazda saklanır. İnternet olmadan da açılır.
        </p>
      </main>
    </div>
  );
}
