const dayFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
});

const shortFormat = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDay(ts: number): string {
  if (!ts) return "";
  return dayFormat.format(new Date(ts));
}

export function formatShort(ts: number): string {
  if (!ts) return "";
  return shortFormat.format(new Date(ts));
}

export function pagesLabel(count: number): string {
  return `${count} ${count === 1 ? "page" : "pages"}`;
}

export function subjectsLabel(count: number): string {
  return `${count} ${count === 1 ? "subject" : "subjects"}`;
}
