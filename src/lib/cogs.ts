import { prisma } from "@/lib/prisma";

export async function computeCogsForRecipe(userId: string, recipeId: string): Promise<number> {
  const r = await prisma.recipe.findFirst({
    where: { id: recipeId, userId },
    include: { items: { include: { item: true } } },
  });
  if (!r) throw new Error("Recipe not found");
  return r.items.reduce((s, x) => s + x.qty * x.item.unitCost, 0);
}
