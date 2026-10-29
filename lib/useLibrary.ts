"use client";

import { useCallback, useEffect, useState } from "react";
import { loadStore, saveStore } from "./storage";
import { newId } from "./id";
import { useHydrated } from "./useHydrated";
import type { Note, Paper, Store, Subject } from "./types";

export type NewSubjectInput = {
  name: string;
  color: string;
  paper: Paper;
};

export function useLibrary() {
  const [store, setStore] = useState<Store>(() => loadStore());
  const ready = useHydrated();

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => saveStore(store), 250);
    return () => window.clearTimeout(timer);
  }, [store, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = store.theme;
  }, [store.theme, ready]);

  const addSubject = useCallback((input: NewSubjectInput) => {
    const id = newId();
    const subject: Subject = {
      id,
      name: input.name.trim(),
      color: input.color,
      paper: input.paper,
      createdAt: Date.now(),
      order: 0,
    };

    setStore((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { ...subject, order: prev.subjects.length }],
    }));

    return id;
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setStore((prev) => {
      const lastNoteBySubject = { ...prev.lastNoteBySubject };
      delete lastNoteBySubject[subjectId];

      return {
        ...prev,
        subjects: prev.subjects.filter((s) => s.id !== subjectId),
        notes: prev.notes.filter((n) => n.subjectId !== subjectId),
        lastNoteBySubject,
      };
    });
  }, []);

  const addNote = useCallback((subjectId: string) => {
    const id = newId();
    const now = Date.now();
    const note: Note = {
      id,
      subjectId,
      title: "",
      body: "",
      createdAt: now,
      updatedAt: now,
    };

    setStore((prev) => ({
      ...prev,
      notes: [...prev.notes, note],
      lastNoteBySubject: { ...prev.lastNoteBySubject, [subjectId]: id },
    }));

    return id;
  }, []);

  const updateNote = useCallback(
    (
      noteId: string,
      patch: Partial<
        Pick<Note, "title" | "body" | "ink" | "textColor" | "textRuns">
      >,
    ) => {
      setStore((prev) => ({
        ...prev,
        notes: prev.notes.map((n) =>
          n.id === noteId ? { ...n, ...patch, updatedAt: Date.now() } : n,
        ),
      }));
    },
    [],
  );

  const deleteNote = useCallback((subjectId: string, noteId: string) => {
    setStore((prev) => {
      const lastNoteBySubject = { ...prev.lastNoteBySubject };
      if (lastNoteBySubject[subjectId] === noteId) {
        delete lastNoteBySubject[subjectId];
      }

      return {
        ...prev,
        notes: prev.notes.filter((n) => n.id !== noteId),
        lastNoteBySubject,
      };
    });
  }, []);

  const touchNote = useCallback((subjectId: string, noteId: string) => {
    setStore((prev) =>
      prev.lastNoteBySubject[subjectId] === noteId
        ? prev
        : {
            ...prev,
            lastNoteBySubject: {
              ...prev.lastNoteBySubject,
              [subjectId]: noteId,
            },
          },
    );
  }, []);

  const toggleTheme = useCallback(() => {
    setStore((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark",
    }));
  }, []);

  /** Keep page numbers stable: order by creation time. */
  const notesFor = useCallback(
    (subjectId: string) =>
      store.notes
        .filter((n) => n.subjectId === subjectId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [store.notes],
  );

  return {
    store,
    ready,
    addSubject,
    deleteSubject,
    addNote,
    updateNote,
    deleteNote,
    touchNote,
    toggleTheme,
    notesFor,
  };
}

export type Library = ReturnType<typeof useLibrary>;
