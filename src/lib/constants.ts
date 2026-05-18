export const LOW_STOCK = {
  jarQty: 20,
  stickerQty: 20,
  wickStickerQty: 20,
  wickQty: 20,
  waxGrams: 10_000,
};

export const DEFAULT_SIZES = [
  { name: "Small", sortOrder: 0 },
  { name: "Medium", sortOrder: 1 },
  { name: "Large", sortOrder: 2 },
] as const;

export const DEFAULT_COLORS = [
  { name: "Purple",     hex: "#a78bfa", scentLine: "Lavender Bliss" },
  { name: "Light Blue", hex: "#7dd3fc", scentLine: "Tranquil Jasmine" },
  { name: "Red",        hex: "#ef4444", scentLine: "Vanilla Bourbon" },
  { name: "Green",      hex: "#22c55e", scentLine: "Pine and Cinnamon" },
  { name: "Yellow",     hex: "#eab308", scentLine: "Pomelo Paradise" },
  { name: "Grey",       hex: "#9ca3af", scentLine: "Sacred Oud" },
  { name: "Pink",       hex: "#f9a8d4", scentLine: "Silk n Strawberry" },
] as const;

export const DEFAULT_WICKS = [
  { name: "Type 1" },
  { name: "Type 2" },
] as const;

export const DEFAULT_WICK_RULES = [
  { sizeName: "Small",  wickName: "Type 1", qty: 1 },
  { sizeName: "Medium", wickName: "Type 2", qty: 2 },
  { sizeName: "Large",  wickName: "Type 2", qty: 3 },
] as const;
