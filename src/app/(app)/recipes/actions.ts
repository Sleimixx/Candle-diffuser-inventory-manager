"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

function n(v: FormDataEntryValue | null, fallback = 0) {
  const x = parseFloat(String(v ?? ""));
  return Number.isFinite(x) ? x : fallback;
}

export async function upsertRecipe(formData: FormData) {
  const user = await requireUser();
  const id        = (formData.get("id") as string) || null;
  const name      = String(formData.get("name") || "").trim();
  const salePrice = n(formData.get("salePrice"));
  const notes     = String(formData.get("notes") || "") || null;

  if (!name) throw new Error("Name required.");

  const items: { itemId: string; qty: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("item_")) continue;
    const v = n(value as FormDataEntryValue);
    if (v <= 0) continue;
    items.push({ itemId: key.slice(5), qty: v });
  }
  if (items.length === 0) throw new Error("Add at least one item to the recipe.");

  const ownedCount = await prisma.item.count({
    where: { userId: user.id, id: { in: items.map((x) => x.itemId) } },
  });
  if (ownedCount !== items.length) throw new Error("Unknown item.");

  await prisma.$transaction(async (tx) => {
    let recipeId = id;
    if (recipeId) {
      const existing = await tx.recipe.findFirst({ where: { id: recipeId, userId: user.id } });
      if (!existing) throw new Error("Recipe not found.");
      await tx.recipe.update({
        where: { id: existing.id },
        data: { name, salePrice, notes },
      });
      await tx.recipeItem.deleteMany({ where: { recipeId: existing.id } });
      recipeId = existing.id;
    } else {
      const created = await tx.recipe.create({
        data: { userId: user.id, name, salePrice, notes },
      });
      recipeId = created.id;
    }
    await tx.recipeItem.createMany({
      data: items.map((x) => ({ ...x, recipeId: recipeId! })),
    });
  });

  revalidatePath("/recipes");
}

export async function deleteRecipe(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const recipe = await prisma.recipe.findFirst({ where: { id, userId: user.id } });
  if (!recipe) throw new Error("Recipe not found.");
  const used = await prisma.productionRun.count({ where: { recipeId: recipe.id } });
  if (used > 0) throw new Error("Recipe has production runs; cannot delete.");
  await prisma.recipe.delete({ where: { id: recipe.id } });
  revalidatePath("/recipes");
}
