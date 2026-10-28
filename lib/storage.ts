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
 * İlk açılışta boş bir kitaplık yerine örnek bir kütüphane gösterilir.
 * Kullanıcı kitapları silerse tekrar tohumlanmaz (çünkü store artık boş değil).
 */
export function seedStore(): Store {
  const now = Date.now();
  const day = 86_400_000;

  const subjects: Subject[] = [
    {
      id: "mat",
      name: "Matematik",
      color: "#4a5c9e",
      paper: "grid",
      createdAt: now - 4 * day,
      order: 0,
    },
    {
      id: "fiz",
      name: "Fizik",
      color: "#3e7c8c",
      paper: "dotted",
      createdAt: now - 3 * day,
      order: 1,
    },
    {
      id: "ede",
      name: "Edebiyat",
      color: "#c05746",
      paper: "lined",
      createdAt: now - 2 * day,
      order: 2,
    },
    {
      id: "tar",
      name: "Tarih",
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
      title: "Türev — giriş",
      body:
        "Bir fonksiyonun bir noktadaki türevi, o noktadaki teğetin eğimidir.\n\nf'(x) = lim (h→0) [f(x+h) − f(x)] / h\n\nTemel kurallar:\n- (xⁿ)' = n · xⁿ⁻¹\n- (sin x)' = cos x\n- (eˣ)' = eˣ\n- (ln x)' = 1/x\n\nSınavda türev tanımı sorulursa limit ifadesini yazmadan geçme.",
      createdAt: now - 3 * day,
      updatedAt: now - 2 * day,
    },
    {
      id: "n2",
      subjectId: "mat",
      title: "Limit — belirsizlikler",
      body:
        "0/0 ve ∞/∞ belirsizliklerinde L'Hôpital uygulanır.\n\nÖrnek: lim (x→0) sin x / x = 1\n\nNot: payda sıfıra gidiyorsa önce sadeleştirmeyi dene, L'Hôpital son çare.",
      createdAt: now - 2 * day,
      updatedAt: now - 2 * day,
    },
    {
      id: "n3",
      subjectId: "ede",
      title: "Cumhuriyet Dönemi — ilk yıllar",
      body:
        "1923–1930 arası öne çıkanlar:\n- 1923: Cumhuriyet ilanı\n- 1924: Tevhid-i Tedrisat, halifeliğin kaldırılması\n- 1926: Medeni Kanun\n- 1928: Harf devrimi\n\nKronoloji sorusu gelirse yıl–olay eşleştirmesi isteniyor.",
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
      // Bozuk/eski sürüm: veriyi kaybetmemek için yedekle, sonra taze başla.
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
    // Kota dolu ya da gizli mod: uygulama çalışmaya devam etsin.
  }
}
