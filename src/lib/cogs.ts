import { prisma } from "@/lib/prisma";

export async function computeCogsForRecipe(userId: string, recipeId: string): Promise<number> {
  const r = await prisma.candleRecipe.findFirst({
    where: { id: recipeId, userId },
    include: {
      waxes:  { include: { wax: true } },
      scents: { include: { scent: true } },
    },
  });
  if (!r) throw new Error("Recipe not found");
  return computeCogs({
    userId,
    sizeId:  r.sizeId,
    colorId: r.colorId,
    waxes:   r.waxes.map((x) => ({ grams: x.grams, unitCostPerG: x.wax.unitCostPerG })),
    scents:  r.scents.map((x) => ({ ml: x.ml, unitCostPerMl: x.scent.unitCostPerMl })),
  });
}

export async function computeCogs(input: {
  userId: string;
  sizeId: string;
  colorId: string;
  waxes: { grams: number; unitCostPerG: number }[];
  scents: { ml: number; unitCostPerMl: number }[];
}): Promise<number> {
  const { userId, sizeId, colorId } = input;
  const [rule, ws, jar, sticker] = await Promise.all([
    prisma.wickRule.findUnique({ where: { userId_sizeId: { userId, sizeId } }, include: { wick: true } }),
    prisma.wickSticker.findUnique({ where: { userId } }),
    prisma.jar.findUnique({ where: { userId_sizeId_colorId: { userId, sizeId, colorId } } }),
    prisma.sticker.findUnique({ where: { userId_sizeId_colorId: { userId, sizeId, colorId } } }),
  ]);

  const waxCost   = input.waxes.reduce((s, w) => s + w.grams * w.unitCostPerG, 0);
  const scentCost = input.scents.reduce((s, x) => s + x.ml * x.unitCostPerMl, 0);
  const wickQty   = rule?.qty ?? 0;
  const wickCost  = (rule?.wick.unitCost ?? 0) * wickQty;
  const wsCost    = (ws?.unitCost ?? 0) * wickQty;
  const jarCost   = jar?.unitCost ?? 0;
  const stkCost   = sticker?.unitCost ?? 0;

  return waxCost + scentCost + wickCost + wsCost + jarCost + stkCost;
}
