import type { Note, Store, Subject } from "./types";

export const STORAGE_KEY = "kutuphanem.v1";

export function emptyStore(): Store {
  return {
    version: 1,
    subjects: [],
    notes: [],
    lastNoteBySubject: {},
    theme: "light",
  };
}

/**
 * On first launch the library is seeded with sample subjects instead of
 * showing an empty shelf. If the user deletes everything, it is not seeded
 * again (the store exists, it is just empty).
 */
export function seedStore(): Store {
  const now = Date.now();
  const day = 86_400_000;

  const subjects: Subject[] = [
    {
      id: "mat",
      name: "Mathematics",
      color: "#4a5c9e",
      paper: "grid",
      createdAt: now - 4 * day,
      order: 0,
    },
    {
      id: "phy",
      name: "Physics",
      color: "#3e7c8c",
      paper: "dotted",
      createdAt: now - 3 * day,
      order: 1,
    },
    {
      id: "lit",
      name: "Literature",
      color: "#c05746",
      paper: "lined",
      createdAt: now - 2 * day,
      order: 2,
    },
    {
      id: "his",
      name: "History",
      color: "#c9a227",
      paper: "lined",
      createdAt: now - 1 * day,
      order: 3,
    },
  ];

  const notes: Note[] = [
    {
      id: "n1",
      subjectId: "mat",
      title: "Derivatives — intro",
      body:
        "The derivative at a point is the slope of the tangent line there.\n\nf'(x) = lim (h→0) [f(x+h) − f(x)] / h\n\nCore rules:\n- (xⁿ)' = n · xⁿ⁻¹\n- (sin x)' = cos x\n- (eˣ)' = eˣ\n- (ln x)' = 1/x\n\nIf the exam asks for the definition, do not skip the limit expression.",
      createdAt: now - 3 * day,
      updatedAt: now - 2 * day,
    },
    {
      id: "n2",
      subjectId: "mat",
      title: "Limits — indeterminate forms",
      body:
        "For 0/0 and ∞/∞ apply L'Hôpital.\n\nExample: lim (x→0) sin x / x = 1\n\nNote: try simplifying first, L'Hôpital is the last resort.",
      createdAt: now - 2 * day,
      updatedAt: now - 2 * day,
    },
    {
      id: "n3",
      subjectId: "lit",
      title: "Modernism — early 20th century",
      body:
        "Key shifts around 1900–1930:\n- Free verse replaces fixed metre\n- Interior monologue\n- Stream of consciousness\n\nChronology questions usually ask for author–work pairs.",
      createdAt: now - day,
      updatedAt: now - day,
    },
  ];

  return {
    version: 1,
    subjects,
    notes,
    lastNoteBySubject: { mat: "n1" },
    theme: "light",
  };
}

function isValidStore(value: unknown): value is Store {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Store>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.subjects) &&
    Array.isArray(candidate.notes)
  );
}

export function loadStore(): Store {
  if (typeof window === "undefined") return emptyStore();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedStore();

    const parsed: unknown = JSON.parse(raw);
    if (!isValidStore(parsed)) {
      // Corrupt or outdated data: keep a backup, then start fresh.
      window.localStorage.setItem(`${STORAGE_KEY}.backup`, raw);
      return seedStore();
    }

    return {
      ...emptyStore(),
      ...parsed,
      lastNoteBySubject: parsed.lastNoteBySubject ?? {},
      theme: parsed.theme === "dark" ? "dark" : "light",
    };
  } catch {
    return seedStore();
  }
}

export function saveStore(store: Store): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota full or private mode: keep the app usable.
  }
}
