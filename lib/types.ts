export type Paper = "lined" | "grid" | "dotted" | "plain";

export type Subject = {
  id: string;
  name: string;
  color: string;
  paper: Paper;
  createdAt: number;
  order: number;
};

export type Note = {
  id: string;
  subjectId: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export type Theme = "light" | "dark";

export type Store = {
  version: 1;
  subjects: Subject[];
  notes: Note[];
  lastNoteBySubject: Record<string, string>;
  theme: Theme;
};

export const SUBJECT_COLORS = [
  "#4a5c9e",
  "#3e7c8c",
  "#5b8c5a",
  "#c9a227",
  "#d08c3c",
  "#c05746",
  "#a8557a",
  "#7c5c9e",
] as const;

export const PAPERS: { value: Paper; label: string; hint: string }[] = [
  { value: "lined", label: "Çizgili", hint: "Edebiyat, tarih" },
  { value: "grid", label: "Kareli", hint: "Matematik, fizik" },
  { value: "dotted", label: "Noktalı", hint: "Plan, karalama" },
  { value: "plain", label: "Düz", hint: "Serbest" },
];

export function paperClass(paper: Paper): string {
  return `paper-${paper}`;
}

export function paperLabel(paper: Paper): string {
  return PAPERS.find((p) => p.value === paper)?.label ?? "Düz";
}
