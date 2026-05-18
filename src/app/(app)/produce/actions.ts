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
    const r = await tx.recipe.findFirst({
      where: { id: recipeId, userId: user.id },
      include: { items: { include: { item: { include: { category: true } } } } },
    });
    if (!r) throw new Error("Recipe not found");
    if (r.items.length === 0) throw new Error("Recipe has no items.");

    for (const ri of r.items) {
      const need = ri.qty * quantity;
      if (ri.item.stock < need) {
        throw new Error(`Not enough ${ri.item.name} (need ${need} ${ri.item.category.unit}, have ${ri.item.stock} ${ri.item.category.unit}).`);
      }
    }

    const cogs = r.items.reduce((s, ri) => s + ri.qty * ri.item.unitCost, 0);

    for (const ri of r.items) {
      await tx.item.update({
        where: { id: ri.itemId },
        data: { stock: { decrement: ri.qty * quantity } },
      });
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
