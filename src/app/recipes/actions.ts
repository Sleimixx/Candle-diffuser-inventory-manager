"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { JarSize, LineColor } from "@/lib/constants";

function n(v: FormDataEntryValue | null, fallback = 0) {
  const x = parseFloat(String(v ?? ""));
  return Number.isFinite(x) ? x : fallback;
}

// Form fields:
//   name, jarSize, color, salePrice
//   wax_<waxId>     (grams; blank or 0 means not used)
//   scent_<scentId> (ml; blank or 0 means not in blend)
export async function upsertRecipe(formData: FormData) {
  const id        = (formData.get("id") as string) || null;
  const name      = String(formData.get("name") || "").trim();
  const jarSize   = formData.get("jarSize") as JarSize;
  const color     = formData.get("color") as LineColor;
  const salePrice = n(formData.get("salePrice"));
  const notes     = String(formData.get("notes") || "") || null;

  if (!name || !jarSize || !color) throw new Error("Missing required fields.");

  const waxes: { waxId: string; grams: number }[] = [];
  const scents: { scentId: string; ml: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const v = n(value as any);
    if (v <= 0) continue;
    if (key.startsWith("wax_"))   waxes.push({ waxId:   key.slice(4),  grams: v });
    if (key.startsWith("scent_")) scents.push({ scentId: key.slice(6), ml:    v });
  }

  await prisma.$transaction(async (tx) => {
    let recipeId = id;
    if (recipeId) {
      await tx.candleRecipe.update({
        where: { id: recipeId },
        data: { name, jarSize, color, salePrice, notes },
      });
      await tx.recipeWax.deleteMany({ where: { recipeId } });
      await tx.recipeScent.deleteMany({ where: { recipeId } });
    } else {
      const created = await tx.candleRecipe.create({
        data: { name, jarSize, color, salePrice, notes },
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
  const id = String(formData.get("id"));
  const used = await prisma.productionRun.count({ where: { recipeId: id } });
  if (used > 0) throw new Error("Recipe has production runs; cannot delete.");
  await prisma.candleRecipe.delete({ where: { id } });
  revalidatePath("/recipes");
}
