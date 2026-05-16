"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { JarSize, LineColor, WickType } from "@/lib/constants";

function n(v: FormDataEntryValue | null, fallback = 0) {
  const x = parseFloat(String(v ?? ""));
  return Number.isFinite(x) ? x : fallback;
}

export async function updateWax(formData: FormData) {
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCostPerG"));
  const add  = n(formData.get("addGrams"));
  await prisma.$transaction(async (tx) => {
    await tx.waxType.update({ where: { id }, data: { unitCostPerG: cost } });
    if (add !== 0) {
      await tx.waxType.update({ where: { id }, data: { stockGrams: { increment: add } } });
      await tx.stockAdjustment.create({ data: { itemType: "wax", itemId: id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory");
}

export async function createScent(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await prisma.scent.create({
    data: {
      name,
      unitCostPerMl: n(formData.get("unitCostPerMl")),
      stockMl: n(formData.get("stockMl")),
    },
  });
  revalidatePath("/inventory");
}

export async function updateScent(formData: FormData) {
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCostPerMl"));
  const add  = n(formData.get("addMl"));
  await prisma.$transaction(async (tx) => {
    await tx.scent.update({ where: { id }, data: { unitCostPerMl: cost } });
    if (add !== 0) {
      await tx.scent.update({ where: { id }, data: { stockMl: { increment: add } } });
      await tx.stockAdjustment.create({ data: { itemType: "scent", itemId: id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory");
}

export async function deleteScent(formData: FormData) {
  const id = String(formData.get("id"));
  // Block delete if any recipe references this scent.
  const used = await prisma.recipeScent.count({ where: { scentId: id } });
  if (used > 0) throw new Error("Scent is in use by a recipe.");
  await prisma.scent.delete({ where: { id } });
  revalidatePath("/inventory");
}

export async function updateWick(formData: FormData) {
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCost"));
  const add  = Math.trunc(n(formData.get("addQty")));
  await prisma.$transaction(async (tx) => {
    await tx.wick.update({ where: { id }, data: { unitCost: cost } });
    if (add !== 0) {
      await tx.wick.update({ where: { id }, data: { stockQty: { increment: add } } });
      await tx.stockAdjustment.create({ data: { itemType: "wick", itemId: id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory");
}

export async function updateWickSticker(formData: FormData) {
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCost"));
  const add  = Math.trunc(n(formData.get("addQty")));
  await prisma.$transaction(async (tx) => {
    await tx.wickSticker.update({ where: { id }, data: { unitCost: cost } });
    if (add !== 0) {
      await tx.wickSticker.update({ where: { id }, data: { stockQty: { increment: add } } });
      await tx.stockAdjustment.create({ data: { itemType: "wickSticker", itemId: id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory");
}

export async function updateJar(formData: FormData) {
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCost"));
  const add  = Math.trunc(n(formData.get("addQty")));
  await prisma.$transaction(async (tx) => {
    await tx.jar.update({ where: { id }, data: { unitCost: cost } });
    if (add !== 0) {
      await tx.jar.update({ where: { id }, data: { stockQty: { increment: add } } });
      await tx.stockAdjustment.create({ data: { itemType: "jar", itemId: id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory");
}

export async function updateSticker(formData: FormData) {
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCost"));
  const add  = Math.trunc(n(formData.get("addQty")));
  await prisma.$transaction(async (tx) => {
    await tx.sticker.update({ where: { id }, data: { unitCost: cost } });
    if (add !== 0) {
      await tx.sticker.update({ where: { id }, data: { stockQty: { increment: add } } });
      await tx.stockAdjustment.create({ data: { itemType: "sticker", itemId: id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory");
}
