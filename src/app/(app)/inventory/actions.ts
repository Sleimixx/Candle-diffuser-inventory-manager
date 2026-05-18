"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

function n(v: FormDataEntryValue | null, fallback = 0) {
  const x = parseFloat(String(v ?? ""));
  return Number.isFinite(x) ? x : fallback;
}

async function ownsOrThrow<T>(row: T | null, label: string): Promise<T> {
  if (!row) throw new Error(`${label} not found.`);
  return row;
}

export async function createWax(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const isOptional = formData.get("isOptional") === "on";
  await prisma.waxType.create({
    data: {
      userId: user.id,
      name,
      isOptional,
      unitCostPerG: n(formData.get("unitCostPerG")),
      stockGrams:   n(formData.get("stockGrams")),
    },
  });
  revalidatePath("/inventory/wax");
}

export async function updateWax(formData: FormData) {
  const user = await requireUser();
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCostPerG"));
  const add  = n(formData.get("addGrams"));
  await prisma.$transaction(async (tx) => {
    const existing = await ownsOrThrow(await tx.waxType.findFirst({ where: { id, userId: user.id } }), "Wax");
    await tx.waxType.update({ where: { id: existing.id }, data: { unitCostPerG: cost } });
    if (add !== 0) {
      await tx.waxType.update({ where: { id: existing.id }, data: { stockGrams: { increment: add } } });
      await tx.stockAdjustment.create({ data: { userId: user.id, itemType: "wax", itemId: existing.id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory/wax");
}

export async function deleteWax(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const wax = await ownsOrThrow(await prisma.waxType.findFirst({ where: { id, userId: user.id } }), "Wax");
  const used = await prisma.recipeWax.count({ where: { waxId: wax.id } });
  if (used > 0) throw new Error("Wax is used by a recipe.");
  await prisma.waxType.delete({ where: { id: wax.id } });
  revalidatePath("/inventory/wax");
}

export async function createScent(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await prisma.scent.create({
    data: {
      userId: user.id,
      name,
      unitCostPerMl: n(formData.get("unitCostPerMl")),
      stockMl:       n(formData.get("stockMl")),
    },
  });
  revalidatePath("/inventory/scents");
}

export async function updateScent(formData: FormData) {
  const user = await requireUser();
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCostPerMl"));
  const add  = n(formData.get("addMl"));
  await prisma.$transaction(async (tx) => {
    const existing = await ownsOrThrow(await tx.scent.findFirst({ where: { id, userId: user.id } }), "Scent");
    await tx.scent.update({ where: { id: existing.id }, data: { unitCostPerMl: cost } });
    if (add !== 0) {
      await tx.scent.update({ where: { id: existing.id }, data: { stockMl: { increment: add } } });
      await tx.stockAdjustment.create({ data: { userId: user.id, itemType: "scent", itemId: existing.id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory/scents");
}

export async function deleteScent(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const scent = await ownsOrThrow(await prisma.scent.findFirst({ where: { id, userId: user.id } }), "Scent");
  const used = await prisma.recipeScent.count({ where: { scentId: scent.id } });
  if (used > 0) throw new Error("Scent is in use by a recipe.");
  await prisma.scent.delete({ where: { id: scent.id } });
  revalidatePath("/inventory/scents");
}

export async function createWick(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await prisma.wick.create({
    data: {
      userId: user.id,
      name,
      unitCost: n(formData.get("unitCost")),
      stockQty: Math.trunc(n(formData.get("stockQty"))),
    },
  });
  revalidatePath("/inventory/wicks");
}

export async function updateWick(formData: FormData) {
  const user = await requireUser();
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCost"));
  const add  = Math.trunc(n(formData.get("addQty")));
  await prisma.$transaction(async (tx) => {
    const existing = await ownsOrThrow(await tx.wick.findFirst({ where: { id, userId: user.id } }), "Wick");
    await tx.wick.update({ where: { id: existing.id }, data: { unitCost: cost } });
    if (add !== 0) {
      await tx.wick.update({ where: { id: existing.id }, data: { stockQty: { increment: add } } });
      await tx.stockAdjustment.create({ data: { userId: user.id, itemType: "wick", itemId: existing.id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory/wicks");
}

export async function deleteWick(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const wick = await ownsOrThrow(await prisma.wick.findFirst({ where: { id, userId: user.id } }), "Wick");
  await prisma.wick.delete({ where: { id: wick.id } });
  revalidatePath("/inventory/wicks");
}

export async function updateJar(formData: FormData) {
  const user = await requireUser();
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCost"));
  const add  = Math.trunc(n(formData.get("addQty")));
  await prisma.$transaction(async (tx) => {
    const existing = await ownsOrThrow(await tx.jar.findFirst({ where: { id, userId: user.id } }), "Jar");
    await tx.jar.update({ where: { id: existing.id }, data: { unitCost: cost } });
    if (add !== 0) {
      await tx.jar.update({ where: { id: existing.id }, data: { stockQty: { increment: add } } });
      await tx.stockAdjustment.create({ data: { userId: user.id, itemType: "jar", itemId: existing.id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory/jars");
}

export async function updateSticker(formData: FormData) {
  const user = await requireUser();
  const id   = String(formData.get("id"));
  const cost = n(formData.get("unitCost"));
  const add  = Math.trunc(n(formData.get("addQty")));
  await prisma.$transaction(async (tx) => {
    const existing = await ownsOrThrow(await tx.sticker.findFirst({ where: { id, userId: user.id } }), "Sticker");
    await tx.sticker.update({ where: { id: existing.id }, data: { unitCost: cost } });
    if (add !== 0) {
      await tx.sticker.update({ where: { id: existing.id }, data: { stockQty: { increment: add } } });
      await tx.stockAdjustment.create({ data: { userId: user.id, itemType: "sticker", itemId: existing.id, delta: add, reason: "restock" } });
    }
  });
  revalidatePath("/inventory/stickers");
}
