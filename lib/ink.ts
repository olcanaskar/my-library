import type { InkColor, Theme } from "./types";

export type InkPaletteEntry = {
  key: InkColor;
  name: string;
  value: string;
};

export const INK_COLORS_LIGHT: InkPaletteEntry[] = [
  { key: "ink", name: "Default", value: "#2a2a28" },
  { key: "red", name: "Red", value: "#b3261e" },
  { key: "blue", name: "Blue", value: "#1f4e8c" },
  { key: "green", name: "Green", value: "#2f6b3c" },
  { key: "gold", name: "Gold", value: "#a67c00" },
];

export const INK_COLORS_DARK: InkPaletteEntry[] = [
  { key: "ink", name: "Default", value: "#ece7da" },
  { key: "red", name: "Red", value: "#ff7a6e" },
  { key: "blue", name: "Blue", value: "#7ab0ff" },
  { key: "green", name: "Green", value: "#7bd98f" },
  { key: "gold", name: "Gold", value: "#ffd166" },
];

/** Ink saved before colour tokens existed stored raw hex values. */
const LEGACY_COLORS: Record<string, InkColor> = {
  "#2a2a28": "ink",
  "#b3261e": "red",
  "#1f4e8c": "blue",
  "#2f6b3c": "green",
  "#a67c00": "gold",
  "#f2eee4": "ink",
  "#ff7a6e": "red",
  "#7ab0ff": "blue",
  "#7bd98f": "green",
  "#ffd166": "gold",
};

export function inkPalette(theme: Theme): InkPaletteEntry[] {
  return theme === "dark" ? INK_COLORS_DARK : INK_COLORS_LIGHT;
}

export function resolveInkColor(color: string, theme: Theme): string {
  const normalized = typeof color === "string" ? color.toLowerCase() : "ink";
  const key = LEGACY_COLORS[normalized] ?? normalized;
  return (
    inkPalette(theme).find((entry) => entry.key === key)?.value ?? color
  );
}
