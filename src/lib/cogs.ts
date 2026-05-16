import { prisma } from "@/lib/prisma";
import { wickRuleFor } from "@/lib/constants";
import { JarSize, LineColor } from "@/lib/constants";

// Returns the per-unit material cost for one candle of a recipe.
// Looks up live prices on wax/scent/wick/jar/sticker rows.
export async function computeCogsForRecipe(recipeId: string): Promise<number> {
  const r = await prisma.candleRecipe.findUnique({
    where: { id: recipeId },
    include: {
      waxes:  { include: { wax: true } },
      scents: { include: { scent: true } },
    },
  });
  if (!r) throw new Error("Recipe not found");
  return computeCogs({
    jarSize: r.jarSize,
    color:   r.color,
    waxes:   r.waxes.map(x => ({ grams: x.grams, unitCostPerG: x.wax.unitCostPerG })),
    scents:  r.scents.map(x => ({ ml: x.ml, unitCostPerMl: x.scent.unitCostPerMl })),
  });
}

export async function computeCogs(input: {
  jarSize: JarSize;
  color: LineColor;
  waxes: { grams: number; unitCostPerG: number }[];
  scents: { ml: number; unitCostPerMl: number }[];
}): Promise<number> {
  const { type: wickType, qty: wickQty } = wickRuleFor(input.jarSize);
  const [wick, ws, jar, sticker] = await Promise.all([
    prisma.wick.findUnique({ where: { type: wickType } }),
    prisma.wickSticker.findFirst(),
    prisma.jar.findUnique({ where: { size_color: { size: input.jarSize, color: input.color } } }),
    prisma.sticker.findUnique({ where: { size_color: { size: input.jarSize, color: input.color } } }),
  ]);

  const waxCost   = input.waxes.reduce((s, w) => s + w.grams * w.unitCostPerG, 0);
  const scentCost = input.scents.reduce((s, x) => s + x.ml * x.unitCostPerMl, 0);
  const wickCost  = (wick?.unitCost ?? 0) * wickQty;
  const wsCost    = (ws?.unitCost ?? 0) * wickQty; // wick sticker count = wick count
  const jarCost   = jar?.unitCost ?? 0;
  const stkCost   = sticker?.unitCost ?? 0;

  return waxCost + scentCost + wickCost + wsCost + jarCost + stkCost;
}
