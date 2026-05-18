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
  const jarId     = String(formData.get("jarId") || "");
  const stickerId = String(formData.get("stickerId") || "");
  const salePrice = n(formData.get("salePrice"));
  const notes     = String(formData.get("notes") || "") || null;

  if (!name || !jarId || !stickerId) throw new Error("Missing required fields.");

  const [jar, sticker] = await Promise.all([
    prisma.jar.findFirst({ where: { id: jarId, userId: user.id } }),
    prisma.sticker.findFirst({ where: { id: stickerId, userId: user.id } }),
  ]);
  if (!jar || !sticker) throw new Error("Invalid jar or sticker.");

  const waxes: { waxId: string; grams: number }[] = [];
  const scents: { scentId: string; ml: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const v = n(value as FormDataEntryValue);
    if (v <= 0) continue;
    if (key.startsWith("wax_"))   waxes.push({ waxId:   key.slice(4),  grams: v });
    if (key.startsWith("scent_")) scents.push({ scentId: key.slice(6), ml:    v });
  }

  if (waxes.length) {
    const ok = await prisma.waxType.count({ where: { userId: user.id, id: { in: waxes.map((w) => w.waxId) } } });
    if (ok !== waxes.length) throw new Error("Unknown wax.");
  }
  if (scents.length) {
    const ok = await prisma.scent.count({ where: { userId: user.id, id: { in: scents.map((s) => s.scentId) } } });
    if (ok !== scents.length) throw new Error("Unknown scent.");
  }

  await prisma.$transaction(async (tx) => {
    let recipeId = id;
    if (recipeId) {
      const existing = await tx.candleRecipe.findFirst({ where: { id: recipeId, userId: user.id } });
      if (!existing) throw new Error("Recipe not found.");
      await tx.candleRecipe.update({
        where: { id: existing.id },
        data: { name, jarId, stickerId, salePrice, notes },
      });
      await tx.recipeWax.deleteMany({ where: { recipeId: existing.id } });
      await tx.recipeScent.deleteMany({ where: { recipeId: existing.id } });
      recipeId = existing.id;
    } else {
      const created = await tx.candleRecipe.create({
        data: { userId: user.id, name, jarId, stickerId, salePrice, notes },
      });
      recipeId = created.id;
    }
    if (waxes.length) {
      await tx.recipeWax.createMany({
        data: waxes.map((w) => ({ ...w, recipeId: recipeId! })),
      });
    }
    if (scents.length) {
      await tx.recipeScent.createMany({
        data: scents.map((s) => ({ ...s, recipeId: recipeId! })),
      });
    }
  });

  revalidatePath("/recipes");
}

export async function deleteRecipe(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const recipe = await prisma.candleRecipe.findFirst({ where: { id, userId: user.id } });
  if (!recipe) throw new Error("Recipe not found.");
  const used = await prisma.productionRun.count({ where: { recipeId: recipe.id } });
  if (used > 0) throw new Error("Recipe has production runs; cannot delete.");
  await prisma.candleRecipe.delete({ where: { id: recipe.id } });
  revalidatePath("/recipes");
}
