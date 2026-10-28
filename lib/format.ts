const dayFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
});

const shortFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDay(ts: number): string {
  if (!ts) return "";
  return dayFormat.format(new Date(ts));
}

export function formatShort(ts: number): string {
  if (!ts) return "";
  return shortFormat.format(new Date(ts));
}

export function formatClock(ts: number): string {
  if (!ts) return "";
  return timeFormat.format(new Date(ts));
}
