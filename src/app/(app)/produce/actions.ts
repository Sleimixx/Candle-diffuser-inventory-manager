"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function runProduction(formData: FormData) {
  const user = await requireUser();
  const recipeId = String(formData.get("recipeId"));
  const quantity = Math.max(1, Math.trunc(parseFloat(String(formData.get("quantity") || "0"))));
  if (!recipeId || !quantity) throw new Error("Missing recipe or quantity.");

  await prisma.$transaction(async (tx) => {
    const r = await tx.candleRecipe.findFirst({
      where: { id: recipeId, userId: user.id },
      include: { waxes: { include: { wax: true } }, scents: { include: { scent: true } } },
    });
    if (!r) throw new Error("Recipe not found");

    const [jar, sticker] = await Promise.all([
      tx.jar.findFirst({ where: { id: r.jarId, userId: user.id } }),
      tx.sticker.findFirst({ where: { id: r.stickerId, userId: user.id } }),
    ]);
    if (!jar || !sticker) throw new Error("Missing jar or sticker for this recipe.");

    if (jar.stockQty     < quantity) throw new Error(`Not enough jars (need ${quantity}, have ${jar.stockQty}).`);
    if (sticker.stockQty < quantity) throw new Error(`Not enough stickers (need ${quantity}, have ${sticker.stockQty}).`);

    for (const rw of r.waxes) {
      const need = rw.grams * quantity;
      if (rw.wax.stockGrams < need) throw new Error(`Not enough ${rw.wax.name} (need ${need} g, have ${rw.wax.stockGrams} g).`);
    }
    for (const rs of r.scents) {
      const need = rs.ml * quantity;
      if (rs.scent.stockMl < need) throw new Error(`Not enough ${rs.scent.name} (need ${need} ml, have ${rs.scent.stockMl} ml).`);
    }

    const waxCost = r.waxes.reduce((s, w)  => s + w.grams * w.wax.unitCostPerG, 0);
    const scnCost = r.scents.reduce((s, x) => s + x.ml    * x.scent.unitCostPerMl, 0);
    const cogs    = waxCost + scnCost + jar.unitCost + sticker.unitCost;

    await tx.jar.update({ where: { id: jar.id },         data: { stockQty: { decrement: quantity } } });
    await tx.sticker.update({ where: { id: sticker.id }, data: { stockQty: { decrement: quantity } } });
    for (const rw of r.waxes) {
      await tx.waxType.update({ where: { id: rw.waxId }, data: { stockGrams: { decrement: rw.grams * quantity } } });
    }
    for (const rs of r.scents) {
      await tx.scent.update({ where: { id: rs.scentId }, data: { stockMl: { decrement: rs.ml * quantity } } });
    }

    await tx.productionRun.create({
      data: { userId: user.id, recipeId: r.id, quantity, cogsPerUnit: cogs },
    });
  });

  revalidatePath("/produce");
  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/");
}
