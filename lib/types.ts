export type Paper = "lined" | "grid" | "dotted" | "plain";

export type Subject = {
  id: string;
  name: string;
  color: string;
  paper: Paper;
  createdAt: number;
  order: number;
};

export type InkPoint = {
  x: number;
  y: number;
  p: number;
};

/** Semantic ink names, so strokes keep their meaning across themes. */
export type InkColor = "ink" | "red" | "blue" | "green" | "gold";

export type InkStroke = {
  color: InkColor;
  size: number;
  mode: "pen" | "eraser";
  points: InkPoint[];
};

/** A contiguous stretch of typed text in one colour. */
export type TextRun = {
  text: string;
  color: InkColor;
};

/** A photo or diagram imported onto a note page. */
export type NoteImage = {
  id: string;
  /** Resized data URL, kept small enough for localStorage. */
  src: string;
  width: number;
  height: number;
  name?: string;
};

export type Note = {
  id: string;
  subjectId: string;
  title: string;
  body: string;
  /** Colour used for the next typed characters. */
  textColor?: InkColor;
  /** Typed text split into coloured runs; `body` is their concatenation. */
  textRuns?: TextRun[];
  /** Freehand ink, normalised to the page canvas. */
  ink?: InkStroke[];
  /** Photos and diagrams pasted below the writing area. */
  images?: NoteImage[];
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
  { value: "lined", label: "Lined", hint: "Literature, history" },
  { value: "grid", label: "Grid", hint: "Maths, physics" },
  { value: "dotted", label: "Dotted", hint: "Plans, sketching" },
  { value: "plain", label: "Plain", hint: "Anything" },
];

export function paperClass(paper: Paper): string {
  return `paper-${paper}`;
}

export function paperLabel(paper: Paper): string {
  return PAPERS.find((p) => p.value === paper)?.label ?? "Plain";
}
