import { prisma } from "@/lib/prisma";

export async function computeCogsForRecipe(userId: string, recipeId: string): Promise<number> {
  const r = await prisma.candleRecipe.findFirst({
    where: { id: recipeId, userId },
    include: {
      waxes:  { include: { wax: true } },
      scents: { include: { scent: true } },
      jar: true,
      sticker: true,
    },
  });
  if (!r) throw new Error("Recipe not found");

  const waxCost   = r.waxes.reduce((s, w) => s + w.grams * w.wax.unitCostPerG, 0);
  const scentCost = r.scents.reduce((s, x) => s + x.ml    * x.scent.unitCostPerMl, 0);
  return waxCost + scentCost + r.jar.unitCost + r.sticker.unitCost;
}
