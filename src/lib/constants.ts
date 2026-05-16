// Domain types (SQLite schema uses String — these live here, not in @prisma/client)
export type JarSize   = "SMALL" | "MEDIUM" | "LARGE";
export type LineColor = "PURPLE" | "LIGHT_BLUE" | "RED" | "GREEN" | "YELLOW" | "GREY" | "PINK";
export type WickType  = "TYPE_1" | "TYPE_2";

export const COLOR_LINES: Record<LineColor, { color: string; line: string; hex: string }> = {
  PURPLE:     { color: "Purple",     line: "Lavender Bliss",      hex: "#a78bfa" },
  LIGHT_BLUE: { color: "Light Blue", line: "Tranquil Jasmine",    hex: "#7dd3fc" },
  RED:        { color: "Red",        line: "Vanilla Bourbon",     hex: "#ef4444" },
  GREEN:      { color: "Green",      line: "Pine and Cinnamon",   hex: "#22c55e" },
  YELLOW:     { color: "Yellow",     line: "Pomelo Paradise",     hex: "#eab308" },
  GREY:       { color: "Grey",       line: "Sacred Oud",          hex: "#9ca3af" },
  PINK:       { color: "Pink",       line: "Silk n Strawberry",   hex: "#f9a8d4" },
};

export const ALL_COLORS = Object.keys(COLOR_LINES) as LineColor[];
export const ALL_SIZES: JarSize[] = ["SMALL", "MEDIUM", "LARGE"];

// Prisma returns String fields — these helpers accept string and cast internally.
export const colorLine = (c: string) => COLOR_LINES[c as LineColor];
export const sizeLabel = (s: string) => SIZE_LABEL[s as JarSize];
export const wickLabel = (t: string) => WICK_LABEL[t as WickType];

export function wickRuleFor(size: string): { type: WickType; qty: number } {
  switch (size as JarSize) {
    case "SMALL":  return { type: "TYPE_1", qty: 1 };
    case "MEDIUM": return { type: "TYPE_2", qty: 2 };
    case "LARGE":  return { type: "TYPE_2", qty: 3 };
    default:       return { type: "TYPE_1", qty: 1 };
  }
}

// Low-stock thresholds (alerts only).
export const LOW_STOCK = {
  jarQty: 20,
  stickerQty: 20,
  wickStickerQty: 20,
  wickQty: 20,
  waxGrams: 10_000, // 10 kg
};

export const SIZE_LABEL: Record<JarSize, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

export const WICK_LABEL: Record<WickType, string> = {
  TYPE_1: "Wick Type 1",
  TYPE_2: "Wick Type 2",
};
